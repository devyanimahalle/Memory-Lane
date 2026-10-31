const BASE =
  'inline-flex min-h-touch-lg cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-quick ease-gentle active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'

const SIZES = {
  md: 'px-8 text-lead',
  sm: 'px-4 text-body',
}

const VARIANTS = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong',
  secondary:
    'border-2 border-accent bg-surface text-accent hover:bg-accent-soft',
  quiet: 'text-accent hover:bg-accent-soft',
}

// Pill button for patient screens. 56px minimum height.
export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
