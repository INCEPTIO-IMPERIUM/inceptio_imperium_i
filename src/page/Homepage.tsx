import { useId, useRef, useState, type RefObject } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import BlurText from '../components/effect/BlurText'
import GlassSurface from '../components/effect/GlassSurface'
import GooeyNav from '../components/effect/GooeyNav'
import GradualBlur from '../components/effect/GradualBlur'
import MetaBalls from '../components/effect/MetaBalls'
import OptionWheel from '../components/effect/OptionWheel'
import ShapeBlur from '../components/effect/ShapeBlur'
import TechText from '../components/effect/TechText'
import { Eyebrow, GlassButton, MetaBallsButton, SectionTopline } from '../components/ui'
import { cn } from '../lib/cn'
import { useActiveSection } from '../lib/useActiveSection'

/*
 * Inceptio Imperium — intentional design.
 * 間 (ma): negative space is a material. Every effect on this page is kept
 * slow, low-contrast and sparse so it guides attention rather than performs.
 */

/* ------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
  { label: 'About', href: '#about' },
]

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

// Section count for the toplines: hero, philosophy, work, contact.
const SECTIONS = 4

const WORK_TABS = [{ label: 'Interface' }, { label: 'Motion' }, { label: 'Systems' }]

// TODO: replace with real projects.
const WORK: { title: string; text: string; meta: string }[][] = [
  [
    { title: 'Shizuka', text: 'A reading app where the interface steps aside for the words.', meta: 'Product · 2026' },
    { title: 'Kōbō Atelier', text: 'An e-commerce storefront paced like a gallery walk.', meta: 'Web · 2025' },
    { title: 'Hollow Hours', text: 'A calm calendar that shows time as space, not pressure.', meta: 'Concept · 2025' },
  ],
  [
    { title: 'Drift', text: 'Scroll-led storytelling where each transition carries meaning.', meta: 'WebGL · 2026' },
    { title: 'Ink & Air', text: 'Micro-interactions studied from brush strokes and breath.', meta: 'Study · 2025' },
    { title: 'Tide Index', text: 'Data that moves only when it has something to say.', meta: 'Dataviz · 2024' },
  ],
  [
    { title: 'Ma Tokens', text: 'A spacing-first design system where emptiness is a token.', meta: 'System · 2026' },
    { title: 'Kanso UI', text: 'Twelve components, no ornaments, every state considered.', meta: 'Library · 2025' },
    { title: 'Quiet Stack', text: 'A front-end architecture tuned for speed and silence.', meta: 'Engineering · 2024' },
  ],
]

// Email and GitHub come from the Inceptio Imperium organization.
// TODO: replace the LinkedIn and Dribbble placeholders with real profiles.
const CONTACTS = [
  { label: 'Email', value: 'p.theeranat.dev@gmail.com', note: 'For commissions, collaborations and quiet conversations.', action: 'Write', href: 'mailto:p.theeranat.dev@gmail.com' },
  { label: 'GitHub', value: 'Inceptio Imperium', note: 'Open-source experiments in motion, shaders and restraint.', action: 'View code', href: 'https://github.com/INCEPTIO-IMPERIUM' },
  { label: 'LinkedIn', value: 'Inceptio Imperium', note: 'Work history, references and the occasional essay.', action: 'Open profile', href: 'https://www.linkedin.com/' },
  { label: 'Dribbble', value: '@inceptio-imperium', note: 'Fragments, studies and unfinished ideas.', action: 'See studies', href: 'https://dribbble.com/' },
  { label: 'Book a call', value: '30 minutes', note: 'An unhurried introduction — bring a question, not a brief.', action: 'Pick a time', href: '#contact' },
]

const PALETTE = {
  navy: '#211A29',
  slate: '#71657C',
  steel: '#9A8DA9',
  mist: '#F7F3FB',
}

const EASE = [0.22, 1, 0.36, 1] as const
const MINCHO = 'font-mincho'

/* ------------------------------------------------------------------
 * Small building blocks
 * ------------------------------------------------------------------ */

/** A thin vertical rule — a pause between sections. */
function Pause() {
  return <div aria-hidden className="mx-auto h-32 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
}

/* ------------------------------------------------------------------
 * Sections
 * ------------------------------------------------------------------ */

// In-page sections the nav tracks; '#about' is a separate page, so it never lights up here.
const SPY_IDS = NAV_LINKS.filter(link => link.href !== '#about').map(link => link.href.slice(1))

function Nav() {
  const active = useActiveSection(SPY_IDS)
  const reduceMotion = useReducedMotion()

  return (
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
        <nav className="flex w-full items-center justify-between gap-4 pl-4 pr-1" aria-label="Main">
          <a href="#top" className="font-mono text-small tracking-[0.35em] text-mist">
            INCEPTIO IMPERIUM
          </a>
          <ul className="hidden items-center sm:flex">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active === link.href.slice(1) ? 'location' : undefined}
                  className={cn(
                    'relative block rounded-full px-4 py-2 text-small transition-colors duration-500 hover:text-mist',
                    active === link.href.slice(1) ? 'text-mist' : 'text-steel',
                  )}
                >
                  {link.label}
                  {/* One underline that travels between links — it follows the reader, it never loops. */}
                  {active === link.href.slice(1) && (
                    <motion.span
                      layoutId="nav-underline"
                      aria-hidden
                      className="absolute inset-x-4 bottom-1 h-px bg-violet"
                      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="rounded-full border border-white/15 px-4 py-2 text-small text-mist transition-colors duration-500 hover:border-white/40"
          >
            Say hello
          </a>
        </nav>
      </GlassSurface>
    </header>
  )
}

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
      {/* The one ambient effect: violet MetaBalls where the template had its photograph. The mask fades them
          away from the copy (left), the topline (top) and the small meta row (bottom), so text keeps its contrast. */}
      <div className="absolute inset-y-0 right-0 w-full opacity-60 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent_25%,black_75%),linear-gradient(to_bottom,transparent_16%,black_42%),linear-gradient(to_top,transparent_24%,black_46%)] lg:w-[65%]">
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
        className="section-wrap pointer-events-none relative z-10 flex flex-1 flex-col px-[clamp(1.5rem,6.5vw,6.25rem)] pb-32 pt-28"
      >
        <SectionTopline eyebrow="Inceptio Imperium · Studio" index={1} total={SECTIONS} rule />

        <div className="my-auto max-w-4xl py-4">
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

        {/* pb-32 (8rem) above keeps this row clear of the page's fixed 8rem GradualBlur. */}
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

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="mt-4 h-20 w-full max-w-2xl sm:h-28">
        <TechText
          text={title}
          fontFamily="Inter Variable"
          fontWeight={300}
          fontSize={130}
          letterSpacing={0.04}
          color={PALETTE.mist}
          accentColor={PALETTE.steel}
          sweep={false}
          specks={0}
          strokeWidth={1}
        />
      </div>
      <BlurText
        text={subtitle}
        delay={50}
        animateBy="words"
        direction="bottom"
        className="mt-2 max-w-md justify-center text-body font-light text-imperium-300"
      />
    </div>
  )
}

function Work() {
  const [tab, setTab] = useState(0)

  return (
    <section id="work" className="relative mx-auto max-w-5xl scroll-mt-24 px-6 py-40 sm:px-10">
      <SectionTitle eyebrow="Selected work" title="WORK" subtitle="Fewer projects, each one considered to the last pixel." />

      <div className="mt-16 flex justify-center">
        <GooeyNav
          items={WORK_TABS}
          onChange={index => setTab(index)}
          particleCount={8}
          particleDistances={[60, 6]}
          animationTime={700}
          className="text-small tracking-wide"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
            exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
          }}
        >
          {WORK[tab].map((item, i) => (
            <motion.a
              key={item.title}
              href="#work"
              variants={{
                hidden: { opacity: 0, filter: 'blur(10px)' },
                show: { opacity: 1, filter: 'blur(0px)' },
                exit: { opacity: 0, filter: 'blur(10px)' },
              }}
              transition={{ duration: 0.6, ease: EASE }}
              className="group relative flex min-h-[320px] flex-col bg-ink-grain p-8 transition-colors duration-700 hover:bg-ink-grain-raised"
            >
              <div className="h-24 w-24 opacity-40 transition-opacity duration-700 group-hover:opacity-90">
                <ShapeBlur variation={[0, 1, 3][i % 3]} shapeSize={1} roundness={0.5} borderSize={0.03} circleSize={0.3} circleEdge={0.6} />
              </div>
              <div className="mt-auto">
                <p className="font-mono text-caption uppercase tracking-[0.2em] text-imperium-500">{item.meta}</p>
                <h3 className="mt-3 text-h3 font-light text-mist">{item.title}</h3>
                <p className="mt-2 text-small font-light text-imperium-400 transition-colors duration-700 group-hover:text-imperium-300">
                  {item.text}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function Contact() {
  const [selected, setSelected] = useState(0)
  const contact = CONTACTS[selected]

  return (
    <section id="contact" className="relative mx-auto max-w-5xl scroll-mt-24 px-6 py-40 sm:px-10">
      <SectionTitle eyebrow="Contact" title="HELLO" subtitle="Turn the wheel. Choose the way that feels right." />

      <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
        <div className="relative h-[340px] sm:h-[380px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-14 -translate-y-1/2 border-y border-white/[0.07]"
          />
          <OptionWheel
            items={CONTACTS.map(c => c.label)}
            defaultSelected={0}
            onChange={index => setSelected(index)}
            textColor={PALETTE.slate}
            activeColor={PALETTE.mist}
            side="left"
            fontSize={2.2}
            spacing={1.6}
            tilt={7}
            blur={2}
            fade={0.28}
            inset={16}
            smoothing={220}
          />
        </div>

        <GlassSurface
          tone="dark"
          width="100%"
          height={320}
          borderRadius={20}
          brightness={50}
          backgroundOpacity={0.03}
          saturation={1.1}
        >
          <div className="flex h-full w-full flex-col justify-between p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Eyebrow>{contact.label}</Eyebrow>
                <p className="mt-4 break-words text-h2 font-light text-mist">{contact.value}</p>
                <p className="mt-3 max-w-sm text-small font-light leading-relaxed text-imperium-300">{contact.note}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between gap-4">
              <MetaBallsButton href={contact.href}>{contact.action}</MetaBallsButton>
              <span className="font-mono text-caption text-imperium-500">
                {String(selected + 1).padStart(2, '0')} — {String(CONTACTS.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </GlassSurface>
      </div>
    </section>
  )
}

function Footer({ footerRef }: { footerRef: RefObject<HTMLElement | null> }) {
  return (
    <footer ref={footerRef} className="relative">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-16 pt-24 text-center sm:px-10">
        <span aria-hidden className={cn('text-h2 text-slate', MINCHO)}>
          静
        </span>
        <p className="max-w-sm text-small font-light leading-relaxed text-imperium-400">
          A portfolio that doesn't ask to be admired so much as inhabited.
        </p>
        <ul className="flex flex-wrap justify-center gap-8 text-caption uppercase tracking-[0.25em] text-imperium-500">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors duration-500 hover:text-mist">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#design-system" className="transition-colors duration-500 hover:text-mist">
              System
            </a>
          </li>
        </ul>
        <a
          href="https://github.com/INCEPTIO-IMPERIUM"
          className="group flex items-center gap-3 text-caption uppercase tracking-[0.25em] text-imperium-500 transition-colors duration-500 hover:text-mist"
        >
          {/* The organization's í mark, echoing its cream-and-ink avatar. */}
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#f3f1ea] font-serif text-body normal-case italic tracking-normal leading-none text-imperium-950 transition-transform duration-500 group-hover:-translate-y-0.5"
          >
            í
          </span>
          Inceptio Imperium on GitHub
        </a>
        <p className="font-mono text-caption tracking-[0.2em] text-imperium-600">
          © {new Date().getFullYear()} INCEPTIO IMPERIUM
        </p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------ */

export default function Homepage() {
  const footerRef = useRef<HTMLElement>(null)
  // Hide the bottom blur veil once the footer arrives, so the last line is never blurred.
  const footerInView = useInView(footerRef, { margin: '0px 0px -40px 0px' })

  return (
    <div className="dark grain-overlay bg-grain relative min-h-screen overflow-x-clip text-mist selection:bg-imperium-700 selection:text-mist">
      <Nav />
      <main>
        <Hero />
        <Philosophy />
        <Pause />
        <Work />
        <Pause />
        <Contact />
      </main>
      <Footer footerRef={footerRef} />

      <div aria-hidden className="transition-opacity duration-700" style={{ opacity: footerInView ? 0 : 1 }}>
        <GradualBlur
          target="page"
          position="bottom"
          height="8rem"
          strength={2}
          divCount={6}
          curve="bezier"
          exponential
          opacity={1}
          zIndex={40}
        />
      </div>
    </div>
  )
}
