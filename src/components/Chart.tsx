import Bar from './Bar'
import type { TeamBarData as TeamBarData } from '../types'

//make the max value just over the max value seen in the data, so the top bar looks big always
function niceAxisMax(dataMax: number): number {
  if (dataMax <= 0) return 10
  const rawStep = dataMax / 10
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((s) => s * magnitude).find((s) => s >= rawStep)!
  return Math.ceil(dataMax / step) * step
}

interface ChartProps {
  bars: TeamBarData[]
}

function Chart({ bars }: ChartProps) {

  const axisMax = niceAxisMax(Math.max(...bars.map((bar) => bar.value)))

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="flex flex-col gap-1.5">
        {bars.map((bar) => (
          <Bar key={bar.key} bar={bar} axisMax={axisMax} />
        ))}
      </div>
    </div>
  )
}

export default Chart
