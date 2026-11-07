import { useEffect, useRef, useState } from 'react'

function InfoPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <span className="info-popover" ref={ref}>
      <button
        type="button"
        className="info-popover-icon"
        aria-label="Erklärung anzeigen"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open && (
        <span className="info-popover-panel" role="tooltip">
          {text}
        </span>
      )}
    </span>
  )
}

export default InfoPopover
