import treeImg from '../../assets/Logo strom-transparent-enhanced.png'
import { scrollToSection } from '../../utils/scrollToSectionUtil.ts'
import { SECTION_TYPES } from '../../types/sectionsType.ts'
import { useState } from 'react'

export default function Hero() {
  const [treeLoaded, setTreeLoaded] = useState(false)

  return (
    <section
      className="relative min-h-svh overflow-hidden flex items-center"
      style={{
        background:
          'radial-gradient(ellipse 80% 100% at 28% 50%, hsl(30 25% 13%) 0%, hsl(30 18% 7%) 100%)',
      }}
    >
      {/* Massive tree - anchored right, bleeds off edge and above/below */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        aria-hidden="true"
      >
        <img
          src={treeImg}
          alt=""
          className="w-[min(90vw,1200px)] h-auto"
          onLoad={() => setTreeLoaded(true)}
          style={
            treeLoaded
              ? { animation: 'treeRevealRight 2.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }
              : { opacity: 0 }
          }
        />
      </div>

      {/* Left-edge gradient - ensures text area stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to right, hsl(30 18% 7%) 0%, hsl(30 18% 7% / 0.85) 35%, transparent 65%)',
        }}
      />

      {/* Content - left column */}
      <div
        className={`container relative z-10 py-32 transition-none ${!treeLoaded ? 'fade-in-frozen' : ''}`}
      >
        <div className="max-w-125">
          {/* Brand wordmark */}
          <p className="font-body text-[12px] font-medium tracking-[10px] uppercase text-gold mb-8 fade-in">
            B E L L E G I S
          </p>

          {/* Headline */}
          <h1 className="font-heading font-normal text-[clamp(54px,7.5vw,96px)] leading-[0.95] tracking-[-2px] text-dark-fg mb-7 fade-in fade-in-delay-2">
            <span className="sr-only">
              BELLegis s. r. o. - Realitné a podnikateľské poradenstvo Košice.{' '}
            </span>
            <span aria-hidden="true">
              Rastieme
              <br />
              <em className="italic text-gold-light tracking-[-2.5px]">spolu</em>
            </span>
          </h1>

          {/* Gold rule */}
          <div className="w-12 h-px bg-gold mb-7 fade-in fade-in-delay-3" />

          {/* Sub */}
          <p className="font-body text-[clamp(14px,1.5vw,16px)] text-brown-muted max-w-90 leading-[1.85] mb-10 fade-in fade-in-delay-3">
            Pomáhame firmám rásť - od výberu správnych nehnuteľností po optimalizáciu podnikania.
          </p>

          {/* CTA */}
          <button
            onClick={() => scrollToSection(SECTION_TYPES.contact)}
            className="font-body text-[11px] font-medium tracking-[2.5px] uppercase py-3.75 px-11.5 text-gold-light bg-transparent border border-gold/50 hover:bg-gold hover:text-cream hover:border-gold transition-all duration-300 cursor-pointer fade-in fade-in-delay-4"
          >
            Kontaktujte nás
          </button>
        </div>
      </div>
    </section>
  )
}
