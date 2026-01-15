import React, { useState } from 'react';
import { Factory, AlertCircle, Check } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const ProductionManager = () => {
    const { products, ingredients, produceProduct, addToast } = useInventoryStore();
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

    const handleProduce = () => {
        if (!validate()) return;

        if (!can) {
            addToast('Недостаточно сырья', 'error');
            return;
        }

        const result = produceProduct(selectedProduct, quantity);
        if (result.success) {
            addToast(`Произведено ${quantity} ${product.unit} "${product.name}"`, 'success');
            setQuantity(1);
            setErrors({});
        } else {
            addToast(result.error, 'error');
        }
    };

    return (
        <div className="">
            <p className="text-[var(--text-secondary)] text-sm mb-6">
                Запишите производство и автоматически спишите сырьё со склада.
            </p>

            <div className="card max-w-md">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Factory size={20} className="text-blue-600" />
                    Регистрация производства
                </h3>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Продукт</label>
                        <select
                            className={`input ${errors.selectedProduct ? 'input-error' : ''}`}
                            value={selectedProduct}
                            onChange={e => {
                                setSelectedProduct(e.target.value);
                                if (errors.selectedProduct) setErrors({ ...errors, selectedProduct: null });
                            }}
                        >
                            <option value="">Выберите продукт...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {errors.selectedProduct && <p className="error-message">{errors.selectedProduct}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Количество</label>
                        <input
                            type="number"
                            className={`input font-mono ${errors.quantity ? 'input-error' : ''}`}
                            value={quantity}
                            onChange={e => {
                                setQuantity(Math.max(1, Number(e.target.value)));
                                if (errors.quantity) setErrors({ ...errors, quantity: null });
                            }}
                            min={1}
                        />
                        {errors.quantity && <p className="error-message">{errors.quantity}</p>}
                    </div>

                    {/* Recipe Preview */}
                    {product && product.recipe?.length > 0 && (
                        <div className="bg-[var(--bg-page)] rounded-lg p-4 mt-4">
                            <p className="text-sm font-medium mb-3">
                                Будет списано:
                            </p>
                            <div className="space-y-2">
                                {product.recipe.map((item, idx) => {
                                    const required = item.amount * quantity;
                                    const available = getIngredientStock(item.ingredientId);
                                    const isEnough = available >= required;

                                    return (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm">{getIngredientName(item.ingredientId)}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-mono text-sm ${isEnough ? 'text-green-600' : 'text-red-600'}`}>
                                                    {required} / {available}
                                                </span>
                                                {isEnough ? (
                                                    <Check size={14} className="text-green-500" />
                                                ) : (
                                                    <AlertCircle size={14} className="text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {!can && missing.length > 0 && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            <span>Не хватает сырья для производства</span>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={handleProduce}
                            disabled={!selectedProduct || !can || quantity <= 0}
                            className="btn btn-primary w-full justify-center"
                        >
                            <Factory size={18} />
                            Зафиксировать производство
                        </button>
                    </div>
                </div>
            </div>

            {products.length === 0 && (
                <div className="card mt-6 text-center py-12 text-[var(--text-light)]">
                    <Factory size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Сначала создайте продукты с рецептами</p>
                </div>
            )}
        </div>
    );
};

export default ProductionManager;
