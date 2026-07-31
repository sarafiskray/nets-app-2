export type StatView = 'teamGames' | 'opponentGames'

export interface StatConfig {
  label: string
  view: StatView
  fieldName: string
}

//label is the identifier
//i considered adding a numeric id, and i may do so down the line
//don't love passing around strings but felt ok for the scope of this project
export const STATS = [
  { label: 'Points', view: 'teamGames', fieldName: 'points' },
  { label: 'Points Allowed', view: 'opponentGames', fieldName: 'points' },
  { label: '3PM', view: 'teamGames', fieldName: 'threePointersMade' },
  { label: '3PM Allowed', view: 'opponentGames', fieldName: 'threePointersMade' },
  { label: '3PA', view: 'teamGames', fieldName: 'threePointersAttempted' },
  { label: '3PA Allowed', view: 'opponentGames', fieldName: 'threePointersAttempted' },
  { label: 'TO', view: 'teamGames', fieldName: 'turnovers' },
  { label: 'Stocks', view: 'teamGames', fieldName: 'stocks' },
  { label: 'Fouls', view: 'teamGames', fieldName: 'personalFouls' },
  { label: 'FTA', view: 'teamGames', fieldName: 'freeThrowsAttempted' },
  { label: 'FTA Allowed', view: 'opponentGames', fieldName: 'freeThrowsAttempted' },
  { label: 'OREB', view: 'teamGames', fieldName: 'offensiveRebounds' },
  { label: 'OREB Allowed', view: 'opponentGames', fieldName: 'offensiveRebounds' },
  { label: 'Assists', view: 'teamGames', fieldName: 'assists' },
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

export const SEASON_START = new Date(2025, 9, 21)
export const SEASON_END = new Date(2026, 3, 12)
