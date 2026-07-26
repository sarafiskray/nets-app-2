// .ts extension required: this file is also compiled by the node project (build script)
import type { GameRange } from './config.ts'

// shape of the stored data.json — the shared contract between scripts/build-data.ts and the app

export interface TeamGame {
  date: string
  gameId: number
  teamId: number
  teamKey: string
  points: number
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
  threePointersMade: number
  threePointersAttempted: number
  freeThrowsAttempted: number
  offensiveRebounds: number
}

export interface Team {
  teamId: number
  key: string
  color: string
  teamGames: TeamGame[]
  opponentGames: OpponentGame[]
}

export interface StatsResponse {
  season: string
  teams: Team[]
}

// one range source of truth: a preset OR a custom date window (dates are YYYY-MM-DD)
export type RangeSelection =
  | { mode: 'numGames'; selectedGames: GameRange }
  | { mode: 'dates'; from: string; to: string }
