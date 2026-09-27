import { useEffect, useRef, useState } from 'react'
import GlassSurface from '../components/effect/GlassSurface'
import { GlassHeroApp } from '../components/effect/glass-hero/App'
import { CHAPTERS, PRIMARY_ACTION, type Chapter } from '../components/effect/glass-hero/chapters'
import { cn } from '../lib/cn'

/*
 * About Inceptio Imperium — the studio told in five chapters around one glass object.
 * The object is the only bold thing on the page; everything around it
 * stays quiet: real DOM text, hairlines, the house palette.
 */

const pad = (n: number) => String(n).padStart(2, '0')

const LAYOUT: Record<Chapter['align'], string> = {
  left: 'md:inset-x-auto md:bottom-auto md:left-[max(2.5rem,7vw)] md:top-1/2 md:w-[min(40vw,34rem)] md:-translate-y-1/2 md:p-0',
  right: 'md:inset-x-auto md:bottom-auto md:right-[max(6rem,15vw)] md:top-1/2 md:w-[min(34vw,30rem)] md:-translate-y-1/2 md:p-0',
  center: 'md:inset-x-0 md:bottom-[7svh] md:mx-auto md:w-[min(90vw,44rem)] md:p-0 md:text-center',
}

function PrimaryAction({ onConfirm, className }: { onConfirm: () => void; className?: string }) {
  return (
    <a
      href={PRIMARY_ACTION.href}
      onClick={onConfirm}
      className={cn(
        'inline-flex h-12 items-center rounded-full bg-mist px-7 text-small font-medium tracking-wide text-navy transition-transform duration-500 ease-out-soft hover:-translate-y-0.5',
        className,
      )}
    >
      {PRIMARY_ACTION.label}
    </a>
  )
}

export default function About() {
  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<HTMLElement[]>([])
  const loaderRef = useRef<HTMLDivElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const stepRef = useRef<HTMLParagraphElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const railFillRef = useRef<HTMLSpanElement>(null)
  const appRef = useRef<GlassHeroApp | null>(null)

  const [active, setActive] = useState(0)
  const [gl, setGl] = useState<'loading' | 'on' | 'off'>('loading')
  const [sound, setSound] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const app = new GlassHeroApp({
      root: rootRef.current!,
      sections: sectionRefs.current,
      canvasHost: hostRef.current!,
      loader: { root: loaderRef.current!, arc: arcRef.current!, step: stepRef.current! },
      cursor: { root: cursorRef.current!, dot: dotRef.current!, ring: ringRef.current!, label: labelRef.current! },
      railFill: railFillRef.current!,
      onChapter: setActive,
      onGl: setGl,
    })
    appRef.current = app
    if (import.meta.env.DEV) (window as unknown as { __glassHero?: GlassHeroApp }).__glassHero = app
    void app.start()
    return () => {
      app.dispose()
      appRef.current = null
    }
  }, [])

  useEffect(() => {
    const previous = document.title
    document.title = 'About — Inceptio Imperium'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 6000)
    return () => clearTimeout(id)
  }, [toast])

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    appRef.current?.setSound(next)
  }

  const confirm = () => {
    appRef.current?.confirm()
    setToast(PRIMARY_ACTION.confirmation)
  }

  return (
    <div
      ref={rootRef}
      className="glass-hero-cursor dark relative min-h-screen overflow-x-clip bg-imperium-950 text-mist selection:bg-imperium-700 selection:text-mist"
    >
      {/* The canvas lives here; it is created and disposed by GlassHeroApp. */}
      <div ref={hostRef} aria-hidden className="fixed inset-0 z-0" />

      {/* Phones: text is anchored to the bottom over a soft fade. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[5] h-[60svh] bg-gradient-to-t from-imperium-950 via-imperium-950/90 to-transparent md:hidden"
      />

      <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
        <GlassSurface
          tone="dark"
          width="100%"
          height={56}
          borderRadius={28}
          brightness={55}
          backgroundOpacity={0.05}
          saturation={1.2}
          className="max-w-3xl"
        >
          <nav className="flex w-full items-center justify-between gap-3 pl-4 pr-1" aria-label="Main">
            <a href="#" className="whitespace-nowrap font-mono text-small tracking-[0.35em] text-mist">
              <span className="hidden sm:inline">INCEPTIO IMPERIUM</span>
              <span className="sm:hidden">II</span>
            </a>
            <div className="flex items-center gap-1">
              <a
                href="#"
                className="hidden whitespace-nowrap rounded-full px-3 py-2 text-small text-steel transition-colors duration-500 hover:text-mist md:inline-block"
              >
                Home
              </a>
              <span aria-current="page" className="hidden whitespace-nowrap rounded-full px-3 py-2 text-small text-mist md:inline-block">
                About
              </span>
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={sound}
                className="whitespace-nowrap rounded-full px-3 py-2 text-small text-steel transition-colors duration-500 hover:text-mist sm:px-4"
              >
                {sound ? 'Sound on' : 'Sound off'}
              </button>
              <a
                href={PRIMARY_ACTION.href}
                onClick={confirm}
                className="whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-small text-mist transition-colors duration-500 hover:border-white/40"
              >
                {PRIMARY_ACTION.label}
              </a>
            </div>
          </nav>
        </GlassSurface>
      </header>

      <main>
        {CHAPTERS.map((chapter, i) => {
          const last = i === CHAPTERS.length - 1
          return (
            <section
              key={chapter.id}
              ref={el => {
                if (el) sectionRefs.current[i] = el
              }}
              aria-labelledby={`chapter-${chapter.id}`}
              className={cn('relative', last ? 'h-[100svh]' : 'h-[130svh]')}
            >
              {i === 0 && gl === 'off' && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-[12vw] top-[50svh] h-[min(32vw,420px)] w-[min(32vw,420px)] -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_34%_28%,rgb(239_239_239/0.55)_0%,transparent_14%),radial-gradient(circle_at_68%_76%,rgb(134_147_155/0.28)_0%,transparent_38%),radial-gradient(circle_at_50%_50%,rgb(43_49_83/0.35)_0%,rgb(19_22_43/0.1)_72%)] shadow-[inset_0_0_60px_rgb(134_147_155/0.18),0_0_80px_rgb(80_88_112/0.18)] max-md:left-1/2 max-md:right-auto max-md:top-[26svh] max-md:h-[56vw] max-md:w-[56vw] max-md:-translate-x-1/2"
                />
              )}
              <div
                data-chapter={i}
                className={cn('fixed inset-x-0 bottom-0 z-10 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pr-14', LAYOUT[chapter.align])}
              >
                <p
                  data-line="soft"
                  style={{ opacity: 0 }}
                  className={cn('flex items-baseline gap-4', chapter.align === 'center' && 'md:justify-center')}
                >
                  <span aria-hidden className="font-mincho text-body text-steel/70">
                    {chapter.kanji}
                  </span>
                  <span className="font-mono text-caption tracking-[0.2em] text-slate">
                    {pad(i + 1)} — {pad(CHAPTERS.length)}
                    <span className="text-steel"> · {chapter.label}</span>
                  </span>
                </p>
                <h2
                  id={`chapter-${chapter.id}`}
                  className="mt-5 text-balance text-[clamp(2.1rem,4.4vw,4.6rem)] font-light leading-[1.04] tracking-[-0.035em] text-mist"
                >
                  {chapter.title.map(line => (
                    <span key={line} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
                      <span data-line="mask" style={{ opacity: 0 }} className="block">
                        {line}
                      </span>
                    </span>
                  ))}
                </h2>
                <p
                  data-line="soft"
                  style={{ opacity: 0 }}
                  className={cn(
                    'mt-6 max-w-[40ch] text-pretty text-body font-light leading-relaxed text-imperium-300 sm:text-h4 sm:font-light sm:leading-relaxed',
                    chapter.align === 'center' && 'md:mx-auto',
                  )}
                >
                  {chapter.body}
                </p>
                {chapter.details && (
                  <div data-line="soft" style={{ opacity: 0 }} className="mt-8 border-t border-white/10 pt-5">
                    <p className="font-mono text-caption tracking-[0.2em] text-steel">{chapter.details.label}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-small font-light text-imperium-200">
                      {chapter.details.items.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {chapter.hint && (
                  <p data-line="soft" style={{ opacity: 0 }} className="mt-8 text-small font-light text-imperium-400">
                    <span className="[@media(pointer:coarse)]:hidden">{chapter.hint.pointer}</span>
                    <span className="hidden [@media(pointer:coarse)]:inline">{chapter.hint.touch}</span>
                  </p>
                )}
                {last && (
                  <div
                    data-line="soft"
                    style={{ opacity: 0 }}
                    className={cn('mt-10 flex flex-wrap items-center gap-x-8 gap-y-4', chapter.align === 'center' && 'md:justify-center')}
                  >
                    <PrimaryAction onConfirm={confirm} />
                    <a href="#" className="text-small text-steel transition-colors duration-500 hover:text-mist">
                      Back to the homepage
                    </a>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </main>

      {/* Scroll hint: belongs to the first chapter, leaves with it. */}
      <div data-chapter={0} aria-hidden className="pointer-events-none fixed inset-x-0 bottom-8 z-10 hidden justify-center md:flex">
        <span data-line="soft" style={{ opacity: 0 }} className="relative block h-14 w-px overflow-hidden bg-white/10">
          <span className="glass-hero-scroll-hint absolute inset-x-0 top-0 h-5 bg-mist/70" />
        </span>
      </div>

      {/* Chapter rail: progress and direct jumps. */}
      <nav aria-label="Chapters" className="fixed right-3 top-1/2 z-30 -translate-y-1/2 sm:right-8">
        <div className="relative">
          <span aria-hidden className="absolute bottom-[7px] right-[5px] top-[7px] w-px bg-white/10">
            <span ref={railFillRef} className="block h-full w-full origin-top scale-y-0 bg-mist/60" />
          </span>
          <ol className="relative flex flex-col gap-6">
            {CHAPTERS.map((chapter, i) => (
              <li key={chapter.id} className="flex justify-end">
                <button
                  type="button"
                  onClick={() => appRef.current?.jumpTo(i)}
                  aria-current={i === active ? 'step' : undefined}
                  aria-label={`Chapter ${i + 1}: ${chapter.label}`}
                  className="group flex flex-row-reverse items-center gap-3 rounded-full p-0.5"
                >
                  <span
                    className={cn(
                      'block h-[7px] w-[7px] rounded-full border transition-colors duration-500',
                      i === active ? 'border-mist bg-mist' : 'border-white/30 bg-imperium-950 group-hover:border-white/60',
                    )}
                  />
                  <span
                    className={cn(
                      'hidden font-mono text-caption tracking-[0.2em] transition-[opacity,color] duration-500 xl:block',
                      i === active ? 'text-steel opacity-100' : 'text-slate opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                    )}
                  >
                    {pad(i + 1)} {chapter.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && (
          <p className="rounded-full border border-white/10 bg-imperium-900/85 px-5 py-3 text-small font-light text-imperium-200 backdrop-blur-md">
            {toast}
          </p>
        )}
      </div>

      {/* Cursor: exact dot + spring-lagged ring. Hidden on touch devices. */}
      <div ref={cursorRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] opacity-0">
        <span ref={ringRef} className="absolute left-0 top-0 -ml-[18px] -mt-[18px] h-9 w-9 rounded-full border border-white/35" />
        <span ref={dotRef} className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-mist" />
        <span ref={labelRef} className="absolute left-0 top-0 font-mono text-caption tracking-[0.2em] text-mist opacity-0">
          Click
        </span>
      </div>

      <div
        ref={loaderRef}
        role="progressbar"
        aria-label="Loading the experience"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-busy="true"
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-imperium-950 transition-[opacity,transform,filter] ease-out-soft"
      >
        <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.75" />
          <circle ref={arcRef} cx="24" cy="24" r="22" fill="none" stroke="#EFEFEF" strokeWidth="0.75" strokeLinecap="round" />
        </svg>
        <p ref={stepRef} className="font-mono text-caption tracking-[0.2em] text-slate">
          Loading type
        </p>
      </div>
    </div>
  )
}
