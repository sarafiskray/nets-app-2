import { useState } from 'react'
import Popover from './Popover'
import GoButton from './GoButton'
import { GAMES_IN_SEASON } from '../config'
import type { GameRangeSelection } from '../types'

interface GamePickerProps {
  selectedRange: GameRangeSelection
  onSelect: (startGame: number, endGame: number) => void
}

const inputStyles =
  'w-20 rounded-lg border border-line bg-surface px-2 py-2 text-center text-sm text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-2 focus:outline-accent-red'

function GamePicker({ selectedRange, onSelect }: GamePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  //kept as strings so a half-typed box stays empty instead of snapping to 0
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  //what the trigger shows — only Go writes it, so abandoned picks never reach the pill
  const [committed, setCommitted] = useState<{ startGame: number; endGame: number } | undefined>()

  const startGame = Number(start)
  const endGame = Number(end)

  //a custom game range is numGames mode with no preset label
  const isActive = selectedRange.mode === 'numGames' && selectedRange.label === undefined

  //blocked until both boxes hold whole numbers inside 1-82, in order
  const isValid =
    start !== '' &&
    end !== '' &&
    Number.isInteger(startGame) &&
    Number.isInteger(endGame) &&
    startGame >= 1 &&
    endGame <= GAMES_IN_SEASON &&
    startGame <= endGame

  const commit = () => {
    if (!isValid) return
    onSelect(startGame, endGame)
    setCommitted({ startGame, endGame })
    setIsOpen(false)
  }

  const label = committed ? `Games ${committed.startGame}–${committed.endGame}` : 'Custom Games'

  return (
    <Popover label={label} isActive={isActive} isOpen={isOpen} onOpenChange={setIsOpen}>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          placeholder="1"
          min={1}
          max={GAMES_IN_SEASON}
          className={inputStyles}
        />
        <span className="text-ink-muted">–</span>
        <input
          type="number"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          placeholder={String(GAMES_IN_SEASON)}
          min={1}
          max={GAMES_IN_SEASON}
          className={inputStyles}
        />
      </div>

      <GoButton label="Go" onClick={commit} disabled={!isValid} />

    </Popover>
  )
}

export default GamePicker
