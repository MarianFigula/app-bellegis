import { useState, useEffect } from 'react'
import logoWithoutBottomText from '../assets/logo-transparent-bez-spodneho-textu.png'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const links = [
    { id: 'sluzby', label: 'Služby' },
    { id: 'o-nas', label: 'O nás' },
    { id: 'kontakt', label: 'Kontakt' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-100 border-b transition-all duration-350 ease-out ${
        scrolled
          ? 'bg-[rgba(253,252,250,0.92)] backdrop-blur-md py-3 border-warm-border'
          : 'bg-transparent py-5 border-transparent'
      }`}
    >
      <div className="container flex items-center justify-between">
        <a
          href="#"
          className="flex items-center"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src={logoWithoutBottomText}
            alt="BELLegis"
            className={`w-auto transition-all duration-350 ${scrolled ? 'h-9' : 'h-11'}`}
          />
        </a>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex flex-col gap-1.25 bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className={`block w-5.5 h-0.5 bg-brown-mid rounded-sm transition-all duration-300 ${menuOpen ? 'transform-[rotate(45deg)_translate(5px,5px)]' : ''}`}
          />
          <span
            className={`block w-5.5 h-0.5 bg-brown-mid rounded-sm transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-5.5 h-0.5 bg-brown-mid rounded-sm transition-all duration-300 ${menuOpen ? 'transform-[rotate(-45deg)_translate(5px,-5px)]' : ''}`}
          />
        </button>

        {/* Nav links */}
        <ul
          className={`list-none ${
            menuOpen
              ? 'flex flex-col absolute top-full left-0 right-0 bg-[rgba(253,252,250,0.97)] backdrop-blur-md px-6 py-4 gap-1 border-b border-warm-border'
              : 'hidden'
          } md:flex md:flex-row md:gap-2 md:static md:bg-transparent md:p-0 md:border-none md:backdrop-blur-none`}
        >
          {links.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleNav(id)}
                className="w-full text-left md:w-auto md:text-center bg-transparent border-none font-body text-sm font-normal text-brown-mid px-4.5 py-3 md:py-2 rounded-md cursor-pointer transition-all duration-250 tracking-[0.2px] hover:text-brown-dark hover:bg-gold/8"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
