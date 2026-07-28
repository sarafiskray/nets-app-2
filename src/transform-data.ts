import { GAME_RANGES, STATS, type Stat } from './config'
import type { GameRangeSelection, OpponentGame, Team, TeamBar, TeamGame } from './types'

//for this case, a game can be a TeamGame or an OpponentGame
type Game = TeamGame | OpponentGame

export function transformData(teams: Team[], selectedStat: Stat, selectedGameRange: GameRangeSelection,): TeamBar[] {

  const statConfig = STATS.find((s) => s.label === selectedStat)!

  const bars = teams.map((team) => ({
    key: team.key,
    color: team.color,
    //calculate the average of the selected stat over the selected games
    value: calculateAverage(selectGames(team[statConfig.view], selectedGameRange), statConfig.fieldName),
  }))

  return bars.sort((a, b) => b.value - a.value)
}

function selectGames(games: readonly Game[], range: GameRangeSelection): readonly Game[] {
  //for date picker
  if (range.mode === 'dates') {
    return games.filter((game) => game.date >= range.from && game.date <= range.to)
  }
  //number of games picker
  const rangeConfig = GAME_RANGES.find((r) => r.label === range.selectedGames)!
  if (rangeConfig.slice === 'last') return games.slice(-rangeConfig.count)
  if (rangeConfig.slice === 'first') return games.slice(0, rangeConfig.count)
  return games
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
