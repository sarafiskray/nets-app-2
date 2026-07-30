import { Fragment } from 'react'
import { MotionConfig } from 'motion/react'
import Bar from './Bar'
import type { TeamBarData } from '../types'

//make the max value just over the max value seen in the data, so the top bar looks big always
function niceAxisMax(dataMax: number): number {
  if (dataMax <= 0) return 10
  const rawStep = dataMax / 10
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((s) => s * magnitude).find((s) => s >= rawStep)!
  return Math.ceil(dataMax / step) * step
}

//quiet by default so it never competes with the bars; only the hover state is accent-colored.
//disabled is styled rather than hidden so the header row never changes height
const clearStyles =
  'self-end text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-line enabled:cursor-pointer enabled:text-ink-muted enabled:hover:text-accent-red'

interface ChartProps {
  bars: TeamBarData[]
  onClear: () => void
  //false before anything has been picked — there is nothing to clear yet
  canClear: boolean
}

function Chart({ bars, onClear, canClear: dataLoaded }: ChartProps) {

  const axisMax = niceAxisMax(Math.max(...bars.map((bar) => bar.value)))

  return (

    <MotionConfig reducedMotion="never">
      <div className="flex max-h-[calc(100dvh-3rem)] flex-col rounded-lg border border-line bg-surface p-6">

        {/* stays put while the bars scroll beneath it */}
        {/* <h1 className="mb-4 text-center text-2xl font-semibold tracking-tight">NBA Team Stat Trends</h1> */}

        <button type="button" onClick={onClear} disabled={!dataLoaded} className={`mb-4 ${clearStyles}`}>
          Clear
        </button>

        {/* scrollable chart w hidden scrollbar */}
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          {bars.map((bar, index) => (
            <Fragment key={bar.key}>
              <Bar bar={bar} axisMax={axisMax} />
              {index === 14 && <div className="border-t-2 border-dashed border-hardwood" />}
            </Fragment>
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}

export default Chart
