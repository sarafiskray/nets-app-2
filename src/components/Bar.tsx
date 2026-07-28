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
      layout = the vertical glide. each render, Motion measures where this row IS
      vs where it WAS (rows are matched across renders by the key Chart gives them)
      and springs the difference. a re-sort becomes travel instead of teleporting.
    */
    <motion.div
      layout
      transition={spring}
      className="grid grid-cols-[4rem_1fr_4.5rem] items-center gap-2"
    >

      <span className="text-right font-mono text-m font-semibold">{bar.key}</span>

      {/*
        the width morph. width lives in `animate` instead of `style`, so a changed
        width springs to its new length instead of snapping. with no `initial` set,
        the first render just paints at full width — no entrance animation.
        color stays plain style: it belongs to the team and never animates.
      */}
      <motion.div
        animate={{ width: `${(bar.value / axisMax) * 100}%` }}
        transition={spring}
        className="h-5 rounded-r"
        style={{ backgroundColor: bar.color1 }}
      />

      <span className="text-m text-ink-muted tabular-nums">{bar.value.toFixed(1)}</span>

    </motion.div>
  )
}

export default Bar
