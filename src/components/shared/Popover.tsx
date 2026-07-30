import { useEffect, useRef, type ReactNode } from 'react'
import Pill from './Pill'

interface PopoverProps {
  label: string
  isActive: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  children: ReactNode
}

//shared by the custom date and game pickers
function Popover({ label, isActive, isOpen, onOpenChange, children }: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  //bunch of ways to escape
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

      {/*
        popover opens to the left, to ensure its always on the screen
      */}
      {isOpen && (
        <div className="absolute right-full top-1/2 z-20 mr-2 flex max-h-[calc(100dvh-3rem)] -translate-y-1/2 flex-col gap-2 overflow-y-auto rounded-lg border border-line bg-surface p-3 shadow-xl">
          {children}
        </div>
      )}

    </div>
  )
}

export default Popover
