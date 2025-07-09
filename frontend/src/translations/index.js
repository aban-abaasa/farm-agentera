// Translations for the app
// This is a simple implementation - in a production app, you might use i18next or similar

import en from './en';
import sw from './sw';
import lg from './lg';
import fr from './fr';

export const translations = {
  en,
  sw,
  lg,
  fr
};

// Get translation by key and language
export const getTranslation = (key, language = 'en') => {
  // Split the key by dots to navigate nested objects (e.g., 'settings.appearance.title')
  const keys = key.split('.');
  
  // Get the translations for the specified language or fall back to English
  const langTranslations = translations[language] || translations.en;
  
  // Navigate through the nested objects to find the translation
  let result = langTranslations;
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      // If translation not found in the specified language, try English
      if (language !== 'en') {
        let enResult = translations.en;
        for (const k2 of keys) {
          if (enResult && enResult[k2] !== undefined) {
            enResult = enResult[k2];
          } else {
            return key; // Last fallback is the key itself
          }
        }
        return enResult;
      }
      return key; // Last fallback is the key itself
    }
  }
  
  return result;
}; 