import React, { useCallback, useEffect, useState } from 'react'

interface PopupOptions {
  initialState: boolean
  active: boolean
  isOutside: (node: HTMLElement) => boolean
}

// hook for handling clicks ouside and presses of the escape key
const usePopup = (ref: React.RefObject<HTMLElement>, options: Partial<PopupOptions> = {}) => {
  const active = options.active !== false
  const [open, setOpen] = useState(options.initialState ?? false)

  const handleClick = useCallback(
    (e) => {
      const isOutside = options.isOutside ? options.isOutside(e.target) : !ref.current.contains(e.target)
      if (isOutside) setOpen(false)
    },
    [active]
  )

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isEscape = e.key === 'Escape'

    if (isEscape) {
      e.preventDefault()
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (active && open && ref.current) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('mousedown', handleClick)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [open])

  return { open, setOpen }
}

export default usePopup
