import { useState, useEffect } from 'react'
import logoWithoutBottomText from '../../assets/logo-transparent-bez-spodneho-textu.png'
import Hamburger from '../Hamburger.tsx'
import NavLink from '../NavLink.tsx'
import { scrollToSection } from '../../utils/scrollToSectionUtil.ts'
import { SECTION_TYPES } from '../../types/sectionsType.ts'

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { id: SECTION_TYPES.services, label: 'Služby' },
  { id: SECTION_TYPES.about, label: 'O nás' },
  { id: SECTION_TYPES.contact, label: 'Kontakt' },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useScrolled(threshold = 40): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

export default function Navbar() {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = (id: string) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  const navScrolledClasses = scrolled
    ? 'bg-[rgba(253,252,250,0.92)] backdrop-blur-md py-3 border-warm-border'
    : 'bg-transparent py-5 border-transparent'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-100 border-b transition-all duration-350 ease-out ${navScrolledClasses}`}
    >
      <div className="container flex items-center justify-between">
        <a href="..">
          <img
            src={logoWithoutBottomText}
            alt="BELLegis"
            className={`w-auto transition-all duration-350 ${scrolled ? 'h-12' : 'h-14'}`}
          />
        </a>

        <Hamburger open={menuOpen} onToggle={() => setMenuOpen((prev) => !prev)} />

        <ul className="list-none hidden md:flex md:flex-row md:gap-2">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <NavLink label={label} onClick={() => handleNav(id)} scrolled={scrolled} />
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="list-none flex flex-col bg-[rgba(253,252,250,0.97)] backdrop-blur-md px-6 py-4 gap-1 border-b border-warm-border">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id}>
              <NavLink label={label} onClick={() => handleNav(id)} scrolled={scrolled} mobile />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
