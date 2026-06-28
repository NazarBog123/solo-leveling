import { useEffect, useState, useCallback } from 'react'
import { fetchQuests, markQuestCompleted, runDailyResetIfNeeded } from '@/services/questService'
import type { Quest } from '@/types'

type Status = 'initializing' | 'loading' | 'idle' | 'completing' | 'error'

export function Home() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [status, setStatus] = useState<Status>('initializing')
  const [error, setError] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<number | null>(null)

  const loadQuests = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await fetchQuests()
      setQuests(data)
      setStatus('idle')
    } catch {
      setError('Failed to load quests.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        await runDailyResetIfNeeded()
      } catch (err) {
        console.error('Reset check failed:', err)
      }
      await loadQuests()
    }
    init()
  }, [loadQuests])

  const handleComplete = async (quest: Quest) => {
    if (quest.completed || completingId !== null) return
    setCompletingId(quest.id)
    setStatus('completing')
    try {
      await markQuestCompleted(quest.id)
      setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: true } : q))
    } catch {
      setError('Failed to update quest.')
    } finally {
      setCompletingId(null)
      setStatus('idle')
    }
  }

  const completedCount = quests.filter(q => q.completed).length
  const totalCount = quests.length
  const allDone = totalCount > 0 && completedCount === totalCount
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <main className="app-main">
      <div className="app-container">

        <div className="page-header">
          <h1 className="page-title">Daily Quests</h1>
          {status !== 'initializing' && totalCount > 0 && (
            <span className="page-counter">{completedCount} / {totalCount}</span>
          )}
        </div>

        {status !== 'initializing' && totalCount > 0 && (
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={allDone ? 'progress-fill progress-fill-done' : 'progress-fill'}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {status === 'initializing' && (
          <div className="state">
            <div className="spinner" />
            <p>Loading your quests…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="state">
            <p className="state-error">{error}</p>
            <button className="retry-btn" onClick={loadQuests}>Retry</button>
          </div>
        )}

        {status !== 'initializing' && quests.length > 0 && (
          <ul className="quest-list">
            {quests.map(quest => (
              <li
                key={quest.id}
                className={[
                  'quest-item',
                  quest.completed ? 'quest-item-completed' : '',
                  completingId === quest.id ? 'quest-item-completing' : '',
                ].join(' ').trim()}
              >
                <button
                  className="checkbox-btn"
                  onClick={() => handleComplete(quest)}
                  disabled={quest.completed || completingId !== null}
                  aria-label={quest.completed ? `${quest.text} — completed` : `Mark ${quest.text} as complete`}
                >
                  <span className={quest.completed ? 'checkbox-box checkbox-box-checked' : 'checkbox-box'} aria-hidden="true">
                    {completingId === quest.id
                      ? <span className="mini-spinner" />
                      : quest.completed
                        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : null
                    }
                  </span>
                </button>

                <div className="quest-info">
                  <span className="quest-text">{quest.text}</span>
                  <span className="quest-amount">{quest.amount}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {allDone && (
          <div className="all-done">
            <span className="all-done-icon">✦</span>
            <p className="all-done-text">All quests complete. Day secured.</p>
          </div>
        )}

        {status === 'idle' && quests.length === 0 && (
          <div className="state">
            <p>No quests found.</p>
          </div>
        )}

      </div>
    </main>
  )
}
