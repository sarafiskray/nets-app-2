import Pill from './Pill'
import { GAME_RANGES, type GameRange } from '../config'
import type { RangeSelection } from '../types'

interface RangePickerProps {
  selectedRange: RangeSelection
  onSelect: (preset: GameRange) => void
}

function RangePicker({ selectedRange, onSelect }: RangePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {GAME_RANGES.map((preset) => (
        <Pill
          key={preset.label}
          label={preset.label}
          color="red"
          isSelected={selectedRange.mode === 'numGames' && selectedRange.selectedGames === preset.label}
          onSelect={() => onSelect(preset.label)}
        />
      ))}
    </div>
  )
}

export default RangePicker
