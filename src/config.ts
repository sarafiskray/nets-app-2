export type StatView = 'teamGames' | 'opponentGames'

export interface StatConfig {
  label: string
  view: StatView
  fieldName: string
  //present only on percentages — fieldName is then the numerator (the "made" field)
  percentOf?: string
}

//label is the identifier
export const STATS = [
  { label: 'Points', view: 'teamGames', fieldName: 'points' },
  { label: 'Assists', view: 'teamGames', fieldName: 'assists' },
  { label: 'FG%', view: 'teamGames', fieldName: 'fieldGoalsMade', percentOf: 'fieldGoalsAttempted' },
  { label: '3PM', view: 'teamGames', fieldName: 'threePointersMade' },
  { label: '3PA', view: 'teamGames', fieldName: 'threePointersAttempted' },
  { label: '3P%', view: 'teamGames', fieldName: 'threePointersMade', percentOf: 'threePointersAttempted' },
  { label: 'OREB', view: 'teamGames', fieldName: 'offensiveRebounds' },
  { label: 'TO', view: 'teamGames', fieldName: 'turnovers' },
  { label: 'Stocks', view: 'teamGames', fieldName: 'stocks' },
  { label: 'Fouls', view: 'teamGames', fieldName: 'personalFouls' },
  { label: 'FTA', view: 'teamGames', fieldName: 'freeThrowsAttempted' },
  { label: 'Points Allowed', view: 'opponentGames', fieldName: 'points' },
  { label: 'FG% Allowed', view: 'opponentGames', fieldName: 'fieldGoalsMade', percentOf: 'fieldGoalsAttempted' },
  { label: '3PM Allowed', view: 'opponentGames', fieldName: 'threePointersMade' },
  { label: '3PA Allowed', view: 'opponentGames', fieldName: 'threePointersAttempted' },
  { label: '3P% Allowed', view: 'opponentGames', fieldName: 'threePointersMade', percentOf: 'threePointersAttempted' },
  { label: 'OREB Allowed', view: 'opponentGames', fieldName: 'offensiveRebounds' },
  { label: 'FTA Allowed', view: 'opponentGames', fieldName: 'freeThrowsAttempted' }
] as const satisfies readonly StatConfig[]

export type Stat = (typeof STATS)[number]['label']

export const GAMES_IN_SEASON = 82

export interface GameRangeButtonConfig {
  label: string
  startGame: number
  endGame: number
}

export const GAME_RANGE_PRESETS = [
  { label: 'Last 5', startGame: 78, endGame: 82 },
  { label: 'Last 10', startGame: 73, endGame: 82 },
  { label: 'Last 25', startGame: 58, endGame: 82 },
  { label: 'First 5', startGame: 1, endGame: 5 },
  { label: 'First 10', startGame: 1, endGame: 10 },
  { label: 'First 25', startGame: 1, endGame: 25 },
  { label: 'First Half', startGame: 1, endGame: 41 },
  { label: 'Second Half', startGame: 42, endGame: 82 },
   { label: 'Full Season', startGame: 1, endGame: 82 }
] as const satisfies readonly GameRangeButtonConfig[]

export type GameRangePreset = (typeof GAME_RANGE_PRESETS)[number]

export interface DateRangeButtonConfig {
  label: string
  from: string
  to: string
}

export const DATE_RANGE_PRESETS = [
  { label: 'Pre All-Star', from: '2025-10-21', to: '2026-02-15' },
  { label: 'Post All-Star', from: '2026-02-15', to: '2026-04-12' },
] as const satisfies readonly DateRangeButtonConfig[]

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]

export const SEASON_START = new Date(2025, 9, 21)
export const SEASON_END = new Date(2026, 3, 12)
