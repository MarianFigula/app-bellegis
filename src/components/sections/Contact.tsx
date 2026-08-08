import { useEffect, useRef, useState } from 'react'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import SectionHeader from './SectionHeader.tsx'
import { SECTION_TYPES } from '../../types/sectionsType.ts'

const inputClass =
  'w-full px-4 py-3 font-body text-sm text-dark-fg bg-dark-fg/10 border border-dark-fg/20 rounded-lg outline-none transition-colors duration-[250ms] placeholder:text-dark-fg/40 focus:ring-1 focus:ring-gold focus:border-gold'

const emptyForm = { name: '', email: '', message: '', subject: '' }

// Above the server's MIN_FILL_SECONDS of 3, to absorb clock skew.
const MIN_TOKEN_AGE_MS = 3500

// Throws rather than returning '', so a failed request ends in the error toast
// instead of posting an empty token and going through the expiry retry.
const fetchToken = async (): Promise<string> => {
  const res = await fetch('/contact.php', { method: 'GET' })
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`)
  }

  const data = await res.json()
  if (typeof data.token !== 'string' || data.token === '') {
    throw new Error('Token missing in response')
  }

  return data.token
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const contactInfo = [
  {
    icon: <MapPin size={18} className="mt-0.5 shrink-0" />,
    text: 'Južná trieda 48B, 040 01 Košice - mestská časť Juh',
  },
  { icon: <Phone size={18} className="shrink-0" />, text: '+421 907 358 317' },
  { icon: <Mail size={18} className="shrink-0" />, text: 'bellegis@bellegis.sk' },
]

type ContactResponse = { success?: boolean; message?: string; code?: string }

export default function Contact() {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const token = useRef({ value: '', receivedAt: 0 })

  const loadToken = async () => {
    token.current = { value: await fetchToken(), receivedAt: Date.now() }
  }

  // Fetched on load, not on submit, so the 3 s minimum age is normally already
  // spent by the time anyone finishes typing.
  useEffect(() => {
    loadToken().catch(() => {})
  }, [])

  const send = async (): Promise<ContactResponse | null> => {
    if (!token.current.value) {
      await loadToken()
    }

    const age = Date.now() - token.current.receivedAt
    if (age < MIN_TOKEN_AGE_MS) {
      await sleep(MIN_TOKEN_AGE_MS - age)
    }

    const res = await fetch('/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, token: token.current.value }),
    })

    return (await res.json().catch(() => null)) as ContactResponse | null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let data = await send()

      // The token outlives the page by 2 h at most. Someone who left the tab
      // open overnight gets a silent re-fetch and one retry rather than an
      // error telling them to reload and retype everything.
      if (data?.code === 'token') {
        token.current = { value: '', receivedAt: 0 }
        data = await send()
      }

      if (!data?.success) {
        toast.error('Niečo sa pokazilo.', {
          description: data?.message ?? 'Skúste to prosím znova alebo nás kontaktujte emailom.',
        })
        return
      }

      toast.success('Správa bola odoslaná!', {
        description: 'Ozveme sa vám čo najskôr.',
      })
      setFormData(emptyForm)
      loadToken().catch(() => {})
    } catch {
      toast.error('Niečo sa pokazilo.', {
        description: 'Skúste to prosím znova alebo nás kontaktujte emailom.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id={SECTION_TYPES.contact} className="py-24 md:py-32 bg-surface-dark text-dark-fg">
      <div className="container">
        <div className="text-center mb-14 md:mb-24">
          <SectionHeader
            label="Kontakt"
            title="Spojte sa s nami"
            centered
            className="text-dark-fg"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-xl font-normal mb-4 text-dark-fg">
                BELLegis s. r. o.
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
              <p className="mt-2">
                Spoločnosť zapísaná v obchodnom registri Mestského súdu Košice, oddiel: Sro, vložka
                č. 47459/V
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-dark-fg/80 mb-1.5">Meno</label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Vaše meno"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-fg/80 mb-1.5">E-mail</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="vas@email.sk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                required
                maxLength={254}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-fg/80 mb-1.5">Správa</label>
              <textarea
                name="message"
                placeholder="Vaša správa..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`${inputClass} resize-y`}
                rows={5}
                required
                minLength={10}
                maxLength={2000}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 font-body text-base font-medium py-4 bg-gold text-warm-white cursor-pointer transition-colors duration-200 hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {submitting ? 'Odosielam...' : 'Odoslať správu'}
            </button>

            <div aria-hidden="true" className="absolute w-px h-px -left-[9999px] overflow-hidden">
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
