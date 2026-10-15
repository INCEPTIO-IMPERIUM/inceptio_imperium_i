import BlurText from '../components/effect/BlurText'
import GlassSurface from '../components/effect/GlassSurface'
import { SectionTopline } from '../components/ui'

/*
 * DRAFT — textured canvas + bright violet, sampled from Cyberleaf.
 * Open at #draft-surface. Not linked from the site.
 */

// Contrast ratios measured against the grain canvas #1B1720.
const SWATCHES = [
  { name: 'Ink grain', token: 'ink-grain', hex: '#1B1720', note: 'canvas' },
  { name: 'Violet light', token: 'violet-light', hex: '#D5B9FF', note: '10.3:1' },
  { name: 'Lilac', token: 'lilac', hex: '#D4BAFF', note: '10.3:1' },
  { name: 'Violet', token: 'violet', hex: '#A879FF', note: '5.8:1' },
  { name: 'Violet deep', token: 'violet-deep', hex: '#9662E7', note: '4.4:1 · large only' },
]

export default function DraftSurface() {
  return (
    <div className="dark grain-overlay bg-grain min-h-screen overflow-x-clip text-mist">
      <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
        <GlassSurface tone="dark" width="100%" height={56} borderRadius={28} brightness={55} backgroundOpacity={0.05} saturation={1.2} className="max-w-3xl">
          <nav className="flex w-full items-center justify-between gap-4 pl-4 pr-1" aria-label="Draft">
            <span className="font-mono text-small tracking-[0.35em] text-mist">INCEPTIO IMPERIUM</span>
            <a href="#contact" className="bg-violet-gradient rounded-full px-4 py-2 text-small font-semibold text-imperium-950 transition-[filter,transform] duration-500 ease-out-soft hover:-translate-y-0.5 hover:brightness-110">
              Say hello ↗
            </a>
          </nav>
        </GlassSurface>
      </header>

      <main className="section-pad section-wrap pt-40">
        <SectionTopline eyebrow="Draft · Textured canvas" index={1} total={2} rule />

        <h1 className="max-w-4xl text-[clamp(2.75rem,7.5vw,6.5rem)] font-light leading-[0.92] tracking-[-0.03em]">
          A dark that holds <span className="text-violet-light">light.</span>
        </h1>
        <BlurText
          text="Fine grain over a lifted ink, a faint violet bloom from above, and the bright end of the violet saved for what should be pressed."
          delay={50}
          animateBy="words"
          direction="bottom"
          stepDuration={0.45}
          className="mt-8 max-w-lg text-body font-light leading-relaxed text-imperium-300 sm:text-h4 sm:font-light"
        />
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#draft-surface" className="bg-violet-gradient inline-flex items-center gap-4 rounded-full px-7 py-3.5 text-small font-semibold text-imperium-950 transition-[filter,transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgb(168_121_255/0.28)] hover:brightness-110">
            Start a project <span aria-hidden>↗</span>
          </a>
          <a href="#draft-surface" className="inline-flex items-center gap-4 rounded-full border border-white/15 px-7 py-3.5 text-small text-mist transition-colors duration-500 hover:border-violet-light/60">
            See the work <span aria-hidden className="text-violet-light">→</span>
          </a>
        </div>

        <div className="mt-28 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SWATCHES.map(s => (
            <div key={s.token}>
              <div className="aspect-[4/3] rounded-lg border border-white/10" style={{ backgroundColor: s.hex }} />
              <p className="mt-3 text-small text-mist">{s.name}</p>
              <p className="font-mono text-caption text-imperium-400">
                {s.hex} · {s.note}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
