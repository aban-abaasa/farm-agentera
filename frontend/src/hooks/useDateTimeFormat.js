import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

/**
 * Custom hook for date and time formatting
 * @returns {Object} Date and time formatting functions
 */
const useDateTimeFormat = () => {
  const { i18n } = useTranslation();
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState(localStorage.getItem('timeFormat') || '12h');

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setDateFormat(localStorage.getItem('dateFormat') || 'MM/DD/YYYY');
      setTimeFormat(localStorage.getItem('timeFormat') || '12h');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Format a date according to user preferences
   * @param {Date|string|number} date - Date to format
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    const dateToFormat = date instanceof Date ? date : new Date(date);
    
    const locale = getLocaleFromLanguage(i18n.language);
    
    return dateToFormat.toLocaleDateString(locale, {
      year: 'numeric',
      month: dateFormat.includes('MM') ? '2-digit' : 'long',
      day: '2-digit'
    });
  };

  /**
   * Format a time according to user preferences
   * @param {Date|string|number} date - Date to format
   * @returns {string} Formatted time string
   */
  const formatTime = (date) => {
    const dateToFormat = date instanceof Date ? date : new Date(date);
    
    const locale = getLocaleFromLanguage(i18n.language);
    
    return dateToFormat.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h'
    });
  };

  /**
   * Format a date and time according to user preferences
   * @param {Date|string|number} date - Date to format
   * @returns {string} Formatted date and time string
   */
  const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  /**
   * Get locale string from language code
   * @param {string} language - Language code
   * @returns {string} Locale string
   */
  const getLocaleFromLanguage = (language) => {
    switch (language) {
      case 'en': return 'en-US';
      case 'fr': return 'fr-FR';
      case 'sw': return 'sw-KE';
      case 'lg': return 'en-UG';
      default: return 'en-US';
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    dateFormat,
    timeFormat
  };
};

export default useDateTimeFormat; 