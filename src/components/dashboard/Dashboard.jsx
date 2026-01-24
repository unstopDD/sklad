import React from 'react';
import { Package, Beef, Plus, ArrowRight, Sparkles, TrendingDown, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { useLang } from '../../i18n';
import StatsCards from './StatsCards';
import InventoryPieChart from './InventoryPieChart';
import ProductionAreaChart from './ProductionAreaChart';
import { StockFilter } from '../../utils/StockFilter';

const OnboardingCard = ({ step, title, description, linkTo, linkText, icon: Icon }) => (
    <div className="card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">{step}</span>
            </div>
            <div className="flex-1">
                <h3 className="font-bold m-0 flex items-center gap-2">
                    <Icon size={18} className="text-blue-600" aria-hidden="true" />
                    {title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3">{description}</p>
                <Link to={linkTo} className="btn btn-primary text-sm inline-flex items-center justify-center gap-2 w-36 tracking-wide">
                    {linkText} <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    </div>
);

const LowStockItem = ({ name, quantity, unit, minStock, linkTo, t }) => {
    const isOut = quantity === 0;
    const isLow = minStock && quantity <= minStock;

    return (
        <Link to={linkTo} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-page)] transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOut ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-green-500'}`} />
            <span className="flex-1 text-sm truncate">{name}</span>
            <span className={`font-mono text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : ''}`}>
                {quantity} {t.unitNames?.[unit] || unit}
            </span>
        </Link>
    );
};


const Dashboard = () => {
    const { ingredients, products, history } = useInventoryStore();
    const { t } = useLang();

    const totalIngredients = ingredients.length;
    const totalProducts = products.length;

    // Check progress for onboarding
    const hasIngredients = ingredients.length > 0;
    const hasProducts = products.length > 0;
    const hasProduction = history.some(h => h.type === 'Производство' || h.type === 'Списание');

    // Show onboarding until ALL steps are at least partially touched
    const showOnboarding = !hasIngredients || !hasProducts || !hasProduction;

    // Filter and sort LOW stock items using extracted logic
    const activeItemNames = StockFilter.getActiveItemNames(history);
    const lowIngredients = StockFilter.getLowIngredients(ingredients, activeItemNames);
    const lowProducts = StockFilter.getLowProducts(products, activeItemNames);

    return (
        <div className="space-y-6">

            {/* Onboarding for empty warehouse */}
            {showOnboarding && (
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-blue-600" size={24} aria-hidden="true" />
                        <h2 className="font-bold m-0 text-lg">{t.common.welcome || 'Добро пожаловать в SKLAD!'}</h2>
                    </div>
                    <p className="text-[var(--text-secondary)] mb-6">
                        {t.common.welcomeDesc || 'Начните с настройки склада для вашего производства.'}
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                        <OnboardingCard
                            step={1}
                            icon={Beef}
                            title={t.ingredients.title}
                            description={t.ingredients.descShort || "Сырьё, материалы, комплектующие..."}
                            linkTo="/app/ingredients"
                            linkText={t.common.add}
                        />
                        <OnboardingCard
                            step={2}
                            icon={Package}
                            title={t.products.title}
                            description={t.products.descShort || "Готовые изделия с составом"}
                            linkTo="/app/products"
                            linkText={t.common.add}
                        />
                        <OnboardingCard
                            step={3}
                            icon={Plus}
                            title={t.nav.production}
                            description={t.production.descShort || "Производство и списание сырья"}
                            linkTo="/app/production"
                            linkText={t.common.start || "Начать"}
                        />
                    </div>
                </div>
            )}

            {/* Global Stats */}
            <StatsCards ingredients={ingredients} products={products} history={history} t={t} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold mb-4 text-[var(--text-main)]">{t.dashboard.stockDistribution}</h3>
                    <InventoryPieChart ingredients={ingredients} t={t} />
                </div>
                <div className="card">
                    <h3 className="font-bold mb-4 text-[var(--text-main)]">{t.dashboard.productionTrends}</h3>
                    <ProductionAreaChart history={history} t={t} />
                </div>
            </div>

            {/* Low Stock Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Increased gap */}
                {/* Low Stock Ingredients */}
                <div className="card border-l-4 border-l-orange-400"> {/* Color accent */}
                    <div className="flex items-center justify-between mb-6"> {/* More spacing */}
                        <h2 className="font-bold m-0 flex items-center gap-3 text-lg">
                            <TrendingDown size={20} className="text-orange-500" aria-hidden="true" />
                            {t.ingredients.lowStock || 'Мало на складе (Сырьё)'}
                        </h2>
                        <Link to="/app/ingredients" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            {t.common.all || 'Все'} →
                        </Link>
                    </div>
                    {lowIngredients.length > 0 ? (
                        <div className="space-y-3">
                            {lowIngredients.map(ing => (
                                <LowStockItem
                                    key={ing.id}
                                    name={ing.name}
                                    quantity={ing.quantity}
                                    unit={ing.unit}
                                    minStock={ing.minStock}
                                    linkTo="/app/ingredients"
                                    t={t}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle size={32} className="mb-2" />
                            <p className="font-medium">{t.common.allInStock}</p>
                        </div>
                    )}
                    <p className="text-[10px] text-[var(--text-light)] mt-4 italic">
                        * {t.dashboard.activeLast30Days}
                    </p>
                </div>

                {/* Low Stock Products */}
                <div className="card border-l-4 border-l-orange-400">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold m-0 flex items-center gap-3 text-lg">
                            <TrendingDown size={20} className="text-orange-500" aria-hidden="true" />
                            {t.products.lowStock || 'Мало на складе (Продукция)'}
                        </h2>
                        <Link to="/app/products" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            {t.common.all || 'Все'} →
                        </Link>
                    </div>
                    {lowProducts.length > 0 ? (
                        <div className="space-y-3">
                            {lowProducts.map(prod => (
                                <LowStockItem
                                    key={prod.id}
                                    name={prod.name}
                                    quantity={prod.quantity || 0}
                                    unit={prod.unit}
                                    linkTo="/app/products"
                                    t={t}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle size={32} className="mb-2" />
                            <p className="font-medium">
                                {products.length === 0 ? t.products.noFound : t.common.allInStock}
                            </p>
                        </div>
                    )}
                    <p className="text-[10px] text-[var(--text-light)] mt-4 italic">
                        * {t.dashboard.activeLast30Days}
                    </p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h2 className="font-bold mb-6 text-xl">{t.history.title}</h2>
                {history.length > 0 ? (
                    <div className="space-y-4"> {/* Increased spacing */}
                        {history.slice(0, 5).map(h => (
                            <div key={h.id} className="flex items-start gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                                <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${h.type === 'Производство' ? 'bg-green-500 shadow-sm shadow-green-200 dark:shadow-none' :
                                    h.type === 'Удаление' || h.type === 'Списание' ? 'bg-red-500 shadow-sm shadow-red-200 dark:shadow-none' : 'bg-blue-500 shadow-sm shadow-blue-200 dark:shadow-none'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                                        {/* Translate units and keywords in description */}
                                        {Object.entries(t.unitNames || {}).reduce((acc, [ru, translation]) => {
                                            if (ru === translation) return acc;
                                            const regex = new RegExp(`\\b${ru}\\b`, 'g');
                                            return acc.replace(regex, translation);
                                        }, h.description).split('"').map((part, i) =>
                                            i % 2 === 1 ? <span key={i} className="font-bold">{part}</span> : part
                                        )}
                                    </p>
                                    <p className="text-xs font-medium text-gray-400 mt-1">
                                        {new Date(h.date).toLocaleString(
                                            t.code === 'uk' ? 'uk-UA' : t.code === 'en' ? 'en-US' : 'ru-RU',
                                            { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-[var(--text-light)] text-sm">
                            {t.history.empty || 'Здесь будет отображаться история операций'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
