import { useState } from 'react'
import './App.css'
import StatPicker from './components/StatPicker'
import type { StatLabel } from './config/stats'

function App() {
  
  const [selectedStat, setSelectedStat] = useState<StatLabel>('3PA Allowed')

  return (
    <div className="flex min-h-dvh bg-page p-6 text-ink">
     
      <aside className="w-44 shrink-0">
        <StatPicker selectedStat={selectedStat} onSelect={setSelectedStat} />
      </aside>

    </div>
  )
}

export default App
