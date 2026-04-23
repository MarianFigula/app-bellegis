import ServiceRow from '../ServiceRow.tsx'
import { useReveal } from '../../hooks/useReveal.ts'
import SectionHeader from './SectionHeader.tsx'
import { SECTION_TYPES } from '../../types/sectionsType.ts'

const services = [
  {
    title: 'Realitné poradenstvo',
    description:
      'Vyhodnocovanie podnikateľského a finančného rizika pri prenájme alebo nadobúdaní nehnuteľností. Konzultačná činnosť pri výbere prenajímateľov a predávajúcich, pomoc pri plánovaní a získavaní nových nehnuteľností, investičné poradenstvo a spracovanie žiadostí.',
  },
  {
    title: 'Činnosť realitnej kancelárie',
    description:
      'Sprostredkovanie predaja a prenájmu nehnuteľností a nebytových priestorov pre podnikateľské aj súkromné účely.',
  },
  {
    title: 'Podnikateľské poradenstvo',
    description:
      'Pomoc pri zriaďovaní prevádzok a nových foriem podnikania, hodnotenie možností optimalizácie nákladov, plánovanie rastu, hľadanie nových obchodných partnerov a príležitostí, pomoc pri riadení ľudských zdrojov.',
  },
]

export default function Services() {
  const [headerRef, headerVisible] = useReveal<HTMLDivElement>(0.5)

  return (
    <section
      id={SECTION_TYPES.services}
      className="min-h-svh flex flex-col bg-cream border-t border-warm-border py-16 md:py-20"
    >
      <div className="container flex-1 flex flex-col">
        {/* Header */}
        <div
          ref={headerRef}
          className={`mb-10 md:mb-14 transition-all duration-700 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <SectionHeader label="Naše služby" title="Čo pre vás môžeme urobiť" />
        </div>
        {/* Rows */}
        <div className="flex-1 flex flex-col">
          {services.map((service, i) => (
            <ServiceRow key={i} index={i} title={service.title} description={service.description} />
          ))}
        </div>
      </div>
    </section>
  )
}
