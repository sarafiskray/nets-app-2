import { useEffect, useMemo, useState } from 'react'
import './App.css'
import StatPicker from './components/StatPicker'
import RangePicker from './components/RangePicker'
import DatePicker from './components/DatePicker'
import GamePicker from './components/GamePicker'
import Chart from './components/Chart'
import { transformData } from './transform-data'
import { GAME_RANGE_PRESETS, type Stat, type GameRangePreset } from './config'
import type { GameRangeSelection, StatsResponse } from './types'

//the view the app opens on
const DEFAULT_PRESET = GAME_RANGE_PRESETS.find((preset) => preset.label === 'Last 10')!

//quiet helper text over each rail — deliberately recessive so the pills carry the eye
const railHeading = 'mb-2 text-center text-xs font-semibold tracking-wider uppercase text-ink-muted'

function App() {

  const [selectedStat, setSelectedStat] = useState<Stat>('3PA Allowed')
  const [selectedGameRange, setSelectedGameRange] = useState<GameRangeSelection>({ mode: 'numGames', ...DEFAULT_PRESET })
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

  //rebuilds only when the data or a selection changes
  const teamBars = useMemo(() => {
    if (!data) return []
    return transformData(data.teams, selectedStat, selectedGameRange)
  }, [data, selectedStat, selectedGameRange])

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

  const loadChart = () => {
    if (loadError) return <p className="text-ink-muted">Could not load data.json</p>
    if (!data) return <p className="text-ink-muted">Loading…</p>
    return <Chart bars={teamBars} />
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
