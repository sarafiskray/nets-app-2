export type StatView = 'teamGames' | 'opponentGames'

export interface StatConfig {
  label: string
  view: StatView
  field: string
}

//label is the identifier
//i considered adding a numeric id, and i may do so down the line
//don't love passing around strings but felt ok for the scope of this project
export const STATS = [
  { label: 'Points', view: 'teamGames', field: 'points' },
  { label: 'Points Allowed', view: 'opponentGames', field: 'points' },
  { label: '3PM', view: 'teamGames', field: 'threePointersMade' },
  { label: '3PM Allowed', view: 'opponentGames', field: 'threePointersMade' },
  { label: '3PA', view: 'teamGames', field: 'threePointersAttempted' },
  { label: '3PA Allowed', view: 'opponentGames', field: 'threePointersAttempted' },
  { label: 'TO', view: 'teamGames', field: 'turnovers' },
  { label: 'Stocks', view: 'teamGames', field: 'stocks' },
  { label: 'Fouls', view: 'teamGames', field: 'personalFouls' },
  { label: 'FTA', view: 'teamGames', field: 'freeThrowsAttempted' },
  { label: 'FTA Allowed', view: 'opponentGames', field: 'freeThrowsAttempted' },
  { label: 'OREB', view: 'teamGames', field: 'offensiveRebounds' },
  { label: 'OREB Allowed', view: 'opponentGames', field: 'offensiveRebounds' },
  { label: 'Assists', view: 'teamGames', field: 'assists' },
] as const satisfies readonly StatConfig[]

export type StatLabel = (typeof STATS)[number]['label']

export interface RangePresetConfig {
  label: string
  kind: 'last' | 'first' | 'all'
  count?: number
}

export const RANGE_PRESETS = [
  { label: 'Last 5', kind: 'last', count: 5 },
  { label: 'Last 10', kind: 'last', count: 10 },
  { label: 'Last 25', kind: 'last', count: 25 },
  { label: 'Full Season', kind: 'all' },
  { label: 'First 5', kind: 'first', count: 5 },
  { label: 'First 10', kind: 'first', count: 10 },
  { label: 'First 25', kind: 'first', count: 25 },
] as const satisfies readonly RangePresetConfig[]

export type RangePreset = (typeof RANGE_PRESETS)[number]['label']
