export default function Footer() {
  return (
    <footer className="bg-surface-dark border-t border-dark-fg/10 py-8">
      <div className="container flex items-center justify-between text-dark-fg/50 text-sm">
        <span>&copy; {new Date().getFullYear()} BELLegis s. r. o. Všetky práva vyhradené.</span>
        <span className="font-heading">Rastieme spolu</span>
      </div>
    </footer>
  )
}
