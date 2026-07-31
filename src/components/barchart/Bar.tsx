import { motion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { TeamBarData } from '../../types'

//one spring shared by every animation in this file.
//stiffness = how hard it pulls toward the target (higher = faster).
//damping = how much it resists overshoot (lower = bouncier).
//alternates to taste:  snappy { stiffness: 500, damping: 40 }  ·  soft { stiffness: 170, damping: 26 }
const spring: Transition = { type: 'spring', stiffness: 170, damping: 26 }

interface BarProps {
  bar: TeamBarData
  axisMax: number
  //a pinned row — stays highlighted while the user changes stats, so one team is easy to follow
  isSelected: boolean
  onToggle: () => void
}

function Bar({ bar, axisMax, isSelected, onToggle }: BarProps) {

  const rowHighlight = isSelected ? 'bg-line border-ink-muted' : 'hover:bg-line/50 border-transparent'
  const sheen = `linear-gradient(115deg, color-mix(in srgb, ${bar.color1} 86%, white) 0%, ${bar.color1} 45%, color-mix(in srgb, ${bar.color1} 55%, ${bar.color2}) 100%)`
  const weave = `repeating-linear-gradient(115deg, color-mix(in srgb, ${bar.color3} 22%, transparent) 0px, color-mix(in srgb, ${bar.color3} 22%, transparent) 1.5px, transparent 1.5px, transparent 7px)`
  const border = `1.5px solid color-mix(in srgb, ${bar.color1} 78%, black)`

  return (
    /*
      this is the full row, including the team name, which glides vertically
      the name Bar is slightly misleading as the Bar itself is actually the inner motion.div
    */
    <motion.div
      layout
      transition={spring}
      onClick={onToggle}
      className={`grid cursor-pointer grid-cols-[4rem_1fr_4.5rem] items-center gap-2 rounded-md border transition-colors ${rowHighlight}`}
    >

      {/*
        team key
      */}
      <span className="text-right font-mono text-m font-semibold">{bar.key}</span>

      {/*
        this is the colored bar itself, which expands or reduces horizontally
      */}
      <motion.div
       //initial false instead of initial width=0
        initial={false}
        animate={{ width: `${(bar.value / axisMax) * 100}%` }}
        transition={spring}
        className="h-5 rounded-r"
        style={{ border, backgroundColor: bar.color1, backgroundImage: `${weave}, ${sheen}` }}
      />

      {/*
        stat value
      */}
      <span className="text-m text-ink-muted tabular-nums">{bar.value.toFixed(1)}</span>

    </motion.div>
  )
}

export default Bar
