import { ruTranslations } from './ru';

export const translations = {
  ru: ruTranslations
};

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof ruTranslations;

// Current locale - you can change this to switch languages
export const currentLocale: Locale = 'ru';

// Translation function
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Format price with locale
export function formatPrice(price: number): string {
  return `${price.toLocaleString()} ₸`;
}

// Format time with locale
export function formatTime(minutes: number): string {
  return `${minutes} ${t('units.minutes')}`;
}

export function formatCountdown(seconds: number): string {
  return `${seconds} ${t('units.seconds')}`;
}
