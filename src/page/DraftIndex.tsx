import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import BlurText from '../components/effect/BlurText'
import { cn } from '../lib/cn'

/*
 * DRAFT — concept "Index" (hero + numbered principles).
 * Not linked from the site; open at #draft-index. Once approved, these two
 * sections replace Hero and Principles in Homepage.tsx and this file goes.
 *
 * Vivid colour is treated as light, not paint: one blurred glow and one thin
 * stroke in the hero, and only the open row's numeral in the index.
 */

const PRINCIPLES = [
  {
    title: 'Ma',
    kanji: '間',
    reading: 'ma — negative space',
    text: 'The meaningful use of emptiness. Space is not left over; it is placed, weighed and given a purpose.',
    rule: 'Sections breathe at 160px. Text columns stay narrow.',
    hue: 'text-violet',
  },
  {
    title: 'Kanso',
    kanji: '簡素',
    reading: 'kanso — restraint',
    text: 'Nothing decorates for its own sake. What remains after everything unnecessary is removed is the design.',
    rule: 'One ambient effect per view. No ornaments, no badges.',
    hue: 'text-coral',
  },
  {
    title: 'Motion',
    kanji: '動',
    reading: 'dō — movement',
    text: 'Motion earns its place by guiding attention — never to perform, always to lead the eye somewhere it matters.',
    rule: 'Things arrive by un-blurring and leave by blurring.',
    hue: 'text-lime',
  },
  {
    title: 'Quiet',
    kanji: '静',
    reading: 'sei — stillness',
    text: 'Precise, immersive, otherworldly. An interface that does not ask to be admired so much as inhabited.',
    rule: 'When unsure between two options, choose the quieter one.',
    hue: 'text-lilac',
  },
]

const EASE = [0.22, 1, 0.36, 1] as const

const RING_LENGTH = 1100

/** A loose hand-drawn ring around one word, drawn once on load. */
function Ring({ children }: { children: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -left-[14%] -top-[30%] h-[160%] w-[128%] -rotate-[4deg] overflow-visible"
      >
        <motion.path
          d="M30 78 C 40 22, 330 6, 380 52 C 412 84, 330 128, 190 130 C 70 132, 8 110, 22 76 C 32 52, 120 30, 250 26"
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={2}
          strokeLinecap="round"
          // Dash in real user units (path ≈ 1036 long): motion's pathLength is unreliable under preserveAspectRatio="none".
          strokeDasharray={RING_LENGTH}
          initial={{ strokeDashoffset: reduceMotion ? 0 : RING_LENGTH }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.6, delay: 0.6, ease: EASE }}
        />
      </svg>
    </span>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-24 pt-32 sm:px-10">
      {/* The one light source: violet bleeding into coral, behind the second line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[16%] top-[26%] h-[52vh] w-[min(72vw,800px)] rounded-full bg-[radial-gradient(closest-side,rgb(255_90_78/0.7)_0%,rgb(255_90_78/0.7)_30%,rgb(168_121_255/0.55)_62%,transparent)] blur-[48px]"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-steel">Inceptio Imperium · Studio</p>
        <h1 className="mt-8 max-w-5xl text-[clamp(2.5rem,8.4vw,7.5rem)] font-light uppercase leading-[0.95] tracking-[-0.02em] text-mist">
          Intentional design for <Ring>quiet</Ring> software
        </h1>
        <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <BlurText
            text="Every pixel, every interaction, and every line of code should serve a purpose."
            delay={60}
            animateBy="words"
            direction="bottom"
            stepDuration={0.45}
            className="max-w-sm text-body font-light leading-relaxed text-imperium-300"
          />
          <a
            href="#contact"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/20 px-5 py-2.5 text-small text-mist transition-colors duration-500 hover:border-white/50"
          >
            Get in touch
            <span aria-hidden className="transition-transform duration-500 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

function IndexRow({
  index,
  principle,
  open,
  onToggle,
}: {
  index: number
  principle: (typeof PRINCIPLES)[number]
  open: boolean
  onToggle: () => void
}) {
  const id = useId()
  const number = String(index + 1).padStart(2, '0')

  return (
    <li
      className={cn(
        'group grid grid-cols-[auto_1fr] items-start gap-x-6 overflow-hidden border-t border-white/15 transition-[max-height] duration-700 ease-out-soft sm:grid-cols-[1fr_1fr] sm:gap-x-10',
        open ? 'max-h-[60rem]' : 'max-h-[clamp(5rem,13vw,10.5rem)]',
      )}
    >
      {/* Closed rows show only the top of the numeral — the rule cuts it, which invites the click. */}
      <span
        aria-hidden
        onClick={onToggle}
        className={cn(
          'block cursor-pointer select-none pt-4 text-[clamp(7rem,21vw,17rem)] font-extralight leading-[0.8] tracking-[-0.04em] tabular-nums transition-colors duration-700',
          open ? principle.hue : 'text-mist group-hover:text-imperium-200',
        )}
      >
        {number}
      </span>

      <div className="pt-6 sm:pt-10">
        <h3 className="text-[clamp(1.25rem,2.6vw,2rem)] font-light uppercase tracking-[0.04em] text-mist">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={id}
            className="flex w-full items-center justify-between gap-4 text-left uppercase"
          >
            <span>
              <span className="sr-only">{number} — </span>
              {principle.title}
            </span>
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/25 text-body text-steel transition-colors duration-500 group-hover:border-white/50 group-hover:text-mist"
            >
              {open ? '−' : '+'}
            </span>
          </button>
        </h3>

        <motion.div
          id={id}
          role="region"
          aria-label={principle.title}
          hidden={!open}
          initial={false}
          animate={open ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(12px)' }}
          transition={{ duration: 0.6, ease: EASE, delay: open ? 0.15 : 0 }}
          className="mt-6 max-w-md pb-12"
        >
          <p className="flex items-baseline gap-4">
            <span className="font-mincho text-h3 text-imperium-200">{principle.kanji}</span>
            <span className="font-mono text-caption uppercase tracking-[0.3em] text-steel">{principle.reading}</span>
          </p>
          <p className="mt-5 text-body font-light leading-relaxed text-imperium-300">{principle.text}</p>
          <p className="mt-6 flex gap-3 border-t border-white/10 pt-4 text-small font-light text-imperium-400">
            <span className="font-mono text-caption uppercase tracking-[0.2em] text-imperium-500">Rule</span>
            {principle.rule}
          </p>
        </motion.div>
      </div>
    </li>
  )
}

function PrincipleIndex() {
  const [open, setOpen] = useState(0)

  return (
    <section id="philosophy" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-40 sm:px-10">
      <div className="mb-16 flex items-end justify-between gap-6">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-steel">Four principles</p>
        <p className="font-mono text-caption tracking-[0.2em] text-imperium-500">01 — 04</p>
      </div>
      <ol className="border-b border-white/15">
        {PRINCIPLES.map((p, i) => (
          <IndexRow key={p.title} index={i} principle={p} open={open === i} onToggle={() => setOpen(i === open ? -1 : i)} />
        ))}
      </ol>
    </section>
  )
}

export default function DraftIndex() {
  return (
    <div className="dark grain-overlay bg-grain min-h-screen overflow-x-clip text-mist">
      <p className="fixed left-4 top-4 z-50 rounded-full border border-white/10 bg-ink-grain/70 px-3 py-1 font-mono text-caption tracking-[0.2em] text-steel backdrop-blur">
        DRAFT · CONCEPT A — INDEX
      </p>
      <Hero />
      <PrincipleIndex />
    </div>
  )
}
