import React, { createContext, useContext, useState, useEffect } from 'react';
import { appTranslations, languages } from './translations';

const LangContext = createContext();

// Detect browser language
const detectLanguage = () => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('uk') || browserLang.startsWith('ua')) return 'uk';
    if (browserLang.startsWith('ru')) return 'ru';
    return 'ru'; // Default to Russian for UA/RU market
};

// Get saved language or detect
const getSavedLanguage = () => {
    const saved = localStorage.getItem('sklad-language');
    if (saved && appTranslations[saved]) return saved;
    return detectLanguage();
};

export const LangProvider = ({ children }) => {
    const [lang, setLang] = useState(getSavedLanguage);

    useEffect(() => {
        localStorage.setItem('sklad-language', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = appTranslations[lang];

    const changeLang = (newLang) => {
        if (appTranslations[newLang]) {
            setLang(newLang);
        }
    };

    return (
        <LangContext.Provider value={{ lang, setLang: changeLang, t, languages }}>
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

// Language Selector Component
export const LanguageSelector = ({ className = '' }) => {
    const { lang, setLang, languages } = useLang();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === lang);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 shadow-sm active:scale-[0.98]"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg leading-none filter drop-shadow-sm">{currentLang?.flag}</span>
                    <span>{currentLang?.name}</span>
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[140px]">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => {
                                    setLang(language.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${lang === language.code ? 'bg-gray-100 dark:bg-gray-700' : ''
                                    }`}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
