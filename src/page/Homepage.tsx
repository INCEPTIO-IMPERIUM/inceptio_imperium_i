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

/* ------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Story', href: '#story' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Contact', href: '#contact' },
]

const CHAPTERS = [
  {
    title: 'DISCOVER',
    text: 'We begin by listening — mapping your market, your people and the quiet signals most teams overlook.',
  },
  {
    title: 'DESIGN',
    text: 'Ideas become systems. Every screen, word and motion is shaped to feel inevitable, never loud.',
  },
  {
    title: 'BUILD',
    text: 'Engineering with restraint: fast, accessible and resilient products that are a pleasure to maintain.',
  },
  {
    title: 'SCALE',
    text: 'We measure, refine and grow with you — turning a strong launch into a lasting empire.',
  },
]

const CAPABILITY_TABS = [{ label: 'Strategy' }, { label: 'Design' }, { label: 'Engineering' }, { label: 'Growth' }]

const CAPABILITIES: { title: string; text: string; tag: string }[][] = [
  [
    { title: 'Product vision', text: 'A clear north star, sharpened through research and workshops.', tag: 'Workshop' },
    { title: 'Market mapping', text: 'Where you win, who you serve and why it matters now.', tag: 'Research' },
    { title: 'Roadmapping', text: 'A sequenced plan that balances ambition with momentum.', tag: 'Planning' },
  ],
  [
    { title: 'Brand identity', text: 'Quiet, confident identities built on a disciplined palette.', tag: 'Identity' },
    { title: 'Product design', text: 'Interfaces that feel calm under pressure, from flow to pixel.', tag: 'UI / UX' },
    { title: 'Design systems', text: 'Tokens, components and guidelines your team will actually use.', tag: 'System' },
  ],
  [
    { title: 'Web platforms', text: 'React front ends that are fast, accessible and easy to extend.', tag: 'Frontend' },
    { title: 'APIs & data', text: 'Typed services and data models designed to outlast the first release.', tag: 'Backend' },
    { title: 'Interactive 3D', text: 'WebGL and motion that add meaning, not just decoration.', tag: 'Creative' },
  ],
  [
    { title: 'Analytics', text: 'Tracking plans and dashboards that answer real questions.', tag: 'Insight' },
    { title: 'Experimentation', text: 'Structured tests that turn opinions into evidence.', tag: 'Optimise' },
    { title: 'Performance', text: 'Core Web Vitals, SEO and speed as a lasting advantage.', tag: 'Speed' },
  ],
]

// TODO: replace with the real contact details before launch.
const CONTACTS = [
  { label: 'Email', value: 'hello@imperium.studio', note: 'We reply within one business day.', action: 'Write to us', href: 'mailto:hello@imperium.studio' },
  { label: 'Book a call', value: '30-minute intro', note: 'A relaxed conversation about your goals — no pitch deck needed.', action: 'Pick a time', href: '#contact' },
  { label: 'LINE', value: '@imperium', note: 'Quick questions, quick answers, straight from the team.', action: 'Add us on LINE', href: '#contact' },
  { label: 'Phone', value: '+66 2 000 0000', note: 'Weekdays, 9:00 – 18:00 (GMT+7).', action: 'Call now', href: 'tel:+6620000000' },
  { label: 'LinkedIn', value: 'Imperium Studio', note: 'Follow our work, thinking and open roles.', action: 'Open LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'Visit', value: 'Bangkok, Thailand', note: 'Coffee is on us — let us know when you are around.', action: 'Get directions', href: '#contact' },
]

const PALETTE = {
  navy: '#2B3153',
  slate: '#505870',
  steel: '#86939B',
  mist: '#EFEFEF',
}

/* ------------------------------------------------------------------
 * Small building blocks
 * ------------------------------------------------------------------ */

function GlassButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'group inline-flex rounded-full transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 active:translate-y-0',
        className,
      )}
    >
      <GlassSurface
        tone="dark"
        width="auto"
        height={46}
        borderRadius={23}
        brightness={60}
        backgroundOpacity={0.06}
        saturation={1.4}
      >
        <span className="flex items-center gap-2 px-4 text-small font-medium text-mist">
          {children}
          <span aria-hidden className="transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </GlassSurface>
    </a>
  )
}

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-caption uppercase tracking-[0.2em] text-steel', className)}>{children}</p>
  )
}

/* ------------------------------------------------------------------
 * Sections
 * ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <GlassSurface
        tone="dark"
        width="100%"
        height={60}
        borderRadius={30}
        brightness={55}
        backgroundOpacity={0.08}
        saturation={1.3}
        className="max-w-5xl"
      >
        <nav className="flex w-full items-center justify-between gap-4 pl-4 pr-1" aria-label="Main">
          <a href="#top" className="font-mono text-small font-semibold tracking-[0.3em] text-mist">
            IMPERIUM
          </a>
          <ul className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 text-small text-imperium-300 transition-colors hover:bg-white/5 hover:text-mist"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="rounded-full bg-mist px-4 py-2 text-small font-medium text-navy transition-colors hover:bg-white"
          >
            Start a project
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
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.9])
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -120])
  const filter = useTransform(scrollYProgress, [0, 0.8], ['blur(0px)', reduceMotion ? 'blur(0px)' : 'blur(12px)'])

  return (
    <section id="top" ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="absolute inset-0 opacity-70">
        <MetaBalls
          color={PALETTE.slate}
          cursorBallColor={PALETTE.steel}
          enableTransparency
          speed={0.2}
          ballCount={14}
          animationSize={26}
          clumpFactor={1.1}
          cursorBallSize={3}
          hoverSmoothness={0.08}
        />
      </div>
      {/* Vignette keeps the title readable over the blobs. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(19_22_43/0.55)_55%,#13162b_100%)]"
      />

      <motion.div
        style={{ opacity, scale, y, filter }}
        className="pointer-events-none relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center"
      >
        <Eyebrow>Digital product studio · Est. 2026</Eyebrow>
        <div className="pointer-events-auto mt-4 h-[clamp(120px,24vw,300px)] w-full">
          <TechText
            text="IMPERIUM"
            fontFamily="Inter Variable"
            fontWeight={800}
            fontSize={220}
            letterSpacing={-0.02}
            color={PALETTE.mist}
            accentColor={PALETTE.steel}
            reveal="letter"
            specks={10}
          />
        </div>
        <BlurText
          text="Quiet confidence, engineered for the ambitious."
          delay={90}
          animateBy="words"
          direction="bottom"
          className="max-w-xl justify-center text-h4 font-normal text-imperium-300 sm:text-h3"
        />
        <div className="pointer-events-auto mt-10 flex flex-wrap justify-center gap-3">
          <GlassButton href="#story">Explore our story</GlassButton>
          <a
            href="#contact"
            className="inline-flex h-[46px] items-center rounded-full px-5 text-small font-medium text-imperium-300 transition-colors hover:text-mist"
          >
            Talk to us
          </a>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-3">
        <span className="font-mono text-caption uppercase tracking-[0.3em] text-steel">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-mist"
            animate={reduceMotion ? undefined : { y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </div>
    </section>
  )
}

function Chapters() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 270])
  const counterRotate = useTransform(rotate, r => -r * 0.6)
  const ringScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.9])

  useMotionValueEvent(scrollYProgress, 'change', v => {
    const next = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(v * CHAPTERS.length)))
    setActive(prev => (prev === next ? prev : next))
  })

  const jumpTo = (index: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const travel = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (travel * (index + 0.5)) / CHAPTERS.length, behavior: 'smooth' })
  }

  const chapter = CHAPTERS[active]

  return (
    <section id="story" ref={ref} className="relative" style={{ height: `${CHAPTERS.length * 100 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-20 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Text column */}
          <div className="order-2 lg:order-1">
            <Eyebrow>
              Chapter {String(active + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
            </Eyebrow>
            <div className="mt-2 h-28 w-full sm:h-36">
              <TechText
                text={chapter.title}
                fontFamily="Inter Variable"
                fontWeight={800}
                fontSize={160}
                letterSpacing={-0.02}
                color={PALETTE.mist}
                accentColor={PALETTE.steel}
                sweep={false}
                labels={false}
                specks={6}
              />
            </div>
            <div className="min-h-[5.5rem]">
              <BlurText
                key={active}
                text={chapter.text}
                delay={45}
                animateBy="words"
                direction="bottom"
                stepDuration={0.3}
                className="max-w-lg text-body text-imperium-300 sm:text-h4 sm:font-normal"
              />
            </div>

            <ol className="mt-10 grid max-w-lg grid-cols-4 gap-3">
              {CHAPTERS.map((c, i) => (
                <li key={c.title}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    className="group w-full text-left"
                    aria-current={i === active ? 'step' : undefined}
                  >
                    <span className="block h-px w-full overflow-hidden bg-white/10">
                      <span
                        className={cn(
                          'block h-full origin-left bg-mist transition-transform duration-500 ease-out-soft',
                          i <= active ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        'mt-3 block font-mono text-caption uppercase tracking-[0.15em] transition-colors',
                        i === active ? 'text-mist' : 'text-slate group-hover:text-steel',
                      )}
                    >
                      {c.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Pinned visual */}
          <div className="order-1 flex justify-center lg:order-2">
            <motion.div
              style={{ scale: ringScale }}
              className="relative aspect-square w-[min(62vw,420px)] lg:w-[min(40vw,460px)]"
            >
              <motion.svg style={{ rotate }} viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="100" cy="100" r="96" fill="none" stroke={PALETTE.slate} strokeWidth="0.4" strokeDasharray="1 3" />
                <circle cx="100" cy="4" r="2.2" fill={PALETTE.mist} />
              </motion.svg>
              <motion.svg
                style={{ rotate: counterRotate }}
                viewBox="0 0 200 200"
                className="absolute inset-[12%] h-[76%] w-[76%]"
                aria-hidden
              >
                <circle cx="100" cy="100" r="98" fill="none" stroke={PALETTE.steel} strokeWidth="0.3" strokeDasharray="12 6" />
                <circle cx="100" cy="198" r="2.5" fill={PALETTE.steel} />
              </motion.svg>
              <div className="absolute inset-[18%] opacity-80">
                <ShapeBlur variation={2} shapeSize={1} roundness={0.5} borderSize={0.04} circleSize={0.35} circleEdge={0.6} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, filter: 'blur(12px)', y: 16 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, filter: 'blur(12px)', y: -16 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="font-mono text-[clamp(3rem,9vw,6rem)] font-light tracking-tight text-mist"
                  >
                    {String(active + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          aria-hidden
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-slate via-steel to-mist"
        />
      </div>
    </section>
  )
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="mt-2 h-24 w-full max-w-4xl sm:h-36">
        <TechText
          text={title}
          fontFamily="Inter Variable"
          fontWeight={800}
          fontSize={150}
          letterSpacing={-0.02}
          color={PALETTE.mist}
          accentColor={PALETTE.steel}
          sweep={false}
          specks={6}
        />
      </div>
      <BlurText
        text={subtitle}
        delay={60}
        animateBy="words"
        direction="bottom"
        className="max-w-xl justify-center text-body text-imperium-300 sm:text-h4 sm:font-normal"
      />
    </div>
  )
}

function Capabilities() {
  const [tab, setTab] = useState(0)

  return (
    <section id="capabilities" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-32 sm:px-8">
      <SectionTitle
        eyebrow="What we do"
        title="CAPABILITIES"
        subtitle="Four disciplines, one studio. Pick a lens to see how we can help."
      />

      <div className="mt-12 flex justify-center">
        <GooeyNav
          items={CAPABILITY_TABS}
          onChange={index => setTab(index)}
          particleCount={12}
          particleDistances={[70, 8]}
          className="text-small font-medium sm:text-body"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          role="tabpanel"
          className="mt-12 grid gap-4 md:grid-cols-3"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
            exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
          }}
        >
          {CAPABILITIES[tab].map((item, i) => (
            <motion.article
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
                show: { opacity: 1, y: 0, filter: 'blur(0px)' },
                exit: { opacity: 0, y: -12, filter: 'blur(8px)' },
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.05]"
            >
              <div className="-ml-3 -mt-3 h-28 w-28 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                <ShapeBlur variation={i % 4} shapeSize={1} roundness={0.5} borderSize={0.05} circleSize={0.3} circleEdge={0.5} />
              </div>
              <p className="mt-4 font-mono text-caption uppercase tracking-[0.15em] text-steel">{item.tag}</p>
              <h3 className="mt-2 text-h3 text-mist">{item.title}</h3>
              <p className="mt-2 text-small text-imperium-300">{item.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-small font-medium text-mist/70 transition-colors group-hover:text-mist">
                Learn more <span aria-hidden>→</span>
              </span>
            </motion.article>
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
      className="relative inline-flex h-14 items-center overflow-hidden rounded-full bg-mist px-8 text-body font-semibold text-navy transition-transform duration-300 ease-out-soft hover:-translate-y-0.5"
    >
      {/* The WebGL layer only exists while hovered, so idle buttons cost nothing. */}
      {hovered && (
        <span className="absolute inset-0 opacity-50">
          <MetaBalls
            color={PALETTE.steel}
            cursorBallColor={PALETTE.slate}
            enableTransparency
            speed={0.5}
            ballCount={8}
            animationSize={14}
            clumpFactor={0.9}
            cursorBallSize={2.5}
            hoverSmoothness={0.15}
          />
        </span>
      )}
      <span className="relative flex items-center gap-2">
        {children} <span aria-hidden>→</span>
      </span>
    </a>
  )
}

function Contact() {
  const [selected, setSelected] = useState(0)
  const contact = CONTACTS[selected]

  return (
    <section id="contact" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-32 sm:px-8">
      <SectionTitle
        eyebrow="Get in touch"
        title="LET'S TALK"
        subtitle="Choose the channel that suits you — scroll or drag the wheel."
      />

      <div className="mt-16 grid items-center gap-8 lg:grid-cols-2">
        <div className="relative h-[360px] sm:h-[420px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-1/2 h-16 -translate-y-1/2 rounded-lg border-y border-white/10 bg-white/[0.02]"
          />
          <OptionWheel
            items={CONTACTS.map(c => c.label)}
            defaultSelected={0}
            onChange={index => setSelected(index)}
            textColor={PALETTE.slate}
            activeColor={PALETTE.mist}
            side="left"
            fontSize={2.4}
            spacing={1.5}
            tilt={8}
            blur={1.5}
            fade={0.22}
            inset={24}
            smoothing={160}
          />
        </div>

        <GlassSurface
          tone="dark"
          width="100%"
          height={360}
          borderRadius={24}
          brightness={50}
          backgroundOpacity={0.05}
          saturation={1.2}
        >
          <div className="flex h-full w-full flex-col justify-between p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Eyebrow>{contact.label}</Eyebrow>
                <p className="mt-3 break-words text-h2 text-mist sm:text-h1">{contact.value}</p>
                <p className="mt-3 max-w-sm text-body text-imperium-300">{contact.note}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-wrap items-center gap-4">
              <MetaBallsButton href={contact.href}>{contact.action}</MetaBallsButton>
              <span className="font-mono text-caption text-steel">
                {String(selected + 1).padStart(2, '0')} / {String(CONTACTS.length).padStart(2, '0')}
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
    <footer ref={footerRef} className="relative border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-small font-semibold tracking-[0.3em] text-mist">IMPERIUM</p>
          <p className="mt-3 max-w-xs text-small text-imperium-400">
            A digital product studio building calm, confident products.
          </p>
        </div>
        <ul className="flex flex-wrap gap-6 text-small text-imperium-300">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-mist">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#design-system" className="transition-colors hover:text-mist">
              Design system
            </a>
          </li>
        </ul>
        <p className="text-caption text-imperium-500">© {new Date().getFullYear()} Imperium. All rights reserved.</p>
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
    <div className="dark relative min-h-screen overflow-x-clip bg-imperium-950 text-mist">
      <Nav />
      <main>
        <Hero />
        <Chapters />
        <Capabilities />
        <Contact />
      </main>
      <Footer footerRef={footerRef} />

      <div
        aria-hidden
        className="transition-opacity duration-500"
        style={{ opacity: footerInView ? 0 : 1 }}
      >
        <GradualBlur
          target="page"
          position="bottom"
          height="7rem"
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
