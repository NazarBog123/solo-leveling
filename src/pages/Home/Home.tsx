import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchQuests, markQuestCompleted, runDailyResetIfNeeded } from '@/services/questService'
import type { Quest } from '@/types'

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
		{ link: '/music/dark-aria.mp3', chance: 3.5 },
		{ link: '/music/level.mp3', chance: 3.5 },
		{ link: '/music/reawaker.mp3', chance: 3.5 },
		{ link: '/music/request.mp3', chance: 3.5 },
		{ link: '/music/reviver.mp3', chance: 3.5 },
		{ link: '/music/shadowborn.mp3', chance: 3.5 },
		// { link: '/music/un-apex.mp3', chance: 1 },
		{ link: '/music/suite-1.mp3', chance: 0 },
		{ link: '/music/suite-2.mp3', chance: 0 },
		{ link: '/music/suite-3.mp3', chance: 0 },
		{ link: '/music/suite-4.mp3', chance: 0 },
		{ link: '/music/suite-5.mp3', chance: 0 },
		{ link: '/music/suite-6.mp3', chance: 0 },
		{ link: '/music/suite-7.mp3', chance: 0 },
		{ link: '/music/suite-8.mp3', chance: 1 },
		{ link: '/music/suite-9.mp3', chance: 0 },
		{ link: '/music/suite-10.mp3', chance: 0 },
		{ link: '/music/suite-11-dungeon.mp3', chance: 0 },
		{ link: '/music/suite-12-ksk-gate.mp3', chance: 0 },
		{ link: '/music/suite-13-hunter-monster.mp3', chance: 0 },
		{ link: '/music/suite-14-am-km.mp3', chance: 0 },
		{ link: '/music/suite-15-everyday-lv0.mp3', chance: 0 },
		{ link: '/music/suite-16-aikari.mp3', chance: 0 },
		{ link: '/music/suite-17-onlyore.mp3', chance: 0 },
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

	return (
		<main className='app-main'>
			{showIntro && (
				<div className='intro-overlay'>
					<video
						ref={introRef}
						className='intro-video'
						src='/video-startup.mp4'
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
			<audio ref={bgFirstPartAudioRef} src='/bg/bg-part-1-audio.mp3' />
			<div className='bg'>
				<video ref={bgFirstPartVideoRef} src='/bg/bg-part-1.mp4' playsInline muted onEnded={handleBgPart1End} style={{ display: bgPart === 'first' ? 'block' : 'none' }} />
				<video ref={bgSecondPartVideoRef} src='/bg/bg-part-2.mp4' playsInline loop muted style={{ display: bgPart === 'second' ? 'block' : 'none' }} />
			</div>
			<div className='app-container'>
				<div className='page-header'>
					<h1 className='page-title' data-text='QUEST INFO'>
						QUEST INFO
					</h1>
				</div>

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
					<svg width='1045' height='1045' viewBox='0 0 1045 1045' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<rect x='550.801' y='988.8' width='57' height='127' rx='16.5' transform='rotate(180 550.801 988.8)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='504.301' y='875.3' width='36' height='100' rx='12' fill='#EEF2F6' />
						<rect x='670.567' y='965.527' width='57' height='127' rx='16.5' transform='rotate(165 670.567 965.527)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='596.275' y='867.93' width='36' height='100' rx='12' transform='rotate(-15 596.275 867.93)' fill='#EEF2F6' />
						<rect x='780.232' y='912.051' width='57' height='127' rx='16.5' transform='rotate(150 780.232 912.051)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='683.213' y='837.007' width='36' height='100' rx='12' transform='rotate(-30 683.213 837.007)' fill='#EEF2F6' />
						<rect x='872.318' y='832.012' width='57' height='127' rx='16.5' transform='rotate(135 872.318 832.012)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='759.182' y='784.636' width='36' height='100' rx='12' transform='rotate(-45 759.182 784.636)' fill='#EEF2F6' />
						<rect x='940.553' y='730.868' width='57' height='127' rx='16.5' transform='rotate(120 940.553 730.868)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='819.008' y='714.389' width='36' height='100' rx='12' transform='rotate(-60 819.008 714.389)' fill='#EEF2F6' />
						<rect x='980.28' y='615.51' width='57' height='127' rx='16.5' transform='rotate(105 980.28 615.51)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='858.611' y='631.049' width='36' height='100' rx='12' transform='rotate(-75 858.611 631.049)' fill='#EEF2F6' />
						<rect x='988.801' y='493.8' width='57' height='127' rx='16.5' transform='rotate(90 988.801 493.8)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='875.301' y='540.3' width='36' height='100' rx='12' transform='rotate(-90 875.301 540.3)' fill='#EEF2F6' />
						<rect x='965.529' y='374.032' width='57' height='127' rx='16.5' transform='rotate(75 965.529 374.032)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='867.932' y='448.323' width='36' height='100' rx='12' transform='rotate(-105 867.932 448.323)' fill='#EEF2F6' />
						<rect x='912.053' y='264.368' width='57' height='127' rx='16.5' transform='rotate(60 912.053 264.368)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='837.008' y='361.389' width='36' height='100' rx='12' transform='rotate(-120 837.008 361.389)' fill='#EEF2F6' />
						<rect x='832.014' y='172.281' width='57' height='127' rx='16.5' transform='rotate(45 832.014 172.281)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='784.637' y='285.419' width='36' height='100' rx='12' transform='rotate(-135 784.637 285.419)' fill='#EEF2F6' />
						<rect x='730.869' y='104.049' width='57' height='127' rx='16.5' transform='rotate(30 730.869 104.049)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='714.389' y='225.593' width='36' height='100' rx='12' transform='rotate(-150 714.389 225.593)' fill='#EEF2F6' />
						<rect x='615.512' y='64.3186' width='57' height='127' rx='16.5' transform='rotate(15 615.512 64.3186)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='631.051' y='185.986' width='36' height='100' rx='12' transform='rotate(-165 631.051 185.986)' fill='#EEF2F6' />
						<rect x='493.801' y='55.7998' width='57' height='127' rx='16.5' stroke='#EEF2F6' stroke-width='3' />
						<rect x='540.301' y='169.3' width='36' height='100' rx='12' transform='rotate(-180 540.301 169.3)' fill='#EEF2F6' />
						<rect x='374.034' y='79.0724' width='57' height='127' rx='16.5' transform='rotate(-15 374.034 79.0724)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='448.326' y='176.67' width='36' height='100' rx='12' transform='rotate(165 448.326 176.67)' fill='#EEF2F6' />
						<rect x='264.369' y='132.549' width='57' height='127' rx='16.5' transform='rotate(-30 264.369 132.549)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='361.389' y='207.593' width='36' height='100' rx='12' transform='rotate(150 361.389 207.593)' fill='#EEF2F6' />
						<rect x='172.283' y='212.588' width='57' height='127' rx='16.5' transform='rotate(-45 172.283 212.588)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='285.42' y='259.964' width='36' height='100' rx='12' transform='rotate(135 285.42 259.964)' fill='#EEF2F6' />
						<rect x='104.049' y='313.731' width='57' height='127' rx='16.5' transform='rotate(-60 104.049 313.731)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='225.594' y='330.211' width='36' height='100' rx='12' transform='rotate(120 225.594 330.211)' fill='#EEF2F6' />
						<rect x='64.3215' y='429.09' width='57' height='127' rx='16.5' transform='rotate(-75 64.3215 429.09)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='185.99' y='413.551' width='36' height='100' rx='12' transform='rotate(105 185.99 413.551)' fill='#EEF2F6' />
						<rect x='55.8008' y='550.8' width='57' height='127' rx='16.5' transform='rotate(-90 55.8008 550.8)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='169.301' y='504.3' width='36' height='100' rx='12' transform='rotate(90 169.301 504.3)' fill='#EEF2F6' />
						<rect x='79.0724' y='670.567' width='57' height='127' rx='16.5' transform='rotate(-105 79.0724 670.567)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='176.67' y='596.276' width='36' height='100' rx='12' transform='rotate(75 176.67 596.276)' fill='#EEF2F6' />
						<rect x='132.549' y='780.231' width='57' height='127' rx='16.5' transform='rotate(-120 132.549 780.231)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='207.594' y='683.211' width='36' height='100' rx='12' transform='rotate(60 207.594 683.211)' fill='#EEF2F6' />
						<rect x='212.588' y='872.318' width='57' height='127' rx='16.5' transform='rotate(-135 212.588 872.318)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='259.965' y='759.181' width='36' height='100' rx='12' transform='rotate(45 259.965 759.181)' fill='#EEF2F6' />
						<rect x='313.732' y='940.551' width='57' height='127' rx='16.5' transform='rotate(-150 313.732 940.551)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='330.213' y='819.007' width='36' height='100' rx='12' transform='rotate(30 330.213 819.007)' fill='#EEF2F6' />
						<rect x='429.09' y='980.281' width='57' height='127' rx='16.5' transform='rotate(-165 429.09 980.281)' stroke='#EEF2F6' stroke-width='3' />
						<rect x='413.551' y='858.613' width='36' height='100' rx='12' transform='rotate(15 413.551 858.613)' fill='#EEF2F6' />
					</svg>
				</div>
			</div>
		</main>
	)
}
