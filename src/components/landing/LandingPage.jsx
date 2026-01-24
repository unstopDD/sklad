import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang, LangProvider } from './LangContext';
import { languages } from './translations';
import {
    ChevronDown,
    Check,
    ArrowRight,
    Package,
    FileText,
    Factory,
    History,
    Sparkles,
    Moon,
    Sun
} from 'lucide-react';

// Language Selector Component
const LanguageSelector = () => {
    const { lang, switchLanguage } = useLang();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === lang);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="hidden sm:inline text-sm">{currentLang?.name}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50 min-w-[160px]">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => {
                                    switchLanguage(language.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left ${lang === language.code ? 'bg-slate-700/50' : ''
                                    }`}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <span className="text-white">{language.name}</span>
                                {lang === language.code && <Check size={16} className="ml-auto text-cyan-400" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Navigation Component
const Navigation = () => {
    const { t } = useLang();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center">
                            <Package className="text-white" size={20} />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-white">SKLAD</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-white transition-colors">{t.nav.features}</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-slate-300 hover:text-white transition-colors">{t.nav.howItWorks}</button>
                        <button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-white transition-colors">{t.nav.pricing}</button>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <LanguageSelector />
                        <Link
                            to="/app"
                            className="hidden sm:inline-flex px-4 py-2 text-slate-300 hover:text-white transition-colors"
                        >
                            {t.nav.login}
                        </Link>
                        <Link
                            to="/app"
                            className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
                        >
                            {t.nav.tryFree}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Hero Section
const Hero = () => {
    const { t } = useLang();

    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            {t.hero.title.split(' ').map((word, i) => (
                                <span key={i}>
                                    {i === 0 ? (
                                        <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{word} </span>
                                    ) : (
                                        word + ' '
                                    )}
                                </span>
                            ))}
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
                            {t.hero.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                to="/app"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-semibold text-lg transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                            >
                                {t.hero.cta}
                                <ArrowRight size={20} />
                            </Link>
                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold text-lg transition-all"
                            >
                                {t.hero.howItWorks}
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Mockup */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-700/50 bg-slate-800 p-6">
                            {/* Dashboard Mockup */}
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg"></div>
                                        <span className="text-white font-bold">SKLAD</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-indigo-400">24</div>
                                        <div className="text-xs text-slate-400">📦</div>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-green-400">12</div>
                                        <div className="text-xs text-slate-400">📋</div>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-orange-400">3</div>
                                        <div className="text-xs text-slate-400">⚠️</div>
                                    </div>
                                </div>

                                {/* List Items */}
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-600 rounded-lg"></div>
                                                <div>
                                                    <div className="h-3 w-24 bg-slate-600 rounded"></div>
                                                    <div className="h-2 w-16 bg-slate-700 rounded mt-1"></div>
                                                </div>
                                            </div>
                                            <div className="text-cyan-400 font-mono text-sm">+{i * 5} kg</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -bottom-6 -left-6 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/25 text-white font-medium hidden sm:flex items-center gap-2">
                            <Check size={20} />
                            <span>{t.hero.autoDeduction}</span>
                        </div>
                        <div className="absolute -top-4 -right-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25 text-white font-medium hidden sm:flex items-center gap-2">
                            <History size={20} />
                            <span>{t.hero.fullHistory}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Problems Section
const Problems = () => {
    const { t } = useLang();

    return (
        <section className="py-20 sm:py-32 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">
                    {t.problems.title}
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {t.problems.items.map((item, index) => (
                        <div
                            key={index}
                            className="relative p-8 bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-red-500/30 transition-colors group"
                        >
                            <div className="text-5xl mb-6">{item.icon}</div>
                            <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400">{item.description}</p>

                            {/* Decorative line */}
                            <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Features Section
const Features = () => {
    const { t } = useLang();

    const icons = [
        <Package className="text-indigo-400" size={32} />,
        <FileText className="text-cyan-400" size={32} />,
        <Factory className="text-green-400" size={32} />,
        <History className="text-purple-400" size={32} />,
    ];

    return (
        <section id="features" className="py-20 sm:py-32 bg-gradient-to-b from-slate-900 to-indigo-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {t.features.title}
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {t.features.items.map((item, index) => (
                        <div
                            key={index}
                            className="group p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800 transition-all hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {icons[index]}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// How It Works Section - Slideshow with Real Screenshots
const HowItWorks = () => {
    const { t, lang } = useLang();
    const [activeStep, setActiveStep] = useState(0);

    // Screenshot map based on language and step type
    const getScreenshotPath = (stepIndex) => {
        // Step mapping: 0=Units, 1=Ingredients, 2=Products, 3=Production, 4=History, 5=Dashboard
        const screens = [
            'units', 'materials', 'products', 'production', 'history', 'dashboard'
        ];
        const screenshotIds = {
            units: {
                ru: '1769096249982',
                uk: '1769096609756',
                en: '1769097106401'
            },
            materials: {
                ru: '1769096292854',
                uk: '1769096651492',
                en: '1769097149111'
            },
            products: {
                ru: '1769096332573',
                uk: '1769097011788',
                en: '1769097197195'
            },
            production: {
                ru: '1769096396280',
                uk: '1769096781115',
                en: '1769097271788'
            },
            history: {
                ru: '1769096422633',
                uk: '1769096943634',
                en: '1769097311248'
            },
            dashboard: {
                ru: '1769096450209',
                uk: '1769096985163',
                en: '1769097357710'
            }
        };

        const screenType = screens[stepIndex];
        const id = screenshotIds[screenType]?.[lang] || screenshotIds[screenType]?.ru;
        // Using relative path from public directory. Since base is /sklad/, the path should be /sklad/screenshots/...
        return `/sklad/screenshots/${screenType}_${lang}_${id}.png`;
    };

    return (
        <section id="how-it-works" className="py-20 sm:py-32 bg-indigo-950 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {t.howItWorks.title}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {lang === 'ru' ? 'Весь путь от настройки до готовой продукции за 6 простых шагов' :
                            lang === 'uk' ? 'Весь шлях від налаштування до готової продукції за 6 простих кроків' :
                                'The entire path from setup to finished products in 6 simple steps'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Left - Steps List */}
                    <div className="lg:col-span-4 space-y-4">
                        {t.howItWorks.steps.map((step, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveStep(index)}
                                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${activeStep === index
                                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 transition-colors ${activeStep === index ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold mb-1 transition-colors ${activeStep === index ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                            }`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 line-clamp-2">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right - Interactive Screenshot */}
                    <div className="lg:col-span-8">
                        <div className="relative group">
                            {/* Decorative frames */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

                            <div className="relative bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                                {/* Browser Chrome */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                                    <div className="flex gap-1.5 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <div className="flex-1 max-w-md mx-auto">
                                        <div className="h-4 bg-slate-700 rounded-full w-full opacity-50"></div>
                                    </div>
                                </div>

                                {/* Real Image */}
                                <div className="aspect-[16/10] relative overflow-hidden bg-slate-800">
                                    <img
                                        key={activeStep}
                                        src={getScreenshotPath(activeStep)}
                                        alt={t.howItWorks.steps[activeStep].title}
                                        className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                                    />

                                    {/* Tooltip hint */}
                                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white/50 uppercase tracking-widest border border-white/10">
                                        Real Application Screenshot
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Hints */}
                            <div className="flex justify-center mt-8 gap-2">
                                {t.howItWorks.steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 transition-all duration-300 rounded-full ${activeStep === i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Use Cases Section
const UseCases = () => {
    const { t } = useLang();

    return (
        <section className="py-20 sm:py-32 bg-gradient-to-b from-indigo-950 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">
                    {t.useCases.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {t.useCases.items.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-center hover:border-indigo-500/30 hover:bg-slate-800 transition-all group"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <p className="text-slate-300 text-sm">{item.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Pricing Section
const Pricing = () => {
    const { t } = useLang();

    const plans = [
        { key: 'free', data: t.pricing.free },
        { key: 'starter', data: t.pricing.starter },
        { key: 'pro', data: t.pricing.pro },
        { key: 'business', data: t.pricing.business },
    ];

    return (
        <section id="pricing" className="py-20 sm:py-32 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">
                    {t.pricing.title}
                </h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map(({ key, data }) => (
                        <div
                            key={key}
                            className={`relative p-6 rounded-3xl transition-all ${data.popular
                                ? 'bg-gradient-to-b from-indigo-900/50 to-slate-800 border-2 border-indigo-500 scale-105 shadow-xl shadow-indigo-500/20 z-10'
                                : 'bg-gradient-to-b from-slate-800 to-slate-800/50 border border-slate-700/50 hover:border-slate-600'
                                }`}
                        >
                            {/* Popular badge */}
                            {data.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium rounded-full">
                                    ⭐ Popular
                                </div>
                            )}

                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{data.name}</h3>
                            {data.description && (
                                <p className="text-slate-400 text-sm mb-4">{data.description}</p>
                            )}

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl sm:text-5xl font-bold text-white">
                                    {data.currency}{data.price}
                                </span>
                                <span className="text-slate-400">{data.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {data.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3 text-slate-300">
                                        <Check className="text-green-400 flex-shrink-0" size={18} />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {data.comingSoon ? (
                                <button
                                    disabled
                                    className="block w-full py-3 sm:py-4 rounded-xl font-semibold text-center bg-slate-700/50 text-slate-400 cursor-not-allowed"
                                >
                                    {data.cta}
                                </button>
                            ) : (
                                <Link
                                    to="/app"
                                    className={`block w-full py-3 sm:py-4 rounded-xl font-semibold text-center transition-all ${data.popular
                                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                        }`}
                                >
                                    {data.cta}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Final CTA Section
const FinalCTA = () => {
    const { t } = useLang();

    return (
        <section className="py-20 sm:py-32 bg-gradient-to-b from-slate-900 to-indigo-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    {t.finalCta.title}
                </h2>
                <p className="text-xl text-slate-400 mb-10">
                    {t.finalCta.subtitle}
                </p>

                <Link
                    to="/app"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-2xl font-semibold text-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
                >
                    {t.finalCta.cta}
                    <ArrowRight size={24} />
                </Link>
            </div>
        </section>
    );
};

// Footer
const Footer = () => {
    const { t } = useLang();

    return (
        <footer className="py-8 bg-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                            <Package className="text-white" size={16} />
                        </div>
                        <span className="text-lg font-bold text-white">SKLAD</span>
                    </div>

                    <p className="text-slate-500 text-sm">{t.footer.madeWith}</p>

                    <p className="text-slate-500 text-sm">{t.footer.copyright}</p>
                </div>
            </div>
        </footer>
    );
};

// Main Landing Page Component
const LandingPageContent = () => {
    return (
        <div className="min-h-screen bg-slate-900">
            <Navigation />
            <Hero />
            <Problems />
            <Features />
            <HowItWorks />
            <UseCases />
            <Pricing />
            <FinalCTA />
            <Footer />
        </div>
    );
};

const LandingPage = () => {
    return (
        <LangProvider>
            <LandingPageContent />
        </LangProvider>
    );
};

export default LandingPage;
