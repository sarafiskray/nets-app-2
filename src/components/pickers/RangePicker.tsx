import Pill from '../shared/Pill'
import {
  GAME_RANGE_PRESETS,
  DATE_RANGE_PRESETS,
  type GameRangePreset,
  type DateRangePreset,
} from '../../config'
import type { GameRangeSelection } from '../../types'

interface RangePickerProps {
  //null until the user picks one
  selectedRange: GameRangeSelection | null
  //preset game ranges ie. first 5 games
  onSelectGames: (preset: GameRangePreset) => void
  //preset date ranges, only pre/post all star
  onSelectDates: (preset: DateRangePreset) => void
}

function RangePicker({ selectedRange, onSelectGames, onSelectDates }: RangePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      /
      {GAME_RANGE_PRESETS.map((preset) => (
        <Pill
          key={preset.label}
          label={preset.label}
          color="red"
          isSelected={selectedRange?.mode === 'numGames' && selectedRange.label === preset.label}
          onSelect={() => onSelectGames(preset)}
        />
      ))}

      {DATE_RANGE_PRESETS.map((preset) => (
        <Pill
          key={preset.label}
          label={preset.label}
          color="red"
          isSelected={selectedRange?.mode === 'dates' && selectedRange.label === preset.label}
          onSelect={() => onSelectDates(preset)}
        />
      ))}

    </div>
  )
}

export default RangePicker
