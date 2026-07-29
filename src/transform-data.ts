import { STATS, type Stat } from './config'
import type { GameRangeSelection, OpponentGame, Team, TeamBarData, TeamGame } from './types'

//for this case, a game can be a TeamGame or an OpponentGame
type Game = TeamGame | OpponentGame

export function transformData(teams: Team[], selectedStat: Stat, selectedGameRange: GameRangeSelection,): TeamBarData[] {

  const statConfig = STATS.find((s) => s.label === selectedStat)!

  const bars = teams.map((team) => ({
    key: team.key,
    color1: team.color1,
    color2: team.color2,
    color3: team.color3,
    color4: team.color4,
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
