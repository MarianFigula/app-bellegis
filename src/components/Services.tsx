import { House, Key, Briefcase } from 'lucide-react'

const services = [
  {
    icon: <House size={22} />,
    title: 'Realitné poradenstvo',
    description:
      'Vyhodnocovanie podnikateľského a finančného rizika pri prenájme alebo nadobúdaní nehnuteľností. Konzultačná činnosť pri výbere prenajímateľov a predávajúcich, pomoc pri plánovaní a získavaní nových nehnuteľností, investičné poradenstvo a spracovanie žiadostí.',
  },
  {
    icon: <Key size={22} />,
    title: 'Činnosť realitnej kancelárie',
    description:
      'Sprostredkovanie predaja a prenájmu nehnuteľností a nebytových priestorov pre podnikateľské aj súkromné účely.',
  },
  {
    icon: <Briefcase size={22} />,
    title: 'Podnikateľské poradenstvo',
    description:
      'Pomoc pri zriaďovaní prevádzok a nových foriem podnikania, hodnotenie možností optimalizácie nákladov, plánovanie rastu, hľadanie nových obchodných partnerov a príležitostí, pomoc pri riadení ľudských zdrojov.',
  },
]

export default function Services() {
  return (
    <section id="sluzby" className="py-16 md:py-25 bg-warm-white border-t border-warm-border">
      <div className="container">
        <div className="text-center mb-14">
          <p className="section-label">Naše služby</p>
          <h2 className="text-[clamp(26px,4vw,36px)]">Čo pre vás môžeme urobiť</h2>
        </div>

        <div className="flex flex-col max-w-180 mx-auto">
          {services.map((service, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-3 md:gap-5 py-6 md:py-7 border-b last:border-none border-warm-border transition-colors duration-300"
            >
              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-gold-lighter rounded-[10px] text-gold-dark">
                {service.icon}
              </div>
              <div>
                <h3 className="font-body text-[17px] font-medium text-brown-dark mb-1.5">
                  {service.title}
                </h3>
                <p className="text-sm leading-[1.7] text-brown-light">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
