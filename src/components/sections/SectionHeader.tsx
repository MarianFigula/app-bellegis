interface SectionHeaderProps {
  label: string
  title: string
  centered?: boolean
  className?: string
}

export default function SectionHeader({
  label,
  title,
  centered = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <p className="section-label">{label}</p>
      <h2 className={`text-2xl md:text-4xl ${className}`}>{title}</h2>
    </div>
  )
}
