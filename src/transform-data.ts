import { STATS, type Stat, type StatConfig } from './config'
import type { GameRangeSelection, OpponentGame, Team, TeamBarData, TeamGame } from './types'

//for this case, a game can be a TeamGame or an OpponentGame
type Game = TeamGame | OpponentGame

export function buildBars(teams: Team[], selectedStat: Stat | null, selectedGameRange: GameRangeSelection | null, sortAscending: boolean,): TeamBarData[] {
  if (!selectedStat || !selectedGameRange) return placeholderBars(teams)
  return transformData(teams, selectedStat, selectedGameRange, sortAscending)
}

function transformData(teams: Team[], selectedStat: Stat, selectedGameRange: GameRangeSelection, sortAscending: boolean,): TeamBarData[] {

  const statConfig = STATS.find((s) => s.label === selectedStat)!

  const bars = teams.map((team) =>
    //the selected stat over the selected games
    toBar(team, calculateValue(selectGames(team[statConfig.view], selectedGameRange), statConfig)),
  )

  //respect sortAscending flag
  return bars.sort((a, b) => (sortAscending ? a.value - b.value : b.value - a.value))
}

//shown before a stat and a range are picked: 30 empty bars, alphabetical.
function placeholderBars(teams: Team[]): TeamBarData[] {
  return teams.map((team) => toBar(team, 0)).sort((a, b) => a.key.localeCompare(b.key))
}

function toBar(team: Team, value: number): TeamBarData {
  return {
    key: team.key,
    color1: team.color1,
    color2: team.color2,
    color3: team.color3,
    color4: team.color4,
    value,
  }
}

function selectGames(games: readonly Game[], range: GameRangeSelection): readonly Game[] {
  //for date picker
  if (range.mode === 'dates') {
    return games.filter((game) => game.date >= range.from && game.date <= range.to)
  }
  //pick games by game number
  return games.slice(range.startGame - 1, range.endGame)
}

//every stat is a sum over a denominator — only the denominator differs
function calculateValue(games: readonly Game[], statConfig: StatConfig): number {
  //return 0 if didnt play in selected calendar period
  if (games.length === 0) return 0

  const total = sumField(games, statConfig.fieldName)

  //calculate percentage
  if (statConfig.percentOf) {
    const attempted = sumField(games, statConfig.percentOf)
    return attempted === 0 ? 0 : roundToTenth((total / attempted) * 100)
  }

  return roundToTenth(total / games.length)
}

function sumField(games: readonly Game[], fieldName: string): number {
  return games.reduce((sum, game) => sum + getStatValue(game, fieldName), 0)
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

//strange TS type casting
function getStatValue(game: Game, fieldName: string): number {
  return (game as unknown as Record<string, number>)[fieldName]
}
