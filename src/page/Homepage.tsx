import { useRef, useState, type ReactNode, type RefObject } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
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
import { cn } from '../lib/cn'

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
]

const MANIFESTO =
  'Restraint is not the absence of expression but its sharpest form. Nothing decorates for its own sake; motion earns its place by guiding attention, and the silence between elements is a material, not a gap.'

const PRINCIPLES = [
  {
    title: 'MA',
    kanji: '間',
    reading: 'ma — negative space',
    text: 'The meaningful use of emptiness. Space is not left over; it is placed, weighed and given a purpose.',
  },
  {
    title: 'KANSO',
    kanji: '簡素',
    reading: 'kanso — restraint',
    text: 'Nothing decorates for its own sake. What remains after everything unnecessary is removed is the design.',
  },
  {
    title: 'MOTION',
    kanji: '動',
    reading: 'dō — movement',
    text: 'Motion earns its place by guiding attention — never to perform, always to lead the eye somewhere it matters.',
  },
  {
    title: 'QUIET',
    kanji: '静',
    reading: 'sei — stillness',
    text: 'Precise, immersive, otherworldly. An interface that does not ask to be admired so much as inhabited.',
  },
]

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
  navy: '#2B3153',
  slate: '#505870',
  steel: '#86939B',
  mist: '#EFEFEF',
}

const EASE = [0.22, 1, 0.36, 1] as const
const MINCHO = 'font-mincho'

/* ------------------------------------------------------------------
 * Small building blocks
 * ------------------------------------------------------------------ */

function GlassButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'group inline-flex rounded-full transition-transform duration-500 ease-out-soft hover:-translate-y-0.5',
        className,
      )}
    >
      <GlassSurface
        tone="dark"
        width="auto"
        height={46}
        borderRadius={23}
        brightness={60}
        backgroundOpacity={0.04}
        saturation={1.2}
      >
        <span className="flex items-center gap-3 px-5 text-small tracking-wide text-mist">
          {children}
          <span aria-hidden className="text-steel transition-transform duration-500 ease-out-soft group-hover:translate-x-1">
            →
          </span>
        </span>
      </GlassSurface>
    </a>
  )
}

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-caption uppercase tracking-[0.3em] text-steel', className)}>{children}</p>
  )
}

/** A thin vertical rule — a pause between sections. */
function Pause() {
  return <div aria-hidden className="mx-auto h-32 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
}

/* ------------------------------------------------------------------
 * Sections
 * ------------------------------------------------------------------ */

function Nav() {
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
                  className="rounded-full px-4 py-2 text-small text-steel transition-colors duration-500 hover:text-mist"
                >
                  {link.label}
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

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -80])
  const filter = useTransform(scrollYProgress, [0, 0.7], ['blur(0px)', reduceMotion ? 'blur(0px)' : 'blur(10px)'])

  return (
    <section id="top" ref={ref} className="relative h-[100svh] min-h-[680px] overflow-hidden">
      {/* Sparse, slow blobs — atmosphere, not spectacle. */}
      <div className="absolute inset-0 opacity-35">
        <MetaBalls
          color={PALETTE.slate}
          cursorBallColor={PALETTE.steel}
          enableTransparency
          speed={0.12}
          ballCount={7}
          animationSize={30}
          clumpFactor={1.3}
          cursorBallSize={2}
          hoverSmoothness={0.04}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(19_22_43/0.6)_50%,#13162b_90%)]"
      />

      <motion.div
        style={{ opacity, y, filter }}
        className="pointer-events-none relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-4 text-center"
      >
        <Eyebrow>Portfolio · Intentional design</Eyebrow>
        <div className="pointer-events-auto mt-6 h-[clamp(100px,18vw,220px)] w-full max-w-4xl">
          <TechText
            text="INCEPTIO IMPERIUM"
            fontFamily="Inter Variable"
            fontWeight={300}
            fontSize={200}
            letterSpacing={0.02}
            color={PALETTE.mist}
            accentColor={PALETTE.steel}
            reveal="letter"
            specks={0}
            speed={0.5}
            strokeWidth={1}
          />
        </div>
        <BlurText
          text="Every pixel, every interaction, and every line of code should serve a purpose."
          delay={80}
          animateBy="words"
          direction="bottom"
          stepDuration={0.45}
          className="mt-4 max-w-lg justify-center text-body font-light leading-relaxed text-imperium-300 sm:text-h4 sm:font-light"
        />
        <div className="pointer-events-auto mt-14">
          <GlassButton href="#philosophy">Enter</GlassButton>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center">
        <span className="relative h-14 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-5 bg-mist/70"
            animate={reduceMotion ? undefined : { y: [-20, 56] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section className="relative mx-auto flex min-h-[90svh] max-w-3xl flex-col items-center justify-center px-6 py-40 text-center">
      <span aria-hidden className={cn('text-[4rem] leading-none text-steel/60', MINCHO)}>
        間
      </span>
      <Eyebrow className="mt-6">Inceptio Imperium is built on intentional design</Eyebrow>
      <BlurText
        text={MANIFESTO}
        delay={40}
        animateBy="words"
        direction="bottom"
        stepDuration={0.5}
        threshold={0.3}
        className="mt-10 justify-center text-h4 font-light leading-relaxed text-imperium-200 sm:text-h3 sm:font-light sm:leading-snug"
      />
    </section>
  )
}

function Principles() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 120])

  useMotionValueEvent(scrollYProgress, 'change', v => {
    const next = Math.min(PRINCIPLES.length - 1, Math.max(0, Math.floor(v * PRINCIPLES.length)))
    setActive(prev => (prev === next ? prev : next))
  })

  const jumpTo = (index: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const travel = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (travel * (index + 0.5)) / PRINCIPLES.length, behavior: 'smooth' })
  }

  const principle = PRINCIPLES[active]

  return (
    <section
      id="philosophy"
      ref={ref}
      className="relative"
      style={{ height: `${PRINCIPLES.length * 110 + 30}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-6 pt-16 sm:px-10 lg:grid-cols-[1fr_1fr]">
          {/* The pinned visual: one kanji, one ring, a lot of space. */}
          <div className="flex justify-center">
            <div className="relative aspect-square w-[min(58vw,380px)]">
              <motion.svg style={{ rotate }} viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="100" cy="100" r="98" fill="none" stroke={PALETTE.slate} strokeWidth="0.3" strokeDasharray="0.6 4" />
                <circle cx="100" cy="2" r="1.6" fill={PALETTE.mist} />
              </motion.svg>
              <div className="absolute inset-[14%] opacity-50">
                <ShapeBlur variation={2} shapeSize={1} roundness={0.5} borderSize={0.02} circleSize={0.35} circleEdge={0.7} />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, filter: 'blur(14px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(14px)' }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="flex flex-col items-center"
                  >
                    <span className={cn('text-[clamp(3.5rem,9vw,6rem)] leading-none text-mist', MINCHO)}>
                      {principle.kanji}
                    </span>
                    <span className="mt-5 font-mono text-caption uppercase tracking-[0.3em] text-steel">
                      {principle.reading}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div>
            <Eyebrow>
              Principle {String(active + 1).padStart(2, '0')} — {String(PRINCIPLES.length).padStart(2, '0')}
            </Eyebrow>
            <div className="mt-4 h-24 w-full max-w-md sm:h-32">
              <TechText
                text={principle.title}
                fontFamily="Inter Variable"
                fontWeight={300}
                fontSize={140}
                letterSpacing={0.04}
                color={PALETTE.mist}
                accentColor={PALETTE.steel}
                sweep={false}
                labels={false}
                specks={0}
                strokeWidth={1}
              />
            </div>
            <div className="min-h-[6rem]">
              <BlurText
                key={active}
                text={principle.text}
                delay={40}
                animateBy="words"
                direction="bottom"
                stepDuration={0.4}
                className="max-w-md text-body font-light leading-relaxed text-imperium-300 sm:text-h4 sm:font-light"
              />
            </div>

            <ol className="mt-14 flex max-w-md gap-6">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} className="flex-1">
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    className="group w-full text-left"
                    aria-current={i === active ? 'step' : undefined}
                    aria-label={`Principle ${i + 1}: ${p.title}`}
                  >
                    <span className="block h-px w-full overflow-hidden bg-white/10">
                      <span
                        className={cn(
                          'block h-full origin-left bg-mist/80 transition-transform duration-700 ease-out-soft',
                          i <= active ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        'mt-3 block text-small transition-colors duration-500',
                        MINCHO,
                        i === active ? 'text-mist' : 'text-slate group-hover:text-steel',
                      )}
                    >
                      {p.kanji}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
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
              className="group relative flex min-h-[320px] flex-col bg-imperium-950 p-8 transition-colors duration-700 hover:bg-imperium-900"
            >
              <div className="h-24 w-24 opacity-40 transition-opacity duration-700 group-hover:opacity-90">
                <ShapeBlur variation={[0, 1, 3][i % 3]} shapeSize={1} roundness={0.5} borderSize={0.03} circleSize={0.3} circleEdge={0.6} />
              </div>
              <div className="mt-auto">
                <p className="font-mono text-caption uppercase tracking-[0.2em] text-slate">{item.meta}</p>
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

function MetaBallsButton({ href, children }: { href: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative inline-flex h-12 items-center overflow-hidden rounded-full bg-mist px-7 text-small font-medium tracking-wide text-navy transition-transform duration-500 ease-out-soft hover:-translate-y-0.5"
    >
      {/* The WebGL layer only exists while hovered, so an idle button costs nothing. */}
      {hovered && (
        <span className="absolute inset-0 opacity-40">
          <MetaBalls
            color={PALETTE.steel}
            cursorBallColor={PALETTE.slate}
            enableTransparency
            speed={0.3}
            ballCount={5}
            animationSize={14}
            clumpFactor={0.9}
            cursorBallSize={2.5}
            hoverSmoothness={0.12}
          />
        </span>
      )}
      <span className="relative flex items-center gap-3">
        {children} <span aria-hidden>→</span>
      </span>
    </a>
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
              <span className="font-mono text-caption text-slate">
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
        <ul className="flex flex-wrap justify-center gap-8 text-caption uppercase tracking-[0.25em] text-slate">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors duration-500 hover:text-mist">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#experience" className="transition-colors duration-500 hover:text-mist">
              Experience
            </a>
          </li>
          <li>
            <a href="#design-system" className="transition-colors duration-500 hover:text-mist">
              System
            </a>
          </li>
        </ul>
        <a
          href="https://github.com/INCEPTIO-IMPERIUM"
          className="group flex items-center gap-3 text-caption uppercase tracking-[0.25em] text-slate transition-colors duration-500 hover:text-mist"
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
    <div className="dark relative min-h-screen overflow-x-clip bg-imperium-950 text-mist selection:bg-imperium-700 selection:text-mist">
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Pause />
        <Principles />
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
