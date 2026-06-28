import { supabase } from './supabase'
import type { Quest, Reset } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns today's date string in user's local timezone: "YYYY-MM-DD" */
export function todayLocalDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Formats quests array into the days.quests column string */
function formatQuestsString(quests: Quest[]): string {
  return quests
    .map((q, i) => `${i + 1}. ${q.text} - ${q.amount} ${q.completed}`)
    .join('; ')
}

// ─── Quest queries ───────────────────────────────────────────────────────────

export async function fetchQuests(): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('id', { ascending: true })

  if (error) throw error
  return data as Quest[]
}

export async function markQuestCompleted(id: number): Promise<void> {
  const { error } = await supabase
    .from('quests')
    .update({ completed: true })
    .eq('id', id)

  if (error) throw error
}

export async function resetAllQuests(): Promise<void> {
  const { error } = await supabase
    .from('quests')
    .update({ completed: false })
    .neq('id', 0) // target all rows

  if (error) throw error
}

// ─── Reset / Day logic ───────────────────────────────────────────────────────

/** Gets the latest reset row, or null if none exist */
export async function getLastReset(): Promise<Reset | null> {
  const { data, error } = await supabase
    .from('reset')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as Reset | null
}

/**
 * Runs on every app load.
 * - Checks if a reset has already been logged for today.
 * - If not: snapshot quests → insert day row → insert reset row → reset quests.
 */
export async function runDailyResetIfNeeded(): Promise<void> {
  const today = todayLocalDate()

  const lastReset = await getLastReset()

  // Already reset today — nothing to do
  if (lastReset?.date === today) return

  // ── Snapshot current quest state before resetting ──────────────────────────
  const quests = await fetchQuests()

  const allCompleted = quests.length > 0 && quests.every(q => q.completed)
  const questsString = formatQuestsString(quests)

  // The "day" being closed is the date of the last reset (or yesterday if first ever)
  const closingDate = lastReset?.date ?? (() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().slice(0, 10)
  })()

  // ── Insert day record ──────────────────────────────────────────────────────
  const { error: dayError } = await supabase
    .from('days')
    .insert({
      date: closingDate,
      completed: allCompleted,
      quests: questsString,
    })

  if (dayError) throw dayError

  // ── Insert reset record ────────────────────────────────────────────────────
  const { error: resetError } = await supabase
    .from('reset')
    .insert({ date: today })

  if (resetError) throw resetError

  // ── Reset all quests to incomplete ────────────────────────────────────────
  await resetAllQuests()
}
