import React, { useState } from 'react';
import { Factory, AlertCircle, Check } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useLang } from '../../i18n';

const ProductionManager = () => {
    const { products, ingredients, produceProduct, addToast } = useInventoryStore();
    const { t } = useLang();
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [errors, setErrors] = useState({});

    const product = products.find(p => p.id === selectedProduct);

    const canProduce = () => {
        if (!product) return { can: false, missing: [] };

        const missing = [];
        product.recipe?.forEach(item => {
            const required = item.amount * quantity;
            const stock = ingredients.find(i => i.id === item.ingredientId);
            if (!stock || stock.quantity < required) {
                missing.push({
                    name: stock?.name || 'Неизвестно',
                    required,
                    available: stock?.quantity || 0
                });
            }
        });

        return { can: missing.length === 0, missing };
    };

    const { can, missing } = canProduce();
    const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || 'Неизвестно';
    const getIngredientStock = (id) => ingredients.find(i => i.id === id)?.quantity || 0;

    const validate = () => {
        const newErrors = {};
        if (!selectedProduct) newErrors.selectedProduct = 'Выберите продукт';
        if (quantity <= 0) newErrors.quantity = 'Количество должно быть больше 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProduce = async () => {
        if (!validate()) return;

        if (!can) {
            addToast(t.production.notEnoughMaterials || 'Недостаточно сырья', 'error');
            return;
        }

        const result = await produceProduct(selectedProduct, quantity);
        if (result.success) {
            addToast(t.production.registerSuccess
                .replace('{quantity}', quantity)
                .replace('{unit}', t.unitNames?.[product.unit] || product.unit)
                .replace('{name}', product.name), 'success');
            setQuantity(1);
            setErrors({});
        } else {
            addToast(result.error, 'error');
        }
    };

    return (
        <div className="">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 mb-2">
                    <Factory className="text-[var(--primary)]" size={24} />
                    {t.nav.production}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm max-w-2xl">
                    {t.production.desc || 'Выберите продукт для производства. Компоненты будут автоматически списаны со склада.'}
                </p>
            </div>

            {products.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] text-center py-16">
                    <Factory size={48} className="mx-auto mb-4 text-[var(--text-light)] opacity-30" />
                    <p className="font-medium text-[var(--text-secondary)]">{t.production.noProducts || 'Нет доступных продуктов'}</p>
                    <p className="text-sm text-[var(--text-light)] mt-1">{t.production.createComposition || 'Создайте хотя бы один продукт с составом'}</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Input Form */}
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="prod-select" className="block text-sm font-semibold text-[var(--text-main)] mb-2">{t.products.name.toUpperCase()}</label>
                                <div className="relative">
                                    <select
                                        id="prod-select"
                                        className={`input appearance-none bg-[var(--bg-page)] ${errors.selectedProduct ? 'input-error' : ''}`}
                                        value={selectedProduct}
                                        onChange={e => {
                                            setSelectedProduct(e.target.value);
                                            if (errors.selectedProduct) setErrors({ ...errors, selectedProduct: null });
                                        }}
                                    >
                                        <option value="">{t.production.selectProductPlaceholder}</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                                {errors.selectedProduct && <p className="error-message mt-2">{errors.selectedProduct}</p>}
                            </div>

                            <div>
                                <label htmlFor="prod-qty" className="block text-sm font-semibold text-[var(--text-main)] mb-2">{t.ingredients.quantity.toUpperCase()}</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            id="prod-qty"
                                            type="number"
                                            className={`input font-mono text-lg ${errors.quantity ? 'input-error' : ''}`}
                                            value={quantity}
                                            onChange={e => {
                                                setQuantity(Math.max(1, Number(e.target.value)));
                                                if (errors.quantity) setErrors({ ...errors, quantity: null });
                                            }}
                                            min={1}
                                        />
                                    </div>
                                    <div className="w-24 h-[46px] flex items-center justify-center bg-[var(--bg-page)] rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium">
                                        {t.unitNames?.[product?.unit] || product?.unit || t.common.unitAbbr}
                                    </div>
                                </div>
                                {errors.quantity && <p className="error-message mt-2">{errors.quantity}</p>}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleProduce}
                                disabled={!selectedProduct || !can || quantity <= 0}
                                className={`
                                    btn w-full justify-center py-4 text-base shadow-lg transition-all
                                    ${!selectedProduct || !can || quantity <= 0
                                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed shadow-none'
                                        : 'btn-primary shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <Factory size={20} />
                                <span>{t.production.registerProduction || 'Зафиксировать производство'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Preview & Status */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        {product ? (
                            <div className={`bg-[var(--bg-card)] border rounded-[var(--radius)] shadow-sm overflow-hidden transition-colors ${can ? 'border-green-200 dark:border-green-900/30' : 'border-red-200 dark:border-red-900/30'}`}>
                                <div className={`px-6 py-4 border-b ${can ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'}`}>
                                    <div className="flex items-center gap-3">
                                        {can ? (
                                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shadow-sm">
                                                <Check size={20} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center shadow-sm">
                                                <AlertCircle size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className={`font-bold ${can ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                                {can ? (t.production.possible || 'Производство возможно') : (t.production.notEnoughMaterials || 'Недостаточно сырья')}
                                            </h3>
                                            <p className="text-xs opacity-80 text-[var(--text-secondary)]">{t.production.stockCheck || 'Проверка остатков'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {product.recipe?.length > 0 ? (
                                        <>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">
                                                {t.production.writeOff || 'Списание со склада'} ({product.recipe.length} поз.)
                                            </h4>
                                            <div className="space-y-3">
                                                {product.recipe.map((item, idx) => {
                                                    const required = item.amount * quantity;
                                                    const available = getIngredientStock(item.ingredientId);
                                                    const isEnough = available >= required;

                                                    return (
                                                        <div key={idx} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isEnough ? 'bg-gray-300' : 'bg-red-500'}`} />
                                                                <span className={`text-sm ${!isEnough ? 'font-medium text-red-600 dark:text-red-400' : 'text-[var(--text-main)]'}`}>
                                                                    {getIngredientName(item.ingredientId)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right">
                                                                    <div className={`font-mono font-medium ${isEnough ? 'text-[var(--text-main)]' : 'text-red-600 dark:text-red-400'}`}>
                                                                        -{required}
                                                                    </div>
                                                                    <div className="text-[10px] text-[var(--text-secondary)]">
                                                                        дост: {available}
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs text-[var(--text-secondary)] w-6">{t.unitNames?.[ingredients.find(i => i.id === item.ingredientId)?.unit] || ingredients.find(i => i.id === item.ingredientId)?.unit}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-6 text-[var(--text-secondary)] bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-[var(--border)]">
                                            {t.production.noComposition || 'У этого продукта нет состава'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-page)] rounded-[var(--radius)] border border-dashed border-[var(--border)] p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                                <Factory size={48} className="text-[var(--text-light)] opacity-20 mb-4" />
                                <p className="text-[var(--text-secondary)] font-medium">{t.production.selectProduct || 'Выберите продукт'}</p>
                                <p className="text-sm text-[var(--text-light)] max-w-xs mx-auto mt-2">
                                    {t.production.previewDesc || 'Справа отобразится расчет необходимых компонентов и статус доступности'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionManager;
