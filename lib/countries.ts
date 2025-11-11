export interface CountryOption {
  value: string
  label: string
  emoji?: string
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { value: 'cis_community', label: 'CIS Community', emoji: '🌐' },
  { value: 'indian_community', label: 'Indian Community', emoji: '🇮🇳' },
  { value: 'japanese_community', label: 'Japanese Community', emoji: '🇯🇵' },
  { value: 'korean_community', label: 'Korean Community', emoji: '🇰🇷' },
  { value: 'china_community', label: 'China Community', emoji: '🇨🇳' },
  { value: 'indonesian_community', label: 'Indonesian Community', emoji: '🇮🇩' },
  { value: 'thai_community', label: 'Thai Community', emoji: '🇹🇭' },
  { value: 'vietnamese_community', label: 'Vietnamese Community', emoji: '🇻🇳' },
  { value: 'nigerian_community', label: 'Nigerian Community', emoji: '🇳🇬' },
  { value: 'turkish_community', label: 'Turkish Community', emoji: '🇹🇷' },
  { value: 'ukrainian_community', label: 'Ukrainian Community', emoji: '🇺🇦' },
  { value: 'filipino_community', label: 'Filipino Community', emoji: '🇵🇭' },
  { value: 'portuguese_community', label: 'Portuguese Community', emoji: '🇵🇹' },
]

export const COUNTRY_LOOKUP: Record<string, CountryOption> = COUNTRY_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option
    return acc
  },
  {} as Record<string, CountryOption>
)

