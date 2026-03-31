import { useState } from 'react'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'

const inputClass =
  'w-full px-4 py-3 font-body text-sm text-dark-fg bg-dark-fg/10 border border-dark-fg/20 rounded-lg outline-none transition-colors duration-[250ms] placeholder:text-dark-fg/40 focus:ring-1 focus:ring-gold focus:border-gold'

const contactInfo = [
  { icon: <MapPin size={18} className="mt-0.5 shrink-0" />, text: 'Bratislava, Slovensko' },
  { icon: <Phone size={18} className="shrink-0" />, text: '+421 XXX XXX XXX' },
  { icon: <Mail size={18} className="shrink-0" />, text: 'info@bellegis.sk' },
]

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // TODO: replace with actual API call
      console.log('Form submitted:', formData)
      toast.success('Správa bola odoslaná!', {
        description: 'Ozveme sa vám čo najskôr.',
      })
      setFormData({ name: '', email: '', message: '' })
    } catch {
      toast.error('Niečo sa pokazilo.', {
        description: 'Skúste to prosím znova alebo nás kontaktujte emailom.',
      })
    }
  }

  return (
    <section id="kontakt" className="py-24 md:py-32 bg-surface-dark text-dark-fg">
      <div className="container">
        <div className="text-center mb-14 md:mb-24">
          <p className="section-label">Kontakt</p>
          <h2 className="font-heading text-2xl md:text-4xl font-normal text-dark-fg">
            Spojte sa s nami
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-xl font-normal mb-4 text-dark-fg">
                BELLegis s.r.o.
              </h3>
              <div className="space-y-3 text-dark-fg/80">
                {contactInfo.map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <span className="text-gold">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-dark-fg/60 text-sm space-y-1">
              <p>IČO: 52695387</p>
              <p>DIČ: 2121111311</p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-dark-fg/80 mb-1.5">Meno</label>
              <input
                type="text"
                placeholder="Vaše meno"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                // required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-fg/80 mb-1.5">E-mail</label>
              <input
                // type="email"
                placeholder="vas@email.sk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                // required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-fg/80 mb-1.5">Správa</label>
              <textarea
                placeholder="Vaša správa..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`${inputClass} resize-y`}
                rows={5}
                // required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 font-body text-base font-medium py-4 bg-gold text-warm-white cursor-pointer transition-colors duration-200 hover:bg-gold-dark"
            >
              <Send size={18} />
              Odoslať správu
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
