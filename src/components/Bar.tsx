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
  //the "sheen × weave" bar treatment (V5 from the preview artifact).
  //sheen: solid primary melting diagonally into a primary/secondary blend at the leading end.
  //weave: fine diagonal threads of the TERTIARY color (22% strength) laid over the sheen.
  //115° leans both patterns toward the bar's growing end — the movement suggestion.
  //the left end starts slightly LIGHTENED (14% white) so dark primaries don't read as a heavy slab
  const sheen = `linear-gradient(115deg, color-mix(in srgb, ${bar.color1} 86%, white) 0%, ${bar.color1} 45%, color-mix(in srgb, ${bar.color1} 55%, ${bar.color2}) 100%)`
  const weave = `repeating-linear-gradient(115deg, color-mix(in srgb, ${bar.color3} 22%, transparent) 0px, color-mix(in srgb, ${bar.color3} 22%, transparent) 1.5px, transparent 1.5px, transparent 7px)`
  //border: the team's own primary darkened ~28% — crisp edge against the cream panel for all 30 teams
  const border = `1.5px solid color-mix(in srgb, ${bar.color1} 78%, black)`

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
