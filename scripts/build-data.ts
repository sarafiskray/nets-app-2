import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SEASON = '2026' 
const SCORES_API = 'https://api.sportsdata.io/v3/nba/scores/json'
const STATS_API = 'https://api.sportsdata.io/v3/nba/stats/json'

const OUTPUT_PATH = fileURLToPath(new URL('../public/data.json', import.meta.url))

interface SdioTeam {
  TeamID: number
  Key: string
  PrimaryColor: string | null
}

interface SdioGame {
  GameID: number
  TeamID: number
  OpponentID: number
  Team: string 
  Opponent: string 
  Day: string
  Points: number
  ThreePointersMade: number
  ThreePointersAttempted: number
  Turnovers: number
  Steals: number
  BlockedShots: number
  PersonalFouls: number
  FreeThrowsAttempted: number
  OffensiveRebounds: number
  Assists: number
}

interface TeamGame {
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

interface OpponentGame {
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

interface TeamEntry {
  teamId: number
  key: string
  color: string
  teamGames: TeamGame[]
  opponentGames: OpponentGame[]
}

interface StatsResponse {
  season: string
  teams: TeamEntry[]
}

async function fetchJson<T>(url: string, apiKey: string): Promise<T> {
  const response = await fetch(`${url}?key=${apiKey}`)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText}): ${url}`)
  }
  return (await response.json()) as T
}

function requireApiKey(): string {
  const apiKey = process.env.SDIO_API_KEY
  if (!apiKey) {
    throw new Error(
      'SDIO_API_KEY is not set.',
    )
  }
  return apiKey
}

async function fetchTeams(apiKey: string): Promise<SdioTeam[]> {
  const teams = await fetchJson<SdioTeam[]>(`${SCORES_API}/teams`, apiKey)
  return teams
}

async function fetchTeamGames(team: SdioTeam, apiKey: string): Promise<SdioGame[]> {
  const url = `${STATS_API}/TeamGameStatsBySeason/${SEASON}/${team.TeamID}/all`
  const rows = await fetchJson<SdioGame[]>(url, apiKey)
  return rows
}

/** "CE1141" (API format, no leading #) → "#CE1141". */
function toCssColor(primaryColor: string | null, teamKey: string): string {
  if (!primaryColor || !/^[0-9A-Fa-f]{6}$/.test(primaryColor)) {
    throw new Error(`${teamKey} has a missing or malformed PrimaryColor: ${String(primaryColor)}`)
  }
  return `#${primaryColor}`
}

/** "2025-10-22T19:30:00" → "2025-10-22". */
function toDateOnly(day: string | null | undefined, context: string): string {
  const date = (day ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Missing or malformed Day on ${context}: ${String(day)}`)
  }
  return date
}

function toTeamGameRecord(row: SdioGame): TeamGame {
  return {
    date: toDateOnly(row.Day, `${row.Team} game ${row.GameID}`),
    gameId: row.GameID,
    teamId: row.TeamID,
    teamKey: row.Team,
    points: row.Points,
    threePointersMade: row.ThreePointersMade,
    threePointersAttempted: row.ThreePointersAttempted,
    turnovers: row.Turnovers,
    stocks: row.Steals + row.BlockedShots,
    personalFouls: row.PersonalFouls,
    freeThrowsAttempted: row.FreeThrowsAttempted,
    offensiveRebounds: row.OffensiveRebounds,
    assists: row.Assists,
  }
}


function toOpponentGameRecord(row: SdioGame): OpponentGame {
  return {
    date: toDateOnly(row.Day, `${row.Opponent} (allowed) game ${row.GameID}`),
    gameId: row.GameID,
    teamId: row.OpponentID,
    teamKey: row.Opponent,
    points: row.Points,
    threePointersMade: row.ThreePointersMade,
    threePointersAttempted: row.ThreePointersAttempted,
    freeThrowsAttempted: row.FreeThrowsAttempted,
    offensiveRebounds: row.OffensiveRebounds,
  }
}

function byDateAscending(a: { date: string }, b: { date: string }): number {
  return a.date.localeCompare(b.date)
}

function buildTeamEntry(team: SdioTeam, allRows: SdioGame[]): TeamEntry {
  const teamGames = allRows
    .filter((row) => row.TeamID === team.TeamID)
    .map(toTeamGameRecord)
    .sort(byDateAscending)

  const opponentGames = allRows
    .filter((row) => row.OpponentID === team.TeamID)
    .map(toOpponentGameRecord)
    .sort(byDateAscending)

  return {
    teamId: team.TeamID,
    key: team.Key,
    color: toCssColor(team.PrimaryColor, team.Key),
    teamGames,
    opponentGames,
  }
}

async function main(): Promise<void> {
  const apiKey = requireApiKey()

  console.log('Fetching teams...')
  const teams = await fetchTeams(apiKey)

  const allRows: SdioGame[] = []
  for (const team of teams) {
    const games = await fetchTeamGames(team, apiKey)
    allRows.push(...games)
    console.log(`Fetched ${team.Key}: ${games.length} games`)
  }

  const data: StatsResponse = {
    season: SEASON,
    teams: teams.map((team) => buildTeamEntry(team, allRows)),
  }

  // Pretty-printed for debugging while in development; minify for production later.
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')
  console.log(`Wrote ${data.teams.length} teams to ${OUTPUT_PATH}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
