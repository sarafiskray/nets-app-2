import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import Pill from './Pill'
import { SEASON_START, SEASON_END } from '../config'
import type { GameRangeSelection } from '../types'

//helpers for date formatting
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

//both ends of a DateRange are optional — this narrows them to Date for callers
function isCompleteRange(range: DateRange | undefined): range is { from: Date; to: Date } {
  return Boolean(range?.from && range?.to)
}
//

interface DatePickerProps {
  selectedRange: GameRangeSelection
  onSelect: (from: string, to: string) => void
}

function DatePicker({ selectedRange, onSelect }: DatePickerProps) {
  //is calendar open
  const [isOpen, setIsOpen] = useState(false)
  //this is the range shown on the calendar
  const [range, setRange] = useState<DateRange | undefined>()
  //this is the range actually committed and shown on the Pill
  const [committed, setCommitted] = useState<DateRange | undefined>()
  const containerRef = useRef<HTMLDivElement>(null)

  //is date mode being used
  const isActive = selectedRange.mode === 'dates'
  //are both dates selected
  const isComplete = isCompleteRange(range)

  //dismiss on outside click or Escape, listeners only while open
  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

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
    <div ref={containerRef} className="relative mt-2">

      <Pill
        label={label}
        color="red"
        isSelected={isActive}
        onSelect={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        //right-0 opens the panel leftward over the chart instead of off the viewport edge
        <div className="absolute right-0 top-full z-20 mt-2 rounded-lg border border-line bg-surface p-3 shadow-xl">
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
          {/* decided not to reuse pill here, but it is styled similarly */}
          <button
            type="button"
            onClick={commit}
            disabled={!isComplete}
            className={`mt-2 w-full rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isComplete
                ? 'cursor-pointer border-accent-red bg-accent-red text-surface shadow-md shadow-accent-red/30'
                : 'cursor-not-allowed border-line bg-surface text-ink-muted opacity-60'
            }`}
          >
            Go
          </button>
        </div>
      )}

    </div>
  )
}

export default DatePicker
