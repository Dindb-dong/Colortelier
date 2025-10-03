// Common types shared between frontend and backend

export interface ColorItem {
  hex: string;
  name: string;
}

export interface Banner {
  id: string;
  country: string;
  city: string;
  imageUrl: string;
  colors: ColorItem[];
}

export interface ThemeArchive {
  id: string;
  imageObjectUrl: string;
  domain: string;
  country: string;
  city: string;
  detail: string;
  weather: string;
  time: string;
  theme?: string;
  createdAt: number;
}

export interface LightroomSettings {
  exposure?: number;
  contrast?: number;
  highlights?: number;
  shadows?: number;
  whites?: number;
  blacks?: number;
  temperature?: number;
  tint?: number;
  vibrance?: number;
  saturation?: number;
  clarity?: number;
  dehaze?: number;
  sharpening?: number;
  noiseReduction?: number;
  colorNoiseReduction?: number;
  vignette?: number;
  grain?: number;
  [key: string]: number | undefined;
}

export interface FilterArchive {
  id: string;
  beforeObjectUrl: string;
  afterObjectUrl: string;
  filterFileObjectUrl?: string;
  lightroomSettings?: LightroomSettings;
  createdAt: number;
}

export interface Taxonomy {
  domain?: 'L' | 'F' | 'O' | 'P' | 'A' | 'N';
  country?: string; // 2 digits string like 01,02
  city?: string; // 3 letters
  detail?: string; // 3 letters
  weather?: 'CL' | 'OV' | 'RA' | 'SN' | 'FG' | 'HZ' | 'ST';
  time?: 'MR' | 'DT' | 'EV' | 'NT' | 'GD' | 'BL';
  theme?: string | undefined; // optional 2 letters
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
