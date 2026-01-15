import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scale, Beef, Package, Factory, Clock, Menu, X, LogOut, ChevronLeft } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 font-medium ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
        <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] font-sans">
            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--border)] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center gap-3 h-16 px-6 border-b border-[var(--border)]">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
                        S
                    </div>
                    <div>
                        <h1 className="text-lg font-bold m-0 leading-none">SKLAD</h1>
                        <span className="text-xs text-blue-600 font-medium">System</span>
                    </div>
                </div>

                <nav className="p-4 mt-2 space-y-1">
                    <NavItem to="/" icon={LayoutDashboard} label="Главная" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/units" icon={Scale} label="Единицы изм." onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/ingredients" icon={Beef} label="Склад сырья" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/products" icon={Package} label="Продукты" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Рабочая зона</p>
                    </div>
                    <NavItem to="/production" icon={Factory} label="Производство" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/history" icon={Clock} label="История" onClick={() => setIsMobileMenuOpen(false)} />
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] bg-gray-50">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">A</div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                            <p className="text-xs text-gray-500 truncate">admin@sklad.local</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)] bg-white lg:hidden">
                    <span className="font-bold text-gray-900">{getPageTitle()}</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 p-2">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex items-center justify-between h-20 px-8 bg-white border-b border-[var(--border)]">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 m-0">
                            {getPageTitle()}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Управление складскими запасами и производством</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{new Date().toLocaleDateString('ru-RU')}</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
