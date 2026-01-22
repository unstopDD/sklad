import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, defaultLanguage, languages } from './translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        // Try to get from localStorage or use browser language
        const saved = localStorage.getItem('sklad-lang');
        if (saved && translations[saved]) return saved;

        // Detect browser language
        const browserLang = navigator.language.slice(0, 2);
        if (browserLang === 'uk' || browserLang === 'ua') return 'uk';
        if (browserLang === 'ru') return 'ru';
        return defaultLanguage;
    });

    useEffect(() => {
        localStorage.setItem('sklad-lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = translations[lang] || translations[defaultLanguage];

    const switchLanguage = (newLang) => {
        if (translations[newLang]) {
            setLang(newLang);
        }
    };

    return (
        <LangContext.Provider value={{ lang, t, switchLanguage, languages }}>
            {children}
        </LangContext.Provider>
    );
};

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) {
        throw new Error('useLang must be used within a LangProvider');
    }
    return context;
};

export default LangContext;
