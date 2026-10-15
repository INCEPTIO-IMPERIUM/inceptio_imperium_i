import { useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import BlurText from '../components/effect/BlurText'
import MetaBalls from '../components/effect/MetaBalls'
import TechText from '../components/effect/TechText'
import { Eyebrow, GlassButton, MetaBallsButton, SectionTopline } from '../components/ui'
import { cn } from '../lib/cn'

/*
 * DRAFT — phase 3: hero + Philosophy on the template base, built from react-bits.
 * Open at #draft-index. Once approved, Hero, Manifesto and Principles in
 * Homepage.tsx are replaced by these two sections and this route goes.
 *
 * Effect budget: one ambient effect per view — MetaBalls in the hero.
 * Everything below moves only in answer to the reader (BlurText on reveal, rows on click).
 */

const SECTIONS = 4 // hero, philosophy, work, contact

const MANIFESTO =
  'Nothing decorates for its own sake; motion earns its place by guiding attention, and the silence between elements is a material, not a gap.'

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

/** The closing words of a statement carry the gradient — the template's signature, on our violet. */
const closingWords = (count: number) => (index: number, total: number) =>
  index >= total - count ? 'text-gradient' : undefined

/**
 * A display statement: real text for assistive tech, BlurText for the eye.
 * BlurText renders a <p>, which can't sit inside a heading, so the heading is visually hidden.
 */
function Statement({
  as: Heading,
  text,
  gradientWords,
  className,
}: {
  as: 'h1' | 'h2'
  text: string
  gradientWords: number
  className?: string
}) {
  return (
    <>
      <Heading className="sr-only">{text}</Heading>
      <div aria-hidden>
        <BlurText
          text={text}
          delay={70}
          animateBy="words"
          direction="bottom"
          stepDuration={0.45}
          segmentClassName={closingWords(gradientWords)}
          className={className}
        />
      </div>
    </>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const filter = useTransform(scrollYProgress, [0, 0.75], ['blur(0px)', reduceMotion ? 'blur(0px)' : 'blur(10px)'])

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* The one ambient effect: violet MetaBalls where the template had its photograph, fading out behind the copy. */}
      <div className="absolute inset-y-0 right-0 w-full opacity-60 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent_25%,black_75%),linear-gradient(to_bottom,transparent_16%,black_42%)] lg:w-[65%]">
        <MetaBalls
          color="#9662E7"
          cursorBallColor="#D5B9FF"
          enableTransparency
          speed={0.12}
          ballCount={8}
          animationSize={22}
          clumpFactor={1.15}
          cursorBallSize={2}
          hoverSmoothness={0.05}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-grain to-transparent" />

      <motion.div
        style={{ opacity, filter }}
        className="section-wrap pointer-events-none relative z-10 flex flex-1 flex-col px-[clamp(1.5rem,6.5vw,6.25rem)] pb-10 pt-32"
      >
        <SectionTopline eyebrow="Inceptio Imperium · Studio" index={1} total={SECTIONS} rule />

        <div className="my-auto max-w-4xl py-10">
          {/* TechText centres and fits its text to 90% of the box; widening the box by 1/0.9
              and pulling it left by the same margin puts the ink flush with the column. */}
          <div className="pointer-events-auto -ml-[5.55%] aspect-[8/1] w-[111.1%]">
            <TechText
              text="INCEPTIO IMPERIUM"
              fontFamily="Inter Variable"
              fontWeight={300}
              fontSize={200}
              letterSpacing={0.02}
              color="#F7F3FB"
              accentColor="#9A8DA9"
              reveal="letter"
              specks={0}
              speed={0.5}
              strokeWidth={1}
            />
          </div>
          <Statement
            as="h1"
            text="Intentional design for quiet software."
            gradientWords={2}
            className="mt-4 text-[clamp(2rem,4.6vw,4rem)] font-light leading-[1.04] tracking-[-0.025em] text-mist"
          />
          <p className="mt-6 max-w-md text-body font-light leading-relaxed text-imperium-300">
            Every pixel, every interaction, and every line of code should serve a purpose.
          </p>
          <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
            <MetaBallsButton href="#contact" tone="violet">
              Start a project
            </MetaBallsButton>
            <GlassButton href="#philosophy">The philosophy</GlassButton>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="flex items-center gap-3 font-mono text-caption uppercase tracking-[0.25em] text-imperium-500">
            <span aria-hidden className="h-px w-8 bg-white/25" />
            Human-paced. Pixel-precise.
          </p>
          <div className="hidden max-w-[15rem] border-l border-white/20 pl-4 sm:block">
            <Eyebrow className="mb-2">Point of view</Eyebrow>
            <p className="text-small font-light leading-relaxed text-imperium-300">
              Less noise. Fewer ornaments. More room to think.
            </p>
          </div>
        </div>
      </motion.div>
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
        <h3 className="text-[clamp(1.25rem,2.6vw,2rem)] font-light tracking-[0.04em] text-mist">
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

        <div id={id} role="region" aria-label={principle.title} hidden={!open} className="mt-6 max-w-md pb-12">
          {/* Mounted only while open, so BlurText replays its un-blur every time the row opens. */}
          {open && (
            <>
              <motion.p
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: EASE }}
                className="flex items-baseline gap-4"
              >
                <span className="font-mincho text-h3 text-imperium-200">{principle.kanji}</span>
                <span className="font-mono text-caption uppercase tracking-[0.3em] text-steel">{principle.reading}</span>
              </motion.p>
              <BlurText
                text={principle.text}
                delay={30}
                animateBy="words"
                direction="bottom"
                stepDuration={0.4}
                className="mt-5 text-body font-light leading-relaxed text-imperium-300"
              />
              <p className="mt-6 flex gap-3 border-t border-white/10 pt-4 text-small font-light text-imperium-400">
                <span className="font-mono text-caption uppercase tracking-[0.2em] text-imperium-500">Rule</span>
                {principle.rule}
              </p>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

function Philosophy() {
  const [open, setOpen] = useState(0)

  return (
    <section id="philosophy" className="section-pad section-wrap scroll-mt-24">
      <SectionTopline eyebrow="The philosophy" index={2} total={SECTIONS} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
        <Statement
          as="h2"
          text="Restraint is the sharpest form."
          gradientWords={2}
          className="text-[clamp(2.5rem,5.5vw,5rem)] font-light leading-[0.98] tracking-[-0.03em] text-mist"
        />
        <div className="flex flex-col justify-end">
          <BlurText
            text={MANIFESTO}
            delay={25}
            animateBy="words"
            direction="bottom"
            stepDuration={0.45}
            className="max-w-xl text-h4 font-light leading-relaxed text-imperium-200"
          />
        </div>
      </div>

      <div className="mb-10 mt-24 flex items-end justify-between gap-6">
        <Eyebrow>Four principles</Eyebrow>
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
        DRAFT · PHASE 3 — HERO + PHILOSOPHY
      </p>
      <Hero />
      <Philosophy />
    </div>
  )
}
