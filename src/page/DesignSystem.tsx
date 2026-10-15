import { useState } from 'react'
import { Badge, Button, Card, Input, SectionTopline } from '../components/ui'

const scale = [
  { step: 50, hex: '#FBF9FD' },
  { step: 100, hex: '#F7F3FB', name: 'Mist' },
  { step: 200, hex: '#D6CCE0' },
  { step: 300, hex: '#C0B6C8' },
  { step: 400, hex: '#9A8DA9', name: 'Steel' },
  { step: 500, hex: '#82768E' },
  { step: 600, hex: '#71657C', name: 'Slate' },
  { step: 700, hex: '#362746' },
  { step: 800, hex: '#211A29', name: 'Navy' },
  { step: 900, hex: '#17131D' },
  { step: 950, hex: '#09070C' },
]

const accents = [
  { hex: '#A879FF', name: 'Violet' },
  { hex: '#D4BAFF', name: 'Lilac' },
]

const typeScale = [
  { cls: 'text-display', label: 'Display · 60/700' },
  { cls: 'text-h1', label: 'H1 · 44/700' },
  { cls: 'text-h2', label: 'H2 · 32/600' },
  { cls: 'text-h3', label: 'H3 · 24/600' },
  { cls: 'text-h4', label: 'H4 · 18/600' },
  { cls: 'text-body', label: 'Body · 16/400' },
  { cls: 'text-small', label: 'Small · 14/400' },
  { cls: 'text-caption uppercase', label: 'Caption · 12/500' },
]

function DesignSystem() {
  const [dark, setDark] = useState(() => {
    const root = document.documentElement.classList
    if (root.contains('dark')) return true
    if (root.contains('light')) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const toggleTheme = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    setDark(next)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-8 dark:grain-overlay">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-caption uppercase text-muted-foreground">Design system</p>
          <h1>Imperium</h1>
        </div>
        <Button variant="outline" onClick={toggleTheme}>
          {dark ? 'Light mode' : 'Dark mode'}
        </Button>
      </header>

      <section className="bg-mesh relative mb-16 overflow-hidden rounded-xl px-8 py-20 shadow-lg">
        <p className="text-caption uppercase text-imperium-100/80">Brand gradient</p>
        <h2 className="text-display mt-2 max-w-2xl text-white">Quiet confidence, in four tones.</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" className="bg-mist text-navy hover:bg-white">Get started</Button>
          <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">Learn more</Button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Color</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-11">
          {scale.map(({ step, hex, name }) => (
            <div key={step}>
              <div
                className="aspect-square rounded-md border border-border"
                style={{ backgroundColor: hex }}
              />
              <p className="mt-2 text-small font-medium">
                {step} {name && <span className="text-muted-foreground">· {name}</span>}
              </p>
              <p className="font-mono text-caption text-muted-foreground">{hex}</p>
            </div>
          ))}
        </div>
        <h3 className="mb-4 mt-10 text-h4">Accent — one per viewport</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-11">
          {accents.map(({ hex, name }) => (
            <div key={name}>
              <div
                className="aspect-square rounded-md border border-border"
                style={{ backgroundColor: hex }}
              />
              <p className="mt-2 text-small font-medium">{name}</p>
              <p className="font-mono text-caption text-muted-foreground">{hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Theme primitives</h2>
        <div className="rounded-xl border border-border bg-background px-6 py-10 sm:px-10">
          <SectionTopline eyebrow="01 / The philosophy" index={2} total={7} rule />
          <h3 className="max-w-3xl text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.92] tracking-[-0.03em]">
            Restraint is the <span className="text-gradient">sharpest form.</span>
          </h3>
          <p className="mt-6 max-w-sm text-body font-light leading-relaxed text-muted-foreground">
            <code className="font-mono text-caption">text-gradient</code> on the closing words of a display heading;{' '}
            <code className="font-mono text-caption">SectionTopline</code> opens every section;{' '}
            <code className="font-mono text-caption">section-wrap</code> and{' '}
            <code className="font-mono text-caption">section-pad</code> set width and rhythm.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6">Typography — Inter</h2>
        <Card className="space-y-5">
          {typeScale.map(({ cls, label }) => (
            <div key={label} className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-40 shrink-0 font-mono text-caption text-muted-foreground">{label}</span>
              <span className={cls}>The empire of ideas</span>
            </div>
          ))}
        </Card>
      </section>

      <section className="mb-16 grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4">Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4">Badges & inputs</h3>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
          </div>
          <label className="mb-1.5 block text-small font-medium" htmlFor="email">Email</label>
          <Input id="email" type="email" placeholder="you@imperium.io" />
        </Card>
      </section>

      <section>
        <h2 className="mb-6">Surfaces</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-background p-6 shadow-sm ring-1 ring-border">
            <p className="text-h4">background</p>
            <p className="text-small text-muted-foreground">Page canvas</p>
          </div>
          <div className="rounded-lg bg-surface p-6 shadow-md">
            <p className="text-h4">surface</p>
            <p className="text-small text-muted-foreground">Cards, panels</p>
          </div>
          <div className="bg-brand-gradient rounded-lg p-6 text-mist shadow-lg">
            <p className="text-h4">brand-gradient</p>
            <p className="text-small text-mist/75">Hero & emphasis</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default DesignSystem
