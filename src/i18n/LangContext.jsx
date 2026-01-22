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
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{currentLang?.name}</span>
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
