import type { TeamBarData } from '../types'

interface BarProps {
  bar: TeamBarData
  axisMax: number
}

//team key span, bar div, value span
function Bar({ bar, axisMax }: BarProps) {
  return (
    <div className="grid grid-cols-[4rem_1fr_4.5rem] items-center gap-2">

      <span className="text-right font-mono text-m font-semibold">{bar.key}</span>

      <div
        className="h-5 rounded-r"
        style={{ width: `${(bar.value / axisMax) * 100}%`, backgroundColor: bar.color }}
      />

      <span className="text-m text-ink-muted tabular-nums">{bar.value.toFixed(1)}</span>

    </div>
  )
}

export default Bar
