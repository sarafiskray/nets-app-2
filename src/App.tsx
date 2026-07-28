import { useEffect, useMemo, useState } from 'react'
import './App.css'
import StatPicker from './components/StatPicker'
import RangePicker from './components/RangePicker'
import Chart from './components/Chart'
import { transformData } from './transform-data'
import type { Stat, GameRange } from './config'
import type { GameRangeSelection, StatsResponse } from './types'

function App() {

  const [selectedStat, setSelectedStat] = useState<Stat>('3PA Allowed')
  const [selectedGameRange, setSelectedGameRange] = useState<GameRangeSelection>({ mode: 'numGames', selectedGames: 'Last 10' })
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

  const selectGameRange = (gameRange: GameRange) => {
    const range: GameRangeSelection = { mode: 'numGames', selectedGames: gameRange }
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
        <StatPicker selectedStat={selectedStat} onSelect={selectStat} />
      </aside>

      <main className="flex-1 px-6">{loadChart()}</main>

      <aside className="w-44 shrink-0">
        <RangePicker selectedRange={selectedGameRange} onSelect={selectGameRange} />
      </aside>

    </div>
  )
}

export default App
