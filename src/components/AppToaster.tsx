import { Toaster } from 'sonner'

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--color-surface-dark)',
          border: '1px solid color-mix(in srgb, var(--color-dark-fg) 15%, transparent)',
          color: 'var(--color-warm-white)',
          fontFamily: 'var(--font-body)',
        },
        classNames: {
          success: '!border-l-4 !border-l-[var(--color-gold)] [&_[data-icon]]:text-[var(--color-gold)]',
          error: '!border-l-4 !border-l-red-400 [&_[data-icon]]:text-red-400',
          description: '!text-[var(--color-dark-fg)]',
        },
      }}
    />
  )
}
