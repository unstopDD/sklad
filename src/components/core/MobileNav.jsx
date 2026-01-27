import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Beef, Package, Factory, Menu } from 'lucide-react';
import { useLang } from '../../i18n';

const MobileNavItem = ({ to, icon: Icon, label, end = false, onClick }) => (
    <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`
        }
    >
        <Icon size={22} className="opacity-90" />
        <span className="text-[11px] font-black uppercase tracking-tighter">{label}</span>
    </NavLink>
);

const MobileNav = ({ onMenuClick }) => {
    const { t } = useLang();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around md:hidden pb-safe">
            <MobileNavItem to="/app" icon={LayoutDashboard} label={t.nav.home} end />
            <MobileNavItem to="/app/ingredients" icon={Beef} label={t.nav.ingredientsBrief || 'Склад'} />
            <MobileNavItem to="/app/products" icon={Package} label={t.nav.productsBrief || 'Товары'} />
            <MobileNavItem to="/app/production" icon={Factory} label={t.nav.productionBrief || 'Произв.'} />
            <button
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-gray-500 dark:text-gray-400"
            >
                <Menu size={20} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{t.common.more || 'Ще'}</span>
            </button>
        </nav>
    );
};

export default MobileNav;
