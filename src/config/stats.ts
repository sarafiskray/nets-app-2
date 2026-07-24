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
