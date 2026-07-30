//colors - blue by default, red if specified.  can add more if we want
const colorStyles = {
  accent: {
    selected: 'border-accent bg-accent text-surface shadow-md shadow-accent/30',
    unselected:
      'border-line bg-surface text-ink shadow-sm hover:border-accent hover:text-accent hover:shadow-md',
  },
  red: {
    selected: 'border-accent-red bg-accent-red text-surface shadow-md shadow-accent-red/30',
    unselected:
      'border-line bg-surface text-ink shadow-sm hover:border-accent-red hover:text-accent-red hover:shadow-md',
  },
} as const

//this can be used for the stat picker, as well as the number of games picker

export type PillColor = keyof typeof colorStyles

interface PillProps {
  label: string
  isSelected: boolean
  onSelect: () => void
  color?: PillColor
}

function Pill({ label, isSelected, onSelect, color = 'accent' }: PillProps) {
  
  const stateStyles = isSelected ? colorStyles[color].selected : colorStyles[color].unselected

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`w-full cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${stateStyles}`}
    >
      {label}
    </button>
  )
}

export default Pill
