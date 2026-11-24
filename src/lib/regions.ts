// Country → cuisine-region mapping. Chosen at Awakening (stored on the
// assessment) and used to pick the default meal-plan cuisine; users can browse
// any region's plans in Nutrition regardless.

export type CuisineRegion =
  | 'indian'
  | 'east-asian'
  | 'mediterranean'
  | 'western'
  | 'middle-eastern'
  | 'latin'
  | 'international'

export const REGION_LABELS: Record<CuisineRegion, string> = {
  indian: 'Indian & South Asian',
  'east-asian': 'East & Southeast Asian',
  mediterranean: 'Mediterranean',
  western: 'Western',
  'middle-eastern': 'Middle Eastern',
  latin: 'Latin American',
  international: 'International',
}

export interface CountryDef {
  code: string
  name: string
  region: CuisineRegion
}

export const COUNTRIES: CountryDef[] = [
  { code: 'IN', name: 'India', region: 'indian' },
  { code: 'PK', name: 'Pakistan', region: 'indian' },
  { code: 'BD', name: 'Bangladesh', region: 'indian' },
  { code: 'NP', name: 'Nepal', region: 'indian' },
  { code: 'LK', name: 'Sri Lanka', region: 'indian' },
  { code: 'CN', name: 'China', region: 'east-asian' },
  { code: 'JP', name: 'Japan', region: 'east-asian' },
  { code: 'KR', name: 'South Korea', region: 'east-asian' },
  { code: 'TW', name: 'Taiwan', region: 'east-asian' },
  { code: 'VN', name: 'Vietnam', region: 'east-asian' },
  { code: 'TH', name: 'Thailand', region: 'east-asian' },
  { code: 'PH', name: 'Philippines', region: 'east-asian' },
  { code: 'ID', name: 'Indonesia', region: 'east-asian' },
  { code: 'MY', name: 'Malaysia', region: 'east-asian' },
  { code: 'SG', name: 'Singapore', region: 'east-asian' },
  { code: 'US', name: 'United States', region: 'western' },
  { code: 'CA', name: 'Canada', region: 'western' },
  { code: 'GB', name: 'United Kingdom', region: 'western' },
  { code: 'IE', name: 'Ireland', region: 'western' },
  { code: 'AU', name: 'Australia', region: 'western' },
  { code: 'NZ', name: 'New Zealand', region: 'western' },
  { code: 'DE', name: 'Germany', region: 'western' },
  { code: 'NL', name: 'Netherlands', region: 'western' },
  { code: 'FR', name: 'France', region: 'western' },
  { code: 'SE', name: 'Sweden', region: 'western' },
  { code: 'NO', name: 'Norway', region: 'western' },
  { code: 'DK', name: 'Denmark', region: 'western' },
  { code: 'PL', name: 'Poland', region: 'western' },
  { code: 'RU', name: 'Russia', region: 'western' },
  { code: 'IT', name: 'Italy', region: 'mediterranean' },
  { code: 'ES', name: 'Spain', region: 'mediterranean' },
  { code: 'PT', name: 'Portugal', region: 'mediterranean' },
  { code: 'GR', name: 'Greece', region: 'mediterranean' },
  { code: 'TR', name: 'Türkiye', region: 'mediterranean' },
  { code: 'AE', name: 'United Arab Emirates', region: 'middle-eastern' },
  { code: 'SA', name: 'Saudi Arabia', region: 'middle-eastern' },
  { code: 'QA', name: 'Qatar', region: 'middle-eastern' },
  { code: 'KW', name: 'Kuwait', region: 'middle-eastern' },
  { code: 'EG', name: 'Egypt', region: 'middle-eastern' },
  { code: 'JO', name: 'Jordan', region: 'middle-eastern' },
  { code: 'LB', name: 'Lebanon', region: 'middle-eastern' },
  { code: 'IL', name: 'Israel', region: 'middle-eastern' },
  { code: 'MA', name: 'Morocco', region: 'middle-eastern' },
  { code: 'MX', name: 'Mexico', region: 'latin' },
  { code: 'BR', name: 'Brazil', region: 'latin' },
  { code: 'AR', name: 'Argentina', region: 'latin' },
  { code: 'CO', name: 'Colombia', region: 'latin' },
  { code: 'CL', name: 'Chile', region: 'latin' },
  { code: 'PE', name: 'Peru', region: 'latin' },
  { code: 'NG', name: 'Nigeria', region: 'international' },
  { code: 'KE', name: 'Kenya', region: 'international' },
  { code: 'ZA', name: 'South Africa', region: 'international' },
  { code: 'OTHER', name: 'Other / not listed', region: 'international' },
]

export function regionForCountry(code: string | null | undefined): CuisineRegion {
  if (!code) return 'international'
  return COUNTRIES.find((c) => c.code === code)?.region ?? 'international'
}
