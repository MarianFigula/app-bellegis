import { useReveal } from '../hooks/useReveal.ts'

type Props = {
  title: string
  description: string
  index: number
}

export default function ServiceRow({ title, description, index }: Props) {
  const [rowRef, visible] = useReveal<HTMLDivElement>(0.35)

  return (
    <div
      ref={rowRef}
      className={`
        flex-1 flex items-center gap-6 md:gap-10
        border-t border-warm-border first:border-none
        py-8 md:py-0
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Number */}
      <span className="font-heading italic text-[clamp(4rem,7vw,6rem)] leading-none text-gold/25 shrink-0 w-16 md:w-28 select-none">
        0{index + 1}
      </span>

      {/* Content */}
      <div className="flex-1 py-6 md:py-8">
        <h3 className="font-heading text-[clamp(1.125rem,2.2vw,1.625rem)] font-normal text-brown-dark mb-3">
          {title}
        </h3>
        <p className="text-brown-light text-sm leading-[1.75] max-w-xl">{description}</p>
      </div>
    </div>
  )
}
