interface NavLinkProps {
  label: string
  onClick: () => void
  scrolled: boolean
  mobile?: boolean
}

export default function NavLink({ label, onClick, scrolled, mobile = false }: NavLinkProps) {
  const base =
    'bg-transparent border-none font-body text-sm font-normal px-4.5 rounded-md cursor-pointer transition-all duration-250 tracking-[0.2px]'

  const desktopClasses = scrolled
    ? 'text-brown-mid hover:text-brown-dark hover:bg-gold/8 py-2'
    : 'text-dark-fg hover:text-gold-light py-2'

  const mobileClasses = 'w-full text-left text-brown-mid hover:text-brown-dark hover:bg-gold/8 py-3'

  return (
    <button onClick={onClick} className={`${base} ${mobile ? mobileClasses : desktopClasses}`}>
      {label}
    </button>
  )
}
