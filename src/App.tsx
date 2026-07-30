import { useEffect, useMemo, useState } from 'react'
import './App.css'
import StatPicker from './components/StatPicker'
import RangePicker from './components/RangePicker'
import DatePicker from './components/DatePicker'
import GamePicker from './components/GamePicker'
import Chart from './components/Chart'
import { buildBars } from './transform-data'
import { GAME_RANGE_PRESETS, type Stat, type GameRangePreset } from './config'
import type { GameRangeSelection, StatsResponse } from './types'

//default to full season, so that users can see data with a single click
const DEFAULT_RANGE: GameRangeSelection = {
  mode: 'numGames',
  ...GAME_RANGE_PRESETS.find((preset) => preset.label === 'Full Season')!,
}

//styling for right and left railings
//buttons should scroll, making it feel similar to the chart
const railHeading =
  'mb-2 shrink-0 text-center text-xs font-semibold tracking-wider uppercase text-ink-muted'
const rail = 'flex w-44 shrink-0 flex-col max-h-[calc(100dvh-3rem)]'
const railScroll = 'scrollbar-hidden min-h-0 overflow-y-auto'

function App() {

  const [selectedStat, setSelectedStat] = useState<Stat | null>(null)
  const [selectedGameRange, setSelectedGameRange] = useState<GameRangeSelection | null>(DEFAULT_RANGE)
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

  const clearSelections = () => {
    setSelectedStat(null)
    setSelectedGameRange(null)
  }

  const hasSelection = selectedStat !== null || selectedGameRange !== null

  const loadChart = () => {
    if (loadError) return <p className="text-ink-muted">Could not load data.json</p>
    if (!data) return <p className="text-ink-muted">Loading…</p>
    return <Chart bars={teamBars} onClear={clearSelections} canClear={hasSelection} />
  }

  return (
    <div className="flex min-h-dvh bg-page p-6 text-ink">

      <aside className={rail}>
        <h2 className={railHeading}>Select a Stat</h2>
        <div className={railScroll}>
          <StatPicker selectedStat={selectedStat} onSelect={selectStat} />
        </div>
      </aside>

      <main className="flex-1 px-6">  
        {loadChart()}
      </main>

      <aside className={rail}>
        <h2 className={railHeading}>Select a Game Range</h2>

        {/* only the presets scroll — they are the list that grows as presets are added */}
        <div className={railScroll}>
          <RangePicker selectedRange={selectedGameRange} onSelect={selectGameRange} />
        </div>

        <div className="shrink-0">
          <DatePicker selectedRange={selectedGameRange} onSelect={selectDateRange} />
          <GamePicker selectedRange={selectedGameRange} onSelect={selectCustomGames} />
        </div>
      </aside>

    </div>
  )
}

export default App
