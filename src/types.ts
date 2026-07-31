// .ts extension required: this file is also compiled by the node project (build script)
import type { GameRangePreset } from './config.ts'

// shape of the stored data.json — the shared contract between scripts/build-data.ts and the app

export interface TeamGame {
  date: string
  gameId: number
  teamId: number
  teamKey: string
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  threePointersMade: number
  threePointersAttempted: number
  turnovers: number
  stocks: number
  personalFouls: number
  freeThrowsAttempted: number
  offensiveRebounds: number
  assists: number
}

export interface OpponentGame {
  date: string
  gameId: number
  teamId: number
  teamKey: string
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  threePointersMade: number
  threePointersAttempted: number
  freeThrowsAttempted: number
  offensiveRebounds: number
}

export interface Team {
  teamId: number
  key: string
  color1: string
  color2: string
  color3: string
  color4: string
  teamGames: TeamGame[]
  opponentGames: OpponentGame[]
}

export interface StatsResponse {
  season: string
  teams: Team[]
}

// users can choose number of games or date range.
// label is set only when a preset pill was clicked — a custom game range leaves it undefined
export type GameRangeSelection =
  | { mode: 'numGames'; startGame: number; endGame: number; label?: GameRangePreset['label'] }
  | { mode: 'dates'; from: string; to: string }

export interface TeamBarData {
  key: string
  color1: string
  color2: string
  color3: string
  color4: string
  value: number
}
