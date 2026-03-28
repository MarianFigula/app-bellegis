import logo from '../assets/logo-transparent.png'

export default function Hero() {
  const scrollToContact = () => {
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative md:min-h-screen flex items-center justify-center overflow-hidden bg-cream">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, hsl(40 52% 48% / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 50%, hsl(40 52% 48% / 0.04) 0%, transparent 60%)
          `,
        }}
      />

      <div className="container relative text-center pt-25 pb-15 md:pt-30 md:pb-20">
        <img
          src={logo}
          alt="BELLegis"
          className="w-52 md:w-72 h-auto mx-auto mb-2 drop-shadow-[0_2px_8px_hsl(40_65%_36%/0.12)] fade-in"
        />
        <div className="gold-divider gold-divider--center mb-6 fade-in fade-in-delay-2" />
        <h1 className="font-heading text-[clamp(32px,5vw,48px)] font-medium text-brown-dark mb-4 tracking-[-0.5px] fade-in fade-in-delay-2">
          Realitné a podnikateľské
          <br />
          poradenstvo
        </h1>
        <p className="text-[clamp(14px,2vw,16px)] text-brown-light max-w-110 mx-auto mb-9 leading-[1.7] fade-in fade-in-delay-3">
          Pomáhame firmám rásť — od výberu správnych nehnuteľností po optimalizáciu podnikania.
        </p>
        <button
          onClick={scrollToContact}
          className="inline-block font-body text-sm font-medium tracking-[0.3px] px-9 py-3.5 bg-gold text-warm-white rounded-lg cursor-pointer transition-all duration-300 hover:bg-gold-dark fade-in fade-in-delay-4"
        >
          Kontaktujte nás
        </button>
      </div>
    </section>
  )
}
