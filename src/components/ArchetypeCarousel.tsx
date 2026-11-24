// Horizontal swipe carousel of full-body archetype figures (scroll-snap centering).
// The centered card is the selected one; swipe, tap or use the desktop chevrons.
import { useEffect, useLayoutEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ARCHETYPES } from '../lib/game'
import { CharacterArt } from './CharacterArt'

interface ArchetypeCarouselProps {
  value: string | null
  suggestedId: string | null
  onChange: (id: string) => void
}

export function ArchetypeCarousel({ value, suggestedId, onChange }: ArchetypeCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  /** Ignore scroll-derived selection while a programmatic smooth scroll is in flight. */
  const programmaticUntil = useRef(0)
  const lastReported = useRef<string | null>(value)
  const rafId = useRef<number | null>(null)

  const centerCard = (id: string, behavior: ScrollBehavior = 'smooth') => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const card = scroller.querySelector<HTMLElement>(`[data-arch="${id}"]`)
    if (!card) return
    if (behavior === 'smooth') programmaticUntil.current = Date.now() + 700
    scroller.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - scroller.clientWidth / 2, behavior })
  }

  // Auto-center the selected (or suggested) card on mount.
  useLayoutEffect(() => {
    const initial = value ?? suggestedId ?? ARCHETYPES[0]?.id ?? null
    if (initial) {
      lastReported.current = initial
      centerCard(initial, 'auto')
      if (value === null) onChange(initial)
    }
    // Mount only — later changes come from user interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    },
    [],
  )

  /** Id of the card whose center is closest to the scroller center. */
  const closestId = (): string | null => {
    const scroller = scrollerRef.current
    if (!scroller) return null
    const center = scroller.scrollLeft + scroller.clientWidth / 2
    let best: string | null = null
    let bestDist = Infinity
    scroller.querySelectorAll<HTMLElement>('[data-arch]').forEach((el) => {
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center)
      if (dist < bestDist) {
        bestDist = dist
        best = el.dataset.arch ?? null
      }
    })
    return best
  }

  const handleScroll = () => {
    if (rafId.current !== null) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      if (Date.now() < programmaticUntil.current) return
      const id = closestId()
      if (id && id !== lastReported.current) {
        lastReported.current = id
        onChange(id)
      }
    })
  }

  const select = (id: string) => {
    if (id !== lastReported.current) {
      lastReported.current = id
      onChange(id)
    }
    centerCard(id)
  }

  const nudge = (dir: -1 | 1) => {
    const ids = ARCHETYPES.map((a) => a.id)
    const currentIdx = Math.max(0, ids.indexOf(value ?? lastReported.current ?? ids[0]))
    const next = ids[Math.min(ids.length - 1, Math.max(0, currentIdx + dir))]
    if (next && next !== ids[currentIdx]) select(next)
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        aria-label="Archetype selection carousel"
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[calc(50%-120px)] py-2"
      >
        {ARCHETYPES.map((a) => {
          const selected = value === a.id
          return (
            <button
              key={a.id}
              type="button"
              data-arch={a.id}
              onClick={() => select(a.id)}
              aria-pressed={selected}
              className={`clip-system relative w-60 shrink-0 snap-center rounded-lg border p-4 pt-5 text-center transition-all duration-300 ${
                selected
                  ? 'glow-border scale-100 bg-sky-500/10 opacity-100'
                  : 'scale-90 border-line bg-abyss/50 opacity-45 hover:opacity-75'
              }`}
            >
              {suggestedId === a.id && (
                <span className="absolute top-2 right-2 z-[2] rounded-sm border border-gold/50 bg-gold/10 px-1.5 py-0.5 font-display text-[0.48rem] font-bold tracking-[0.22em] text-gold">
                  SUGGESTED
                </span>
              )}
              <CharacterArt archetype={a.id} size={200} className="mx-auto" />
              <span
                className="mt-2 block font-display text-sm font-bold tracking-[0.14em] uppercase"
                style={{ color: a.color }}
              >
                {a.name}
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-ink">{a.build}</span>
              <span className="block text-xs text-mute">{a.focus}</span>
              <span className="mt-1 block text-[0.68rem] font-semibold text-glow-soft">◈ {a.calorieLabel}</span>
            </button>
          )
        })}
      </div>

      {/* Desktop chevrons */}
      <button
        type="button"
        onClick={() => nudge(-1)}
        aria-label="Previous archetype"
        className="absolute top-1/2 left-1 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-abyss/90 text-glow-soft transition hover:border-sky-400/50 hover:text-sky-200 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] sm:inline-flex"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => nudge(1)}
        aria-label="Next archetype"
        className="absolute top-1/2 right-1 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-abyss/90 text-glow-soft transition hover:border-sky-400/50 hover:text-sky-200 hover:shadow-[0_0_14px_rgba(56,189,248,0.25)] sm:inline-flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
