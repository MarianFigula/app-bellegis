import { useEffect, useRef, useState } from 'react'
import ServiceRow from './ServiceRow'

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
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="sluzby"
      className="min-h-svh flex flex-col bg-cream border-t border-warm-border py-16 md:py-20"
    >
      <div className="container flex-1 flex flex-col">

        {/* Header */}
        <div
          ref={headerRef}
          className={`mb-10 md:mb-14 transition-all duration-700 ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="section-label">Naše služby</p>
          <h2 className="text-2xl md:text-4xl">Čo pre vás môžeme urobiť</h2>
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
