import React from 'react';
import { Beef, CheckCircle, Package, AlertTriangle, Filter } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="card flex items-center p-6 shadow-sm border-none">
        <div className={`p-4 rounded-xl ${colorClass} mr-4`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 m-0">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { ingredients, products, history } = useStore();

    const lowStockCount = ingredients.filter(i => i.minStock && i.quantity <= i.minStock).length;

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Всего сырья"
                    value={ingredients.length}
                    icon={Beef}
                    colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard
                    label="Видов продукции"
                    value={products.length}
                    icon={CheckCircle}
                    colorClass="bg-green-50 text-green-600"
                />
                <StatCard
                    label="Заканчивается сырьё"
                    value={lowStockCount}
                    icon={AlertTriangle}
                    colorClass="bg-red-50 text-red-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Area Placeholder */}
                <div className="card lg:col-span-2 shadow-sm border-none p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 m-0">Остатки (Топ 7 мин.)</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200">Мин</button>
                            <button className="px-3 py-1 bg-gray-800 rounded text-xs text-white">Макс</button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-around border-b border-gray-200 pb-2 px-4 gap-4">
                        {/* Pseudo-Chart */}
                        {ingredients.slice(0, 7).sort((a, b) => a.quantity - b.quantity).map((ing, idx) => (
                            <div key={ing.id} className="w-full flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600 relative"
                                    style={{ height: `${Math.min((ing.quantity / 100) * 100, 100)}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {ing.quantity} {ing.unit}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 truncate w-16 text-center">{ing.name}</span>
                            </div>
                        ))}
                        {ingredients.length === 0 && <span className="text-gray-400 w-full text-center py-20">Нет данных для графика</span>}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card shadow-sm border-none p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Последние действия</h3>
                    <div className="space-y-4">
                        {history.slice(0, 5).map(h => (
                            <div key={h.id} className="flex gap-3 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <p className="text-gray-800 font-medium">{h.type}</p>
                                    <p className="text-gray-500 text-xs">{h.description}</p>
                                    <span className="text-xs text-gray-400 block mt-1">
                                        {new Date(h.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-gray-400 text-sm">История пуста.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
