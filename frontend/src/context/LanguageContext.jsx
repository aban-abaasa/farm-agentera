import { createContext, useContext, useState, useEffect } from 'react';

// Available languages
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'sw', name: 'Swahili' },
  { code: 'lg', name: 'Luganda' },
  { code: 'fr', name: 'French' },
];

// Create the context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to English
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  // Initialize date and time format preferences
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem('dateFormat') || 'MM/DD/YYYY'
  );
  const [timeFormat, setTimeFormat] = useState(
    localStorage.getItem('timeFormat') || '12h'
  );

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Update localStorage when date format changes
  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  // Update localStorage when time format changes
  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat);
  }, [timeFormat]);

  // Function to change language
  const changeLanguage = (langCode) => {
    if (languages.some(lang => lang.code === langCode)) {
      setLanguage(langCode);
    }
  };

  // Format date according to selected language and format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      language === 'en' ? 'en-US' : 
      language === 'fr' ? 'fr-FR' : 
      language === 'sw' ? 'sw-KE' : 
      language === 'lg' ? 'en-UG' : 'en-US',
      { 
        year: 'numeric', 
        month: dateFormat.includes('MM') ? '2-digit' : 'long', 
        day: '2-digit'
      }
    );
  };

  // Format time according to selected language and format
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(
      language === 'en' ? 'en-US' : 
      language === 'fr' ? 'fr-FR' : 
      language === 'sw' ? 'sw-KE' : 
      language === 'lg' ? 'en-UG' : 'en-US',
      { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: timeFormat === '12h' 
      }
    );
  };

  // Update date format
  const changeDateFormat = (format) => {
    setDateFormat(format);
  };

  // Update time format
  const changeTimeFormat = (format) => {
    setTimeFormat(format);
  };

  // Value to be provided by the context
  const value = {
    language,
    dateFormat,
    timeFormat,
    changeLanguage,
    changeDateFormat,
    changeTimeFormat,
    formatDate,
    formatTime,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 