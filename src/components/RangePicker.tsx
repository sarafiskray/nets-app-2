import Pill from './Pill'
import { GAME_RANGE_PRESETS, type GameRangePreset } from '../config'
import type { GameRangeSelection } from '../types'

interface RangePickerProps {
  //null until the user picks one
  selectedRange: GameRangeSelection | null
  onSelect: (preset: GameRangePreset) => void
}

function RangePicker({ selectedRange, onSelect }: RangePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {GAME_RANGE_PRESETS.map((preset) => (
        <Pill
          key={preset.label}
          label={preset.label}
          color="red"
          isSelected={selectedRange?.mode === 'numGames' && selectedRange.label === preset.label}
          onSelect={() => onSelect(preset)}
        />
      ))}
    </div>
  )
}

export default RangePicker
