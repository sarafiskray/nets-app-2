import { STATS, type Stat } from './config'
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
    //the average of the selected stat over the selected games
    toBar(team, calculateAverage(selectGames(team[statConfig.view], selectedGameRange), statConfig.fieldName)),
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
  //presets and the custom game picker both land here — game numbers are 1-based
  //and inclusive, slice is 0-based and exclusive
  return games.slice(range.startGame - 1, range.endGame)
}

function calculateAverage(games: readonly Game[], fieldName: string): number {
  //return 0 if didnt play in selected calendar period
  if (games.length === 0) return 0

  //round to tenth
  const total = games.reduce((sum, game) => sum + getStatValue(game, fieldName), 0)
  return Math.round((total / games.length) * 10) / 10
}

//strange TS type casting
function getStatValue(game: Game, fieldName: string): number {
  return (game as unknown as Record<string, number>)[fieldName]
}
