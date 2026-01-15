import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scale, Beef, Package, Factory, Clock, Menu, X, Moon, Sun } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import Toast from './ui/Toast';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 font-medium ${isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            }`
        }
    >
        <Icon size={20} className="flex-shrink-0" />
        <span className="text-sm">{label}</span>
    </NavLink>
);

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useInventoryStore();

    // Apply dark class to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Главная панель';
            case '/units': return 'Единицы измерения';
            case '/ingredients': return 'Склад сырья';
            case '/products': return 'Продукты и Рецепты';
            case '/production': return 'Производство';
            case '/history': return 'История операций';
            default: return 'Склад';
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border)] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center gap-3 h-16 px-6 border-b border-[var(--border)]">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                        S
                    </div>
                    <div>
                        <h1 className="text-lg font-bold m-0 leading-tight">SKLAD</h1>
                        <span className="text-xs text-blue-600 font-medium">v2.0</span>
                    </div>
                </div>

                <nav className="p-4 mt-2">
                    <p className="px-4 mb-2 text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider">Меню</p>
                    <NavItem to="/" icon={LayoutDashboard} label="Главная" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/units" icon={Scale} label="Единицы изм." onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/ingredients" icon={Beef} label="Склад сырья" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/products" icon={Package} label="Продукты" onClick={() => setIsMobileMenuOpen(false)} />

                    <p className="px-4 mt-6 mb-2 text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider">Рабочая зона</p>
                    <NavItem to="/production" icon={Factory} label="Производство" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/history" icon={Clock} label="История" onClick={() => setIsMobileMenuOpen(false)} />
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)]">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-all"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="text-sm">{darkMode ? 'Светлая тема' : 'Тёмная тема'}</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-4 md:px-8 border-b border-[var(--border)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden text-[var(--text-secondary)] p-2 hover:bg-[var(--bg-page)] rounded-lg"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold m-0">{getPageTitle()}</h1>
                            <p className="text-xs text-[var(--text-secondary)] hidden md:block">
                                Управление складскими запасами
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[var(--text-secondary)] bg-[var(--bg-page)] px-3 py-1.5 rounded-full hidden md:block">
                            {new Date().toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Toast Notifications */}
            <Toast />
        </div>
    );
};

export default Layout;
