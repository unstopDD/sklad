import React from 'react';
import { Database, Package, Activity, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-[var(--text-main)]">{value}</h3>
                {subtitle && <p className="text-xs text-[var(--text-light)] mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const StatsCards = ({ ingredients, products, history, t }) => {
    const totalIngredients = ingredients.length;
    const totalProducts = products.length;

    // Count operations in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOps = history.filter(h => new Date(h.date) >= thirtyDaysAgo).length;
    const productionCount = history.filter(h =>
        (h.type === 'Производство' || h.type === 'Виробництво') &&
        new Date(h.date) >= thirtyDaysAgo
    ).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title={t.dashboard.materialsTitle}
                value={totalIngredients}
                icon={Database}
                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                subtitle={`${ingredients.filter(i => i.quantity <= (i.minStock || 0)).length} ${t.stats.low}`}
            />
            <StatCard
                title={t.dashboard.productsTitle}
                value={totalProducts}
                icon={Package}
                colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                subtitle={t.products.descShort}
            />
            <StatCard
                title={t.dashboard.production}
                value={productionCount}
                icon={TrendingUp}
                colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                subtitle={t.dashboard.last30days}
            />
            <StatCard
                title={t.history.title}
                value={recentOps}
                icon={Activity}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                subtitle={t.dashboard.last30days}
            />
        </div>
    );
};

export default StatsCards;
