import { useReveal } from '../../hooks/useReveal.ts'
import SectionHeader from './SectionHeader.tsx'
import { SECTION_TYPES } from '../../types/sectionsType.ts'

export default function About() {
  const [sectionRef, visible] = useReveal<HTMLElement>()

  const base = 'transition-all duration-700 ease-out'
  const hidden = 'opacity-0 translate-y-6'
  const shown = 'opacity-100 translate-y-0'

  return (
    <section
      ref={sectionRef}
      id={SECTION_TYPES.about}
      className="min-h-svh flex items-center bg-warm-white border-t border-warm-border py-16 md:py-20"
    >
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left - staggered fade-up */}
          <div>
            <SectionHeader label="O spoločnosti" title="BELLegis s. r. o." />
            <p
              className={`text-sm leading-[1.75] text-brown-light mb-4 ${base} ${visible ? shown : hidden}`}
              style={{ transitionDelay: '300ms' }}
            >
              Spoločnosť založená v roku 2019 so zameraním na realitné a podnikateľské poradenstvo.
              Poskytujeme služby primárne pre právnické osoby, no sme otvorení aj spolupráci s
              fyzickými osobami.
            </p>
            <p
              className={`text-sm leading-[1.75] text-brown-light ${base} ${visible ? shown : hidden}`}
              style={{ transitionDelay: '420ms' }}
            >
              Naším cieľom je byť spoľahlivým partnerom, ktorý pomáha klientom robiť informované
              rozhodnutia v oblasti nehnuteľností a podnikania.
            </p>
          </div>

          {/* Right - slides in from right */}
          <div
            className={`${base} duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <p className="font-body text-xs font-medium tracking-[0.25rem] uppercase text-gold-dark mb-3">
              Est.
            </p>
            <p className="font-heading italic text-[clamp(5rem,12vw,9rem)] leading-none text-gold/25 mb-6">
              2019
            </p>
            <div className="w-10 h-px bg-gold/40 mb-6" />
            <p className="font-heading italic text-[clamp(1.1rem,2vw,1.4rem)] text-brown-mid leading-normal">
              „Spoľahlivý partner pre rast vášho podnikania."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
