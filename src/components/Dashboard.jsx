import React from 'react';
import { Package, Beef, Plus, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventoryStore } from '../store/inventoryStore';



const OnboardingCard = ({ step, title, description, linkTo, linkText, icon: Icon }) => (
    <div className="card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">{step}</span>
            </div>
            <div className="flex-1">
                <h4 className="font-bold m-0 flex items-center gap-2">
                    <Icon size={18} className="text-blue-600" />
                    {title}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3">{description}</p>
                <Link to={linkTo} className="btn btn-primary text-sm inline-flex items-center justify-center gap-2 w-36 tracking-wide">
                    {linkText} <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    </div>
);

const LowStockItem = ({ name, quantity, unit, minStock, linkTo }) => {
    const isOut = quantity === 0;
    const isLow = minStock && quantity <= minStock;

    return (
        <Link to={linkTo} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOut ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-green-500'}`} />
            <span className="flex-1 text-sm truncate">{name}</span>
            <span className={`font-mono text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : ''}`}>
                {quantity} {unit}
            </span>
        </Link>
    );
};

const Dashboard = () => {
    const { ingredients, products, history } = useInventoryStore();

    const totalIngredients = ingredients.length;
    const totalProducts = products.length;

    // Check progress for onboarding
    const hasIngredients = ingredients.length > 0;
    const hasProducts = products.length > 0;
    const hasProduction = history.some(h => h.type === 'Производство' || h.type === 'Списание');

    // Show onboarding until ALL steps are at least partially touched
    const showOnboarding = !hasIngredients || !hasProducts || !hasProduction;

    // Top 5 LOW stock ingredients (sorted by quantity ascending)
    const lowIngredients = [...ingredients]
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5);

    // Top 5 LOW stock products (sorted by quantity ascending)
    const lowProducts = [...products]
        .filter(p => p.quantity !== undefined)
        .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
        .slice(0, 5);

    return (
        <div className="space-y-6">


            {/* Onboarding for empty warehouse */}
            {showOnboarding && (
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-blue-600" size={24} />
                        <h3 className="font-bold m-0">Добро пожаловать в SKLAD!</h3>
                    </div>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Начните с настройки склада для вашего производства.
                        Выполните эти 3 шага:
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                        <OnboardingCard
                            step={1}
                            icon={Beef}
                            title="Добавьте материалы"
                            description="Сырьё, материалы, комплектующие..."
                            linkTo="/ingredients"
                            linkText="Добавить"
                        />
                        <OnboardingCard
                            step={2}
                            icon={Package}
                            title="Создайте продукты"
                            description="Готовые изделия с рецептами"
                            linkTo="/products"
                            linkText="Создать"
                        />
                        <OnboardingCard
                            step={3}
                            icon={Plus}
                            title="Регистрируйте"
                            description="Производство и списание материалов"
                            linkTo="/production"
                            linkText="Начать"
                        />
                    </div>
                </div>
            )}

            {/* Low Stock Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Ingredients */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold m-0 flex items-center gap-2">
                            <TrendingDown size={18} className="text-orange-500" />
                            Мало на складе (Сырьё)
                        </h3>
                        <Link to="/ingredients" className="text-xs text-blue-600 hover:underline">
                            Все →
                        </Link>
                    </div>
                    {lowIngredients.length > 0 ? (
                        <div className="space-y-1">
                            {lowIngredients.map(ing => (
                                <LowStockItem
                                    key={ing.id}
                                    name={ing.name}
                                    quantity={ing.quantity}
                                    unit={ing.unit}
                                    minStock={ing.minStock}
                                    linkTo="/ingredients"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-light)] text-center py-6 text-sm">
                            Нет материалов на складе
                        </p>
                    )}
                </div>

                {/* Low Stock Products */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold m-0 flex items-center gap-2">
                            <TrendingDown size={18} className="text-orange-500" />
                            Мало на складе (Продукция)
                        </h3>
                        <Link to="/products" className="text-xs text-blue-600 hover:underline">
                            Все →
                        </Link>
                    </div>
                    {lowProducts.length > 0 ? (
                        <div className="space-y-1">
                            {lowProducts.map(prod => (
                                <LowStockItem
                                    key={prod.id}
                                    name={prod.name}
                                    quantity={prod.quantity || 0}
                                    unit={prod.unit}
                                    linkTo="/products"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--text-light)] text-center py-6 text-sm">
                            {products.length === 0 ? 'Нет продуктов' : 'У продуктов не указан остаток'}
                        </p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h3 className="font-bold mb-4 m-0">Последние действия</h3>
                {history.length > 0 ? (
                    <div className="space-y-3">
                        {history.slice(0, 5).map(h => (
                            <div key={h.id} className="flex items-start gap-3 pb-3 border-b border-[var(--border)] last:border-0">
                                <div className={`w-2 h-2 mt-2 rounded-full ${h.type === 'Производство' ? 'bg-green-500' :
                                    h.type === 'Удаление' || h.type === 'Списание' ? 'bg-red-500' : 'bg-blue-500'
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
                    <div className="text-center py-8">
                        <p className="text-[var(--text-light)] text-sm">
                            Здесь будет отображаться история операций
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
