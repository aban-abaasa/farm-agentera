import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations';

/**
 * Custom hook for accessing translations
 * @returns {Function} t - Translation function
 */
const useTranslation = () => {
  const { language } = useLanguage();
  
  /**
   * Get translation by key
   * @param {string} key - Translation key (e.g., 'settings.appearance.title')
   * @param {Object} params - Parameters to replace in the translation
   * @returns {string} Translated text
   */
  const t = (key, params = {}) => {
    let translation = getTranslation(key, language);
    
    // Replace parameters in the translation
    if (params && typeof translation === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return translation;
  };
  
  return t;
};

export default useTranslation; 