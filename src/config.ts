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

export interface GameRangeConfig {
  label: string
  slice: 'last' | 'first' | 'all'
  count?: number
}

export const GAME_RANGES = [
  { label: 'Last 5', slice: 'last', count: 5 },
  { label: 'Last 10', slice: 'last', count: 10 },
  { label: 'Last 25', slice: 'last', count: 25 },
  { label: 'Full Season', slice: 'all' },
  { label: 'First 5', slice: 'first', count: 5 },
  { label: 'First 10', slice: 'first', count: 10 },
  { label: 'First 25', slice: 'first', count: 25 },
] as const satisfies readonly GameRangeConfig[]

export type GameRange = (typeof GAME_RANGES)[number]['label']
