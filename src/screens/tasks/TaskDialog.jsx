import { useEffect, useRef } from 'react'

// A modal dialog (native, so focus stays inside and Esc closes it) for the task form.
export function TaskDialog({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="task-dialog-title"
      className="m-auto w-[min(94vw,32rem)] rounded-xl border-0 bg-surface p-gutter text-ink shadow-raised backdrop:bg-ink/60"
    >
      <h2 id="task-dialog-title" className="text-title font-bold">
        {title}
      </h2>
      {open && children}
    </dialog>
  )
}
