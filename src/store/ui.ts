import { create } from 'zustand'

type Taxonomy = {
  domain?: 'L' | 'F' | 'O' | 'P' | 'A' | 'N'
  country?: string // 2 digits string like 01,02
  city?: string // 3 letters
  detail?: string // 3 letters
  weather?: 'CL' | 'OV' | 'RA' | 'SN' | 'FG' | 'HZ' | 'ST'
  time?: 'MR' | 'DT' | 'EV' | 'NT' | 'GD' | 'BL'
  theme?: string | undefined // optional 2 letters
}

type UIState = {
  taxonomy: Taxonomy
  setTaxonomy: (t: Partial<Taxonomy>) => void
}

export const useUIStore = create<UIState>((set) => ({
  taxonomy: {},
  setTaxonomy: (t) => set((s) => ({ taxonomy: { ...s.taxonomy, ...t } })),
}))

