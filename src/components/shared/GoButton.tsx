interface GoButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

//shared action button for the custom range pickers
function GoButton({ label, onClick, disabled = false }: GoButtonProps) {

  const stateStyles = disabled
    ? 'cursor-not-allowed border-line bg-surface text-ink-muted opacity-60'
    : 'cursor-pointer border-accent-red bg-accent-red text-surface shadow-md shadow-accent-red/30'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${stateStyles}`}
    >
      {label}
    </button>
  )
}

export default GoButton
