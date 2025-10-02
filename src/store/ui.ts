import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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
  banners: Banner[]
  setBanners: (b: Banner[]) => void
  themes: ThemeArchive[]
  addTheme: (t: ThemeArchive) => void
  filters: FilterArchive[]
  addFilter: (f: FilterArchive) => void
}

export type ColorItem = { hex: string; name: string }
export type Banner = {
  id: string
  country: string
  city: string
  imageUrl: string
  colors: ColorItem[]
}

export type ThemeArchive = {
  id: string
  imageObjectUrl: string
  domain: string
  country: string
  city: string
  detail: string
  weather: string
  time: string
  theme?: string
  createdAt: number
}

export type FilterArchive = {
  id: string
  beforeObjectUrl: string
  afterObjectUrl: string
  notes?: string
  createdAt: number
}

const mockBanners: Banner[] = [
  {
    id: 'tokyo-shibuya',
    country: 'Japan',
    city: 'Shibuya',
    imageUrl: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1400&auto=format&fit=crop',
    colors: [
      { hex: '#E6011B', name: 'Shibuya Cherry' },
      { hex: '#DA6C85', name: 'Smoke Berry' },
      { hex: '#E08482', name: 'Musky Crimson' },
      { hex: '#014E78', name: 'Navy Berry' },
      { hex: '#0061B9', name: 'Core Blue' },
      { hex: '#00A0D7', name: 'Smoke Ramunae' },
    ],
  },
  {
    id: 'seoul-myeongdong',
    country: 'Korea',
    city: 'Myeong-dong',
    imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1400&auto=format&fit=crop',
    colors: [
      { hex: '#0ea5e9', name: 'Sky Seoul' },
      { hex: '#22c55e', name: 'Mint Namsan' },
      { hex: '#f59e0b', name: 'Han River Gold' },
      { hex: '#ef4444', name: 'Kimchi Red' },
      { hex: '#334155', name: 'Midnight Slate' },
      { hex: '#a78bfa', name: 'Lavender Lane' },
    ],
  },
  {
    id: 'paris-louvre',
    country: 'France',
    city: 'Paris',
    imageUrl: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1400&auto=format&fit=crop',
    colors: [
      { hex: '#9ca3af', name: 'Stone Louvre' },
      { hex: '#fbbf24', name: 'Sunset Seine' },
      { hex: '#1f2937', name: 'Paris Night' },
      { hex: '#60a5fa', name: 'Blue Orsay' },
      { hex: '#d946ef', name: 'Magenta Montmartre' },
      { hex: '#10b981', name: 'Forest Versailles' },
    ],
  },
  {
    id: 'newyork-brooklyn',
    country: 'USA',
    city: 'Brooklyn',
    imageUrl: 'https://images.unsplash.com/photo-1545420331-8877b5d2b79b?q=80&w=1400&auto=format&fit=crop',
    colors: [
      { hex: '#111827', name: 'Bridge Black' },
      { hex: '#2563eb', name: 'Hudson Blue' },
      { hex: '#f97316', name: 'Taxi Orange' },
      { hex: '#84cc16', name: 'Park Lime' },
      { hex: '#eab308', name: 'Broadway Gold' },
      { hex: '#f43f5e', name: 'Neon Rose' },
    ],
  },
]

export const useUIStore = create<UIState>((set) => ({
  taxonomy: {},
  setTaxonomy: (t) => set((s) => ({ taxonomy: { ...s.taxonomy, ...t } })),
  banners: mockBanners,
  setBanners: (b) => set(() => ({ banners: b })),
  themes: [],
  addTheme: (t) => set((s) => ({ themes: [t, ...s.themes] })),
  filters: [],
  addFilter: (f) => set((s) => ({ filters: [f, ...s.filters] })),
}))

type AuthState = {
  isAdmin: boolean
  adminEmail?: string
  loginAsAdmin: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminEmail: undefined,
      loginAsAdmin: (email) => set({ isAdmin: true, adminEmail: email }),
      logout: () => set({ isAdmin: false, adminEmail: undefined }),
    }),
    {
      name: 'colortelier-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isAdmin: state.isAdmin, adminEmail: state.adminEmail }),
    },
  ),
)

