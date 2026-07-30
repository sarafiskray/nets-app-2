import Pill from './Pill'
import { STATS, type Stat } from '../config'

interface StatPickerProps {
  //null until the user picks one
  selectedStat: Stat | null
  onSelect: (stat: Stat) => void
}

function StatPicker({ selectedStat, onSelect }: StatPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {STATS.map((stat) => (
        <Pill
          key={stat.label}
          label={stat.label}
          isSelected={stat.label === selectedStat}
          onSelect={() => onSelect(stat.label)}
        />
      ))}
    </div>
  )
}

export default StatPicker
