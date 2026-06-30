export interface Quest {
	id: number
	text: string
	completed: boolean
	created_at: string
	amount: string
	metric: string
}

export interface Day {
	id: number
	completed: boolean
	created_at: string
	date: string
	quests: string
}

export interface Reset {
	id: number
	date: string
	created_at: string
}

export interface Day {
	id: number
	date: string
	completed: boolean
	quests: string
	created_at: string
}
