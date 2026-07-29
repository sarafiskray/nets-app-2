import { useEffect, useRef, type ReactNode } from 'react'
import Pill from './Pill'

interface PopoverProps {
  label: string
  isActive: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  children: ReactNode
}

//trigger pill + floating panel, shared by the custom date and game pickers
function Popover({ label, isActive, isOpen, onOpenChange, children }: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  //dismiss on outside click or Escape, listeners only while open
  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onOpenChange])

  return (
    <div ref={containerRef} className="relative mt-2">

      <Pill label={label} color="red" isSelected={isActive} onSelect={() => onOpenChange(!isOpen)} />

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 shadow-xl">
          {children}
        </div>
      )}

    </div>
  )
}

export default Popover
