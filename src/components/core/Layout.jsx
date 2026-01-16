import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scale, Beef, Package, Factory, Clock, Menu, X, Trash2, Sun, Moon, AlertTriangle, Loader2 } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import Toast from '../ui/Toast';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-base font-bold ${isActive
                ? 'nav-active-light dark:nav-active-dark shadow-md'
                : 'nav-text-base hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
        }
    >
        <Icon size={20} />
        <span>{label}</span>
    </NavLink>
);

const StatsWidget = () => {
    const { ingredients, products } = useInventoryStore();

    const totalIngredients = ingredients.length;
    const totalProducts = products.length;
    const lowStock = ingredients.filter(i => i.minStock && i.quantity <= i.minStock).length;

    const stats = [
        { label: 'Материалы', value: totalIngredients, icon: Beef, color: 'text-blue-500' },
        { label: 'Продукция', value: totalProducts, icon: Package, color: 'text-green-500' },
        { label: 'Мало', value: lowStock, icon: AlertTriangle, color: 'text-orange-500' }
    ];

    return (
        <div className="mx-4 mt-auto mb-6 px-2 space-y-6">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <stat.icon size={28} className={`${stat.color} transition-transform group-hover:scale-110`} />
                        <span className="text-base font-semibold text-gray-600 dark:text-gray-300">{stat.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
            ))}
        </div>
    );
};

const ThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useInventoryStore();

    return (
        <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold hover:opacity-75 ${darkMode ? 'text-white' : 'text-gray-900'
                }`}
        >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Светлая тема' : 'Темная тема'}</span>
        </button>
    );
};

const Logo = () => (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-black dark:text-white">SKLAD</span>
    </div>
);

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();
    const { darkMode, user, signOut, profile } = useInventoryStore();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Close menu when location changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return profile?.production_name || 'Главная панель';
            case '/units': return 'Единицы измерения';
            case '/ingredients': return 'Склад сырья';
            case '/products': return 'Продукты и Рецепты';
            case '/production': return 'Производство';
            case '/writeoff': return 'Списание';
            case '/history': return 'История операций';
            default: return 'Склад';
        }
    };

    return (
        <div className={`flex min-h-screen ${darkMode ? 'dark bg-black text-white' : 'bg-white text-black'}`}>
            {/* Skip Link for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
            >
                Перейти к содержимому
            </a>

            {/* Sidebar - Fixed */}
            <aside
                ref={sidebarRef}
                aria-label="Боковая навигация"
                className={`fixed inset-y-0 left-0 z-50 w-64 sidebar-solid border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <Logo />
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto flex flex-col" aria-label="Главное меню">
                    <div className="space-y-2">
                        <NavItem to="/" icon={LayoutDashboard} label="Главная" onClick={() => setIsMobileMenuOpen(false)} />
                        <NavItem to="/ingredients" icon={Beef} label="Склад сырья" onClick={() => setIsMobileMenuOpen(false)} />
                        <NavItem to="/products" icon={Package} label="Продукты" onClick={() => setIsMobileMenuOpen(false)} />
                        <NavItem to="/production" icon={Factory} label="Производство" onClick={() => setIsMobileMenuOpen(false)} />

                        <div className="py-2" />

                        <NavItem to="/writeoff" icon={Trash2} label="Списание" onClick={() => setIsMobileMenuOpen(false)} />
                        <NavItem to="/history" icon={Clock} label="История" onClick={() => setIsMobileMenuOpen(false)} />
                        <NavItem to="/units" icon={Scale} label="Единицы изм." onClick={() => setIsMobileMenuOpen(false)} />
                    </div>

                    <div className="flex-1" />

                    <StatsWidget />
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0 flex flex-col gap-3">
                    {/* User Info */}
                    {user && (
                        <div className="text-xs text-[var(--text-secondary)] text-center truncate px-2">
                            {user.email}
                        </div>
                    )}

                    <button
                        onClick={async () => {
                            if (isSigningOut) return;
                            setIsSigningOut(true);
                            try {
                                await signOut();
                            } catch (error) {
                                // Error is already handled in signOut with toast
                                console.error('Logout failed:', error);
                            } finally {
                                setIsSigningOut(false);
                            }
                        }}
                        disabled={isSigningOut}
                        aria-busy={isSigningOut}
                        aria-label="Выйти из аккаунта"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSigningOut ? (
                            <>
                                <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                                Выход...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Выйти
                            </>
                        )}
                    </button>

                    <ThemeToggle />
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium text-center mt-1">
                        2026 © SKLAD
                    </div>
                </div>
            </aside>

            {/* Overlay for Mobile - high z-index to catch everything except sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main Content - Pushed by sidebar using custom CSS class for reliability */}
            <div className="layout-main">
                <header className="sticky top-0 z-30 flex items-center h-16 px-6 md:px-8 border-b border-gray-200 dark:border-gray-800 header-solid shadow-sm">
                    <div className="w-full flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="sidebar"
                            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg desktop-hidden md:hidden text-black dark:text-white menu-toggle-btn"
                        >
                            {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                        </button>

                        <div className="flex-1">
                            <h1 className="text-xl font-extrabold m-0 tracking-tight text-black dark:text-white">{getPageTitle()}</h1>
                        </div>
                    </div>
                </header>

                <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-black">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            <Toast />
        </div>
    );
};

export default Layout;
