import logo from '../assets/logo-white-bg-original.png'

export default function About() {
  return (
    <section id="o-nas" className="py-16 md:py-25 bg-cream">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="section-label">O spoločnosti</p>
            <div className="gold-divider" />
            <h2 className="text-[clamp(26px,4vw,36px)] mb-5">BELLegis s.r.o.</h2>
            <p className="text-[15px] leading-[1.75] text-brown-light mb-3.5">
              Spoločnosť založená v roku 2019 so zameraním na realitné a podnikateľské poradenstvo.
              Poskytujeme služby primárne pre právnické osoby, no sme otvorení aj spolupráci s
              fyzickými osobami.
            </p>
            <p className="text-[15px] leading-[1.75] text-brown-light">
              Naším cieľom je byť spoľahlivým partnerom, ktorý pomáha klientom robiť informované
              rozhodnutia v oblasti nehnuteľností a podnikania.
            </p>
          </div>

          <div className="flex items-center justify-center bg-warm-white rounded-xl border border-warm-border min-h-50 md:min-h-70">
            <img src={logo} alt="BELLegis" className="h-auto object-fit" />
          </div>
        </div>
      </div>
    </section>
  )
}
