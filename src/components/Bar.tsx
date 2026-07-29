import { motion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { TeamBarData } from '../types'

//one spring shared by every animation in this file.
//stiffness = how hard it pulls toward the target (higher = faster).
//damping = how much it resists overshoot (lower = bouncier).
//alternates to taste:  snappy { stiffness: 500, damping: 40 }  ·  soft { stiffness: 170, damping: 26 }
const spring: Transition = { type: 'spring', stiffness: 170, damping: 26 }

interface BarProps {
  bar: TeamBarData
  axisMax: number
}

function Bar({ bar, axisMax }: BarProps) {
  return (
    /*
      this is the full row, including the team name, which glides vertically
      the name Bar is slightly misleading as the Bar itself is actually the inner motion.div
    */
    <motion.div
      layout
      transition={spring}
      className="grid grid-cols-[4rem_1fr_4.5rem] items-center gap-2"
    >

      {/*
        team key
      */}
      <span className="text-right font-mono text-m font-semibold">{bar.key}</span>

      {/*
        this is the colored bar itself, which expands or reduces horizontally
      */}
      <motion.div
        animate={{ width: `${(bar.value / axisMax) * 100}%` }}
        transition={spring}
        className="h-5 rounded-r"
        style={{ backgroundColor: bar.color1 }}
      />

      {/*
        stat value
      */}
      <span className="text-m text-ink-muted tabular-nums">{bar.value.toFixed(1)}</span>

    </motion.div>
  )
}

export default Bar
