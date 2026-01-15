import React, { useState } from 'react';
import { Factory, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const ProductionManager = () => {
    const { products, ingredients, produceProduct } = useStore();

    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handleProduce = () => {
        if (!selectedProduct) return;
        setStatus(null);

        const result = produceProduct(selectedProductId, Number(quantity));

        if (result.success) {
            setStatus({ type: 'success', msg: `Производство успешно записано! Списаны материалы.` });
            setQuantity('1');
        } else {
            setStatus({ type: 'error', msg: result.error });
        }
    };

    const getIngName = (id) => ingredients.find(i => i.id === id)?.name;
    const getIngUnit = (id) => ingredients.find(i => i.id === id)?.unit;
    const getStock = (id) => ingredients.find(i => i.id === id)?.quantity || 0;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 m-0">Регистрация производства</h2>
                <p className="text-gray-500 text-sm mt-1">Выберите продукт, укажите количество, и система спишет сырьё.</p>
            </div>

            <div className="card shadow-md border-none overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Что произвели?</label>
                            <select
                                className="input text-lg py-3 font-medium"
                                value={selectedProductId}
                                onChange={e => { setSelectedProductId(e.target.value); setStatus(null); }}
                            >
                                <option value="">Выберите продукт...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Количество ({selectedProduct?.unit || 'шт'})</label>
                            <input
                                type="number"
                                className="input text-lg py-3 font-medium"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                min="0.1"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {selectedProduct && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Калькуляция сырья</h4>
                            <div className="space-y-2">
                                {selectedProduct.recipe.map((r, i) => {
                                    const required = r.amount * Number(quantity);
                                    const available = getStock(r.ingredientId);
                                    const isEnough = available >= required;

                                    return (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                {isEnough ? <CheckCircle size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                                                <span className="text-gray-700">{getIngName(r.ingredientId)}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`font-mono font-medium ${isEnough ? 'text-gray-900' : 'text-red-600'}`}>
                                                    {required.toFixed(2)} {getIngUnit(r.ingredientId)}
                                                </span>
                                                <span className="text-xs text-gray-400 w-32 text-right">
                                                    (на складе: {available})
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {status && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <span>{status.msg}</span>
                        </div>
                    )}

                    <button
                        onClick={handleProduce}
                        disabled={!selectedProductId || !quantity}
                        className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
                    >
                        Записать производство
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionManager;
