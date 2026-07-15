'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh-CN', name: 'Mandarin', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

interface TranslationContextType {
  currentLang: string;
  changeLanguage: (langCode: string) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLang: 'en',
  changeLanguage: () => {},
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read saved language preference or default to English
    const savedLang = localStorage.getItem('pact_lang') || 'en';
    setCurrentLang(savedLang);

    // Setup the callback function for Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { 
          pageLanguage: 'en', 
          includedLanguages: LANGUAGES.map(l => l.code).join(','),
          autoDisplay: false
        },
        'google_translate_element'
      );
      setIsLoaded(true);
    };

    // Only inject if not already injected
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  // When Google Translate is loaded, ensure it respects our saved language on mount
  useEffect(() => {
    if (isLoaded && currentLang !== 'en') {
      setTimeout(() => applyLanguageChange(currentLang), 1000);
    }
  }, [isLoaded, currentLang]);

  const applyLanguageChange = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // Fallback: reload with cookie
      document.cookie = `googtrans=/en/${langCode}; path=/; max-age=31536000`;
      document.cookie = `googtrans=/en/${langCode}; domain=.${location.host}; path=/; max-age=31536000`;
      window.location.reload();
    }
  };

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('pact_lang', langCode);
    applyLanguageChange(langCode);
  };

  return (
    <TranslationContext.Provider value={{ currentLang, changeLanguage }}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);
