import { useState } from 'react'
import './App.css'
import StatPicker from './components/StatPicker'
import RangePicker from './components/RangePicker'
import type { Stat, GameRange } from './config'
import type { RangeSelection } from './types'

function App() {

  const [selectedStat, setSelectedStat] = useState<Stat>('3PA Allowed')
  const [selectedRange, setSelectedRange] = useState<RangeSelection>({ mode: 'numGames', selectedGames: 'Last 10' })

  const selectStat = (stat: Stat) => {
    // console.log('selectedStat →', stat)
    setSelectedStat(stat)
  }

  const selectPreset = (preset: GameRange) => {
    const range: RangeSelection = { mode: 'numGames', selectedGames: preset }
    // console.log('selectedRange →', range)
    setSelectedRange(range)
  }

  return (
    <div className="flex min-h-dvh bg-page p-6 text-ink">

      <aside className="w-44 shrink-0">
        <StatPicker selectedStat={selectedStat} onSelect={selectStat} />
      </aside>

      {/* chart goes here */}
      <main className="flex-1"></main>

      <aside className="w-44 shrink-0">
        <RangePicker selectedRange={selectedRange} onSelect={selectPreset} />
      </aside>

    </div>
  )
}

export default App
