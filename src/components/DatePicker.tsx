import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import Popover from './Popover'
import GoButton from './GoButton'
import { SEASON_START, SEASON_END } from '../config'
import type { GameRangeSelection } from '../types'

//helpers for dates
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isCompleteRange(range: DateRange | undefined): range is { from: Date; to: Date } {
  return Boolean(range?.from && range?.to)
}
//

interface DatePickerProps {
  //null until the user picks one
  selectedRange: GameRangeSelection | null
  onSelect: (from: string, to: string) => void
}

function DatePicker({ selectedRange, onSelect }: DatePickerProps) {
  //is calendar open
  const [isOpen, setIsOpen] = useState(false)
  //this is the range shown on the calendar
  const [range, setRange] = useState<DateRange | undefined>()
  //this is the range actually committed and shown on the Pill
  const [committed, setCommitted] = useState<DateRange | undefined>()

  //is date mode being used
  const isActive = selectedRange?.mode === 'dates'
  //are both dates selected
  const isComplete = isCompleteRange(range)

  //commit dates
  const commit = () => {
    if (!isCompleteRange(range)) return
    onSelect(toDateString(range.from), toDateString(range.to))
    setCommitted(range)
    setIsOpen(false)
  }

  //label for pill
  const label = isCompleteRange(committed)
    ? `${formatShort(committed.from)} – ${formatShort(committed.to)}`
    : 'Custom Dates'

  return (
    <Popover label={label} isActive={isActive} isOpen={isOpen} onOpenChange={setIsOpen}>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        resetOnSelect
        defaultMonth={range?.from ?? SEASON_START}
        startMonth={SEASON_START}
        endMonth={SEASON_END}
        disabled={{ before: SEASON_START, after: SEASON_END }}
        className="calendar-theme"
      />
      <GoButton label="Go" onClick={commit} disabled={!isComplete} />
    </Popover>
  )
}

export default DatePicker
