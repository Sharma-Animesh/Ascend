import { create } from 'zustand'

export interface Celebration {
  kind: 'levelup' | 'rankup' | 'quest'
  level?: number
  rankLabel?: string
  xpGained?: number
  title?: string
}

interface UiState {
  celebration: Celebration | null
  celebrate: (c: Celebration) => void
  dismissCelebration: () => void
}

export const useUi = create<UiState>((set) => ({
  celebration: null,
  celebrate: (c) => set({ celebration: c }),
  dismissCelebration: () => set({ celebration: null }),
}))
