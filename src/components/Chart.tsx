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

//used for invert and clear buttons
const headerButton =
  'text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-line enabled:cursor-pointer enabled:text-ink-muted enabled:hover:text-accent-red'

interface ChartProps {
  bars: TeamBarData[]
  onClear: () => void
  
  //flips the sort order
  onInvert: () => void
  //is EITHER a stat or a game range selected — there is something to reset
  canClear: boolean
  //are BOTH selected — only then is there real data to re-sort. the placeholder is always
  //alphabetical, so inverting it would be a silent no-op
  canInvert: boolean
  //rows that have been clicked
  selectedTeams: Set<string>
  onToggleTeam: (teamKey: string) => void
}

function Chart({ bars, onClear, onInvert, canClear, canInvert, selectedTeams, onToggleTeam }: ChartProps) {

  const axisMax = niceAxisMax(Math.max(...bars.map((bar) => bar.value)))

  return (

    <MotionConfig reducedMotion="never">
      <div className="flex max-h-[calc(100dvh-3rem)] flex-col rounded-lg border border-line bg-surface p-6">

        <div className="relative mb-4 shrink-0">
          <h1 className="text-center text-2xl font-semibold tracking-tight">NBA 2025/26 Team Stat Trends</h1>

          <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-4">
            <button type="button" onClick={onInvert} disabled={!canInvert} className={headerButton}>
              Invert
            </button>
            <button type="button" onClick={onClear} disabled={!canClear} className={headerButton}>
              Clear
            </button>
          </div>
        </div>

        {/* scrollable chart*/}
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          {bars.map((bar, index) => (
            <Fragment key={bar.key}>
              <Bar
                bar={bar}
                axisMax={axisMax}
                isSelected={selectedTeams.has(bar.key)}
                onToggle={() => onToggleTeam(bar.key)}
              />
              {index === 14 && <div className="border-t-2 border-dashed border-hardwood" />}
            </Fragment>
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}

export default Chart
