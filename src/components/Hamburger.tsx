interface HamburgerProps {
  open: boolean
  onToggle: () => void
}

export default function Hamburger({ open, onToggle }: HamburgerProps) {
  const spanBase = 'block w-5.5 h-0.5 bg-brown-mid rounded-sm transition-all duration-300'
  return (
    <button
      className="md:hidden flex flex-col gap-1.25 bg-transparent border-none cursor-pointer p-1"
      onClick={onToggle}
      aria-label="Menu"
      aria-expanded={open}
    >
      <span className={`${spanBase} ${open ? 'rotate-45 translate-x-px translate-y-1.5' : ''}`} />
      <span className={`${spanBase} ${open ? 'opacity-0' : ''}`} />
      <span className={`${spanBase} ${open ? '-rotate-45 translate-x-px -translate-y-1.5' : ''}`} />
    </button>
  )
}
