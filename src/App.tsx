import { useEffect, useMemo, useState } from 'react'
import './App.css'
import StatPicker from './components/StatPicker'
import RangePicker from './components/RangePicker'
import DatePicker from './components/DatePicker'
import GamePicker from './components/GamePicker'
import Chart from './components/Chart'
import { buildBars } from './transform-data'
import { type Stat, type GameRangePreset } from './config'
import type { GameRangeSelection, StatsResponse } from './types'

//quiet helper text over each rail — deliberately recessive so the pills carry the eye
const railHeading = 'mb-2 text-center text-xs font-semibold tracking-wider uppercase text-ink-muted'

function App() {

  //both start empty — nothing is charted until the user picks a stat AND a range
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null)
  const [selectedGameRange, setSelectedGameRange] = useState<GameRangeSelection | null>(null)
  const [data, setData] = useState<StatsResponse | null>(null)
  //this shouldn't really ever error but good for debugging
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((json) => setData(json as StatsResponse))
      .catch(() => setLoadError(true))
  }, [])

  //rebuilds only when the data or a selection changes.
  //buildBars owns the "nothing picked yet" case, so both selections can be handed over as-is
  const teamBars = useMemo(
    () => (data ? buildBars(data.teams, selectedStat, selectedGameRange) : []),
    [data, selectedStat, selectedGameRange],
  )

  //temporary, to verify the transform output
  console.log('teamBars →', teamBars)

  const selectStat = (stat: Stat) => {
     console.log('selectedStat →', stat)
    setSelectedStat(stat)
  }

  const selectGameRange = (preset: GameRangePreset) => {
    const range: GameRangeSelection = { mode: 'numGames', ...preset }
     console.log('selectedRange →', range)
    setSelectedGameRange(range)
  }

  const selectCustomGames = (startGame: number, endGame: number) => {
    const range: GameRangeSelection = { mode: 'numGames', startGame, endGame }
     console.log('selectedRange →', range)
    setSelectedGameRange(range)
  }

  const selectDateRange = (from: string, to: string) => {
    const range: GameRangeSelection = { mode: 'dates', from, to }
     console.log('selectedRange →', range)
    setSelectedGameRange(range)
  }

  //back to null for both — the chart returns to the same placeholder it loaded with.
  //the custom pickers keep their committed labels on purpose; only their fill clears,
  //because that is derived from the range union
  const clearSelections = () => {
    setSelectedStat(null)
    setSelectedGameRange(null)
  }

  //nothing to clear until at least one of the two has been picked
  const hasSelection = selectedStat !== null || selectedGameRange !== null

  const loadChart = () => {
    if (loadError) return <p className="text-ink-muted">Could not load data.json</p>
    if (!data) return <p className="text-ink-muted">Loading…</p>
    return <Chart bars={teamBars} onClear={clearSelections} canClear={hasSelection} />
  }

  return (
    <div className="flex min-h-dvh bg-page p-6 text-ink">

      <aside className="w-44 shrink-0">
        <h2 className={railHeading}>Select a Stat</h2>
        <StatPicker selectedStat={selectedStat} onSelect={selectStat} />
      </aside>

      <main className="flex-1 px-6">  
        {loadChart()}
      </main>

      <aside className="w-44 shrink-0">
        <h2 className={railHeading}>Select a Game Range</h2>
        <RangePicker selectedRange={selectedGameRange} onSelect={selectGameRange} />
        <DatePicker selectedRange={selectedGameRange} onSelect={selectDateRange} />
        <GamePicker selectedRange={selectedGameRange} onSelect={selectCustomGames} />
      </aside>

    </div>
  )
}

export default App
