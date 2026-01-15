import React from 'react';
import { Package, Beef, AlertTriangle, TrendingUp } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => (
    <div className="card flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
            <Icon size={24} className={`text-${color}-600`} />
        </div>
        <div>
            <p className="text-[var(--text-secondary)] text-sm">{label}</p>
            <p className="text-2xl font-bold font-mono">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { ingredients, products, history } = useInventoryStore();

    const lowStockCount = ingredients.filter(i => i.minStock && i.quantity <= i.minStock).length;
    const totalIngredients = ingredients.length;
    const totalProducts = products.length;

    // Top 7 ingredients for chart
    const topIngredients = [...ingredients]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 7);
    const maxQty = Math.max(...topIngredients.map(i => i.quantity), 1);

    return (
        <div className="max-w-4xl space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={Beef}
                    label="Всего сырья"
                    value={totalIngredients}
                    color="blue"
                />
                <StatCard
                    icon={Package}
                    label="Видов продукции"
                    value={totalProducts}
                    color="green"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Заканчивается"
                    value={lowStockCount}
                    color="orange"
                />
            </div>

            {/* Chart & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Simple Bar Chart */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold m-0">Остатки (Топ 7)</h3>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Кол-во
                        </div>
                    </div>
                    {topIngredients.length > 0 ? (
                        <div className="space-y-3">
                            {topIngredients.map(ing => (
                                <div key={ing.id} className="flex items-center gap-3">
                                    <span className="w-24 text-sm truncate text-[var(--text-secondary)]">{ing.name}</span>
                                    <div className="flex-1 h-6 bg-[var(--bg-page)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${(ing.quantity / maxQty) * 100}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-right font-mono text-sm font-medium">{ing.quantity}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-light)] text-center py-8">Нет данных для графика</p>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 className="font-bold mb-4 m-0">Последние действия</h3>
                    {history.length > 0 ? (
                        <div className="space-y-3">
                            {history.slice(0, 5).map(h => (
                                <div key={h.id} className="flex items-start gap-3 pb-3 border-b border-[var(--border)] last:border-0">
                                    <div className={`w-2 h-2 mt-2 rounded-full ${h.type === 'Производство' ? 'bg-green-500' :
                                            h.type === 'Удаление' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{h.description}</p>
                                        <p className="text-xs text-[var(--text-light)]">
                                            {new Date(h.date).toLocaleString('ru-RU')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-light)] text-center py-8">История пуста</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
