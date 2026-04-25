interface NavLinkProps {
  label: string
  href: string
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void
  scrolled: boolean
  mobile?: boolean
}

export default function NavLink({ label, href, onClick, scrolled, mobile = false }: NavLinkProps) {
  const base =
    'inline-block bg-transparent border-none font-body text-sm font-normal px-4.5 rounded-md cursor-pointer transition-all duration-250 tracking-[0.2px] no-underline'

  const desktopClasses = scrolled
    ? 'text-brown-mid hover:text-brown-dark hover:bg-gold/8 py-2'
    : 'text-dark-fg hover:text-gold-light py-2'

  const mobileClasses = 'w-full text-left text-brown-mid hover:text-brown-dark hover:bg-gold/8 py-3'

  return (
    <a href={href} onClick={onClick} className={`${base} ${mobile ? mobileClasses : desktopClasses}`}>
      {label}
    </a>
  )
}
