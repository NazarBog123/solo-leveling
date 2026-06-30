import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchQuests, markQuestCompleted, runDailyResetIfNeeded } from '@/services/questService'
import type { Quest } from '@/types'
import Timer from './Timer'

type Status = 'initializing' | 'loading' | 'idle' | 'completing' | 'error'

function pickTrack(playlist: { link: string; chance: number }[], lastLink?: string): string {
	const defaultChance = 100 / playlist.filter((t) => t.chance === 0).length

	const weighted = playlist.map((t) => ({
		link: t.link,
		weight: t.chance === 0 ? defaultChance : t.chance,
	}))

	const total = weighted.reduce((sum, t) => sum + t.weight, 0)

	let attempts = 0
	while (attempts < 10) {
		const rand = Math.random() * total
		let cumulative = 0
		for (const t of weighted) {
			cumulative += t.weight
			if (rand <= cumulative) {
				if (t.link !== lastLink) return t.link
				break
			}
		}
		attempts++
	}

	// fallback: return anything that isn't the last track
	return weighted.find((t) => t.link !== lastLink)?.link ?? weighted[0].link
}

export function Home() {
	const [quests, setQuests] = useState<Quest[]>([])
	const [status, setStatus] = useState<Status>('initializing')
	const [completingId, setCompletingId] = useState<number | null>(null)
	const [showIntro, setShowIntro] = useState(true)
	const introRef = useRef<HTMLVideoElement | null>(null)

	const bgFirstPartVideoRef = useRef<HTMLVideoElement | null>(null)
	const bgSecondPartVideoRef = useRef<HTMLVideoElement | null>(null)
	const bgFirstPartAudioRef = useRef<HTMLAudioElement | null>(null)
	const [bgPart, setBgPart] = useState<'none' | 'first' | 'second'>('none')

	const handleIntroEnd = async () => {
		setShowIntro(false)

		setBgPart('first')

		const video = bgFirstPartVideoRef.current
		const audio = bgFirstPartAudioRef.current

		if (video && audio) {
			video.currentTime = 0
			audio.currentTime = 0

			video.volume = 0
			audio.volume = 0.5

			try {
				await Promise.all([video.play(), audio.play()])
			} catch (e) {
				console.error(e)
			}
		}
	}

	const handleBgPart1End = async () => {
		const video = bgSecondPartVideoRef.current
		setBgPart('second')
		if (video) {
			video.currentTime = 0
			video.playbackRate = 0.9
			try {
				await video.play()
			} catch (e) {
				console.error(e)
			}
		}

		// start music ONLY here (important: single trigger point)
		playNext()
	}

	const loadQuests = useCallback(async () => {
		setStatus('loading')
		try {
			const data = await fetchQuests()
			setQuests(data)
			setStatus('idle')
		} catch {
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

	useEffect(() => {
		if (introRef.current) {
			introRef.current.volume = 0.3 // 0.0 → 1.0
		}
	}, [])

	const handleComplete = async (quest: Quest) => {
		if (quest.completed || completingId !== null) return
		setCompletingId(quest.id)
		setStatus('completing')
		try {
			await markQuestCompleted(quest.id)
			setQuests((prev) => prev.map((q) => (q.id === quest.id ? { ...q, completed: true } : q)))
		} catch {
		} finally {
			setCompletingId(null)
			setStatus('idle')
		}
	}

	const playlist = [
		{ link: './music/dark-aria.mp3', chance: 3.5 },
		{ link: './music/level.mp3', chance: 3.5 },
		{ link: './music/reawaker.mp3', chance: 3.5 },
		{ link: './music/request.mp3', chance: 3.5 },
		{ link: './music/reviver.mp3', chance: 3.5 },
		{ link: './music/shadowborn.mp3', chance: 3.5 },
		// { link: './music/un-apex.mp3', chance: 1 },
		{ link: './music/suite-1.mp3', chance: 0 },
		{ link: './music/suite-2.mp3', chance: 0 },
		{ link: './music/suite-3.mp3', chance: 0 },
		{ link: './music/suite-4.mp3', chance: 0 },
		{ link: './music/suite-5.mp3', chance: 0 },
		{ link: './music/suite-6.mp3', chance: 0 },
		{ link: './music/suite-7.mp3', chance: 0 },
		{ link: './music/suite-8.mp3', chance: 1 },
		{ link: './music/suite-9.mp3', chance: 0 },
		{ link: './music/suite-10.mp3', chance: 0 },
		{ link: './music/suite-11-dungeon.mp3', chance: 0 },
		{ link: './music/suite-12-ksk-gate.mp3', chance: 0 },
		{ link: './music/suite-13-hunter-monster.mp3', chance: 0 },
		{ link: './music/suite-14-am-km.mp3', chance: 0 },
		{ link: './music/suite-15-everyday-lv0.mp3', chance: 0 },
		{ link: './music/suite-16-aikari.mp3', chance: 0 },
		{ link: './music/suite-17-onlyore.mp3', chance: 0 },
	]

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const currentTrackRef = useRef<string | undefined>(undefined)
	const isPlayingRef = useRef(false)

	const playNext = useCallback(() => {
		if (!audioRef.current || isPlayingRef.current) return

		const track = pickTrack(playlist, currentTrackRef.current)
		currentTrackRef.current = track

		isPlayingRef.current = true

		audioRef.current.src = track
		audioRef.current.volume = 0.1

		audioRef.current
			.play()
			.catch(console.error)
			.finally(() => {
				isPlayingRef.current = false
			})
	}, [])

	useEffect(() => {
		const video = bgSecondPartVideoRef.current
		if (!video) return

		let raf = 0

		const tick = () => {
			// Restart about one frame before the end (24 fps ≈ 0.042 s)
			if (video.duration && !video.paused && video.currentTime >= video.duration - 0.04) {
				video.currentTime = 0

				video.play().catch(() => {})
			}

			raf = requestAnimationFrame(tick)
		}

		video.addEventListener('play', tick)

		return () => {
			cancelAnimationFrame(raf)
			video.removeEventListener('play', tick)
		}
	}, [])

	return (
		<main className='app-main'>
			{showIntro && (
				<div className='intro-overlay'>
					<video
						ref={introRef}
						className='intro-video'
						src='./video-startup.mp4'
						autoPlay
						playsInline
						onEnded={() => {
							setShowIntro(false)
							handleIntroEnd()
						}}
					/>
				</div>
			)}
			<audio ref={audioRef} onEnded={playNext} />
			<audio ref={bgFirstPartAudioRef} src='./bg/bg-part-1-audio.mp3' />
			<div className='bg'>
				<video ref={bgFirstPartVideoRef} src='./bg/bg-part-1.mp4' playsInline muted onEnded={handleBgPart1End} style={{ display: bgPart === 'first' ? 'block' : 'none' }} />
				<video ref={bgSecondPartVideoRef} src='./bg/bg-part-2.mp4' playsInline muted style={{ display: bgPart === 'second' ? 'block' : 'none' }} />
			</div>
			<div className={`container ${!showIntro ? 'container_show' : ''}`}>
				<h1 className='page-title' data-text='QUEST INFO'>
					QUEST INFO
				</h1>

				{status !== 'initializing' && quests.length > 0 && (
					<ul className='quest-list'>
						{quests.map((quest) => (
							<li key={quest.id} className={['quest-item', quest.completed ? 'quest-item-completed' : '', completingId === quest.id ? 'quest-item-completing' : ''].join(' ').trim()}>
								<div className='quest-info'>
									<span className='quest-text glow-text'>
										{quest.text.split('-').map((part, i, arr) => (
											<>
												{part}
												{i < arr.length - 1 && <strong>-</strong>}
											</>
										))}
									</span>
									<span className='quest-amount glow-text'>
										[{quest.completed ? quest.amount : 0}/{quest.amount}
										{quest.metric}]
									</span>
								</div>
								<button
									className='checkbox-btn'
									onClick={() => handleComplete(quest)}
									disabled={quest.completed || completingId !== null}
									aria-label={quest.completed ? `${quest.text} — completed` : `Mark ${quest.text} as complete`}
								>
									<span className={quest.completed ? 'checkbox-box checkbox-box-checked' : 'checkbox-box'} aria-hidden='true'>
										{completingId === quest.id ? (
											<span />
										) : quest.completed ? (
											<svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
												<path d='M2 6l3 3 5-5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
											</svg>
										) : null}
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
				<p className='warning glow-text'>
					<span className='warning__bold'>WARNING:</span> Failure to complete
					<br />
					the daily quest will result in
					<br />
					an appropriate <span className='red'>penalty</span>.
				</p>
				<div className='timer'>
					<Timer />
				</div>
			</div>
		</main>
	)
}
