import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchQuests, markQuestCompleted, runDailyResetIfNeeded } from '@/services/questService'
import type { Quest } from '@/types'
import Timer from './Timer'
import { fetchDays } from '@/services/questService'
import type { Day } from '@/types'

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

	return weighted.find((t) => t.link !== lastLink)?.link ?? weighted[0].link
}

export function Home() {
	const [quests, setQuests] = useState<Quest[]>([])
	const [status, setStatus] = useState<Status>('initializing')
	const [completingId, setCompletingId] = useState<number | null>(null)
	const [showIntro, setShowIntro] = useState(true)
	const [days, setDays] = useState<Day[]>([])
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

		playNext()
	}

	const loadData = useCallback(async () => {
		setStatus('loading')

		try {
			const [quests, days] = await Promise.all([fetchQuests(), fetchDays()])

			setQuests(quests)
			setDays(days)

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
			await loadData()
		}
		init()
	}, [loadData])

	useEffect(() => {
		if (introRef.current) {
			introRef.current.volume = 0.3
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

	const lastDayCompleted = days[0]?.completed ?? true
	const completedDaysCount = days.filter((day) => day.completed).length
	const [profile, setProfile] = useState(false)

	return (
		<main className='app-main'>
			<button
				className='hidden-btn hidden-btn_topleft'
				onClick={() => {
					setProfile(!profile)
				}}
			></button>
			<button className='hidden-btn hidden-btn_topright' onClick={playNext}></button>
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
			{profile ? (
				<div className='profile'>
					<h1 className='page-title profile__title'>{completedDaysCount}</h1>
					<div className='profile__list'>
						{days.map((day) => (
							<svg key={day.id} width='800px' height='800px' viewBox='0 0 24 24' fill='none'>
								<path
									d='M18 20.75H6C5.27065 20.75 4.57118 20.4603 4.05546 19.9445C3.53973 19.4288 3.25 18.7293 3.25 18V6C3.25 5.27065 3.53973 4.57118 4.05546 4.05546C4.57118 3.53973 5.27065 3.25 6 3.25H14.86C15.0589 3.25 15.2497 3.32902 15.3903 3.46967C15.531 3.61032 15.61 3.80109 15.61 4C15.61 4.19891 15.531 4.38968 15.3903 4.53033C15.2497 4.67098 15.0589 4.75 14.86 4.75H6C5.66848 4.75 5.35054 4.8817 5.11612 5.11612C4.8817 5.35054 4.75 5.66848 4.75 6V18C4.75 18.3315 4.8817 18.6495 5.11612 18.8839C5.35054 19.1183 5.66848 19.25 6 19.25H18C18.3315 19.25 18.6495 19.1183 18.8839 18.8839C19.1183 18.6495 19.25 18.3315 19.25 18V10.29C19.25 10.0911 19.329 9.90032 19.4697 9.75967C19.6103 9.61902 19.8011 9.54 20 9.54C20.1989 9.54 20.3897 9.61902 20.5303 9.75967C20.671 9.90032 20.75 10.0911 20.75 10.29V18C20.75 18.7293 20.4603 19.4288 19.9445 19.9445C19.4288 20.4603 18.7293 20.75 18 20.75Z'
									fill='#EEF2F6'
								/>
								<path
									d='M10.5 15.25C10.3071 15.2352 10.1276 15.1455 10 15L7.00001 12C6.93317 11.86 6.91136 11.7028 6.93759 11.5499C6.96382 11.3971 7.03679 11.2561 7.14646 11.1464C7.25613 11.0368 7.3971 10.9638 7.54996 10.9376C7.70282 10.9113 7.86006 10.9331 8.00001 11L10.47 13.47L19 4.99998C19.14 4.93314 19.2972 4.91133 19.4501 4.93756C19.6029 4.96379 19.7439 5.03676 19.8536 5.14643C19.9632 5.2561 20.0362 5.39707 20.0624 5.54993C20.0887 5.70279 20.0669 5.86003 20 5.99998L11 15C10.8724 15.1455 10.693 15.2352 10.5 15.25Z'
									fill={day.completed ? '#EEF2F6' : 'transparent'}
								/>
							</svg>
						))}
					</div>
				</div>
			) : (
				<div className={`container ${!showIntro ? 'container_show' : ''}`}>
					<h1 className='page-title'>QUEST INFO</h1>

					{status !== 'initializing' && quests.length > 0 && (
						<>
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
											<span className={`quest-amount glow-text ${!lastDayCompleted && quest.text == 'Running' && !quest.completed ? 'red' : ''}`}>
												[<span className='caros'>{quest.completed ? (!lastDayCompleted && quest.text == 'Running' ? +quest.amount * 2 : quest.amount) : 0}</span>/
												<span className='caros'>{!lastDayCompleted && quest.text == 'Running' ? +quest.amount * 2 : quest.amount}</span>
												{quest.metric}]
											</span>
										</div>
										<button
											className='checkbox-btn'
											onClick={() => handleComplete(quest)}
											disabled={quest.completed || completingId !== null}
											aria-label={quest.completed ? `${quest.text} — completed` : `Mark ${quest.text} as complete`}
										>
											<svg width='800px' height='800px' viewBox='0 0 24 24' fill='none'>
												<path
													d='M18 20.75H6C5.27065 20.75 4.57118 20.4603 4.05546 19.9445C3.53973 19.4288 3.25 18.7293 3.25 18V6C3.25 5.27065 3.53973 4.57118 4.05546 4.05546C4.57118 3.53973 5.27065 3.25 6 3.25H14.86C15.0589 3.25 15.2497 3.32902 15.3903 3.46967C15.531 3.61032 15.61 3.80109 15.61 4C15.61 4.19891 15.531 4.38968 15.3903 4.53033C15.2497 4.67098 15.0589 4.75 14.86 4.75H6C5.66848 4.75 5.35054 4.8817 5.11612 5.11612C4.8817 5.35054 4.75 5.66848 4.75 6V18C4.75 18.3315 4.8817 18.6495 5.11612 18.8839C5.35054 19.1183 5.66848 19.25 6 19.25H18C18.3315 19.25 18.6495 19.1183 18.8839 18.8839C19.1183 18.6495 19.25 18.3315 19.25 18V10.29C19.25 10.0911 19.329 9.90032 19.4697 9.75967C19.6103 9.61902 19.8011 9.54 20 9.54C20.1989 9.54 20.3897 9.61902 20.5303 9.75967C20.671 9.90032 20.75 10.0911 20.75 10.29V18C20.75 18.7293 20.4603 19.4288 19.9445 19.9445C19.4288 20.4603 18.7293 20.75 18 20.75Z'
													fill='#EEF2F6'
												/>
												<path
													d='M10.5 15.25C10.3071 15.2352 10.1276 15.1455 10 15L7.00001 12C6.93317 11.86 6.91136 11.7028 6.93759 11.5499C6.96382 11.3971 7.03679 11.2561 7.14646 11.1464C7.25613 11.0368 7.3971 10.9638 7.54996 10.9376C7.70282 10.9113 7.86006 10.9331 8.00001 11L10.47 13.47L19 4.99998C19.14 4.93314 19.2972 4.91133 19.4501 4.93756C19.6029 4.96379 19.7439 5.03676 19.8536 5.14643C19.9632 5.2561 20.0362 5.39707 20.0624 5.54993C20.0887 5.70279 20.0669 5.86003 20 5.99998L11 15C10.8724 15.1455 10.693 15.2352 10.5 15.25Z'
													fill={`${quest.completed ? '#EEF2F6' : 'transparent'}`}
												/>
											</svg>
										</button>
									</li>
								))}
							</ul>
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
						</>
					)}
				</div>
			)}
		</main>
	)
}
