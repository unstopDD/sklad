import React, { useState } from 'react';
import { Trash2, Package, Beef, AlertCircle, Check } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';

const WriteOffManager = () => {
    const { ingredients, products, addToast, logAction, updateIngredientQuantity, updateProductQuantity } = useInventoryStore();
    const [type, setType] = useState('ingredient'); // 'ingredient' or 'product'
    const [selectedId, setSelectedId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState({});

    const items = type === 'ingredient' ? ingredients : products;
    const selectedItem = items.find(i => i.id === selectedId);

    const validate = () => {
        const newErrors = {};
        if (!selectedId) newErrors.selectedId = 'Выберите элемент';
        if (quantity <= 0) newErrors.quantity = 'Количество должно быть больше 0';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleWriteOff = async () => {
        if (!validate()) return;

        const item = items.find(i => i.id === selectedId);
        if (!item) return;

        if ((item.quantity || 0) < quantity) {
            addToast('Недостаточно для списания', 'error');
            return;
        }

        const newQty = (item.quantity || 0) - quantity;

        if (type === 'ingredient') {
            await updateIngredientQuantity(selectedId, newQty);
        } else {
            await updateProductQuantity(selectedId, newQty);
        }

        await logAction('Списание', `Списано ${quantity} ${item.unit || 'шт'} "${item.name}"${reason ? ` (${reason})` : ''}`);
        addToast(`Списано: ${item.name}`, 'success');

        setQuantity(1);
        setReason('');
        setErrors({});
    };

    return (
        <div className="">
            <p className="text-[var(--text-secondary)] text-sm mb-6">
                Спишите испорченное, просроченное или утерянное сырьё и продукцию.
            </p>

            <div className="card max-w-md">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Trash2 size={20} className="text-red-500" />
                    Списание
                </h3>

                <div className="space-y-4">
                    {/* Type selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setType('ingredient'); setSelectedId(''); setErrors({}); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${type === 'ingredient'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                : 'border-[var(--border)] hover:border-[var(--text-light)]'
                                }`}
                        >
                            <Beef size={18} />
                            Сырьё
                        </button>
                        <button
                            onClick={() => { setType('product'); setSelectedId(''); setErrors({}); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${type === 'product'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                : 'border-[var(--border)] hover:border-[var(--text-light)]'
                                }`}
                        >
                            <Package size={18} />
                            Продукты
                        </button>
                    </div>

                    {/* Item selector */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            {type === 'ingredient' ? 'Сырьё' : 'Продукт'}
                        </label>
                        <select
                            className={`input ${errors.selectedId ? 'input-error' : ''}`}
                            value={selectedId}
                            onChange={e => {
                                setSelectedId(e.target.value);
                                if (errors.selectedId) setErrors({ ...errors, selectedId: null });
                            }}
                        >
                            <option value="">Выберите...</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} (остаток: {item.quantity || 0} {item.unit})
                                </option>
                            ))}
                        </select>
                        {errors.selectedId && <p className="error-message">{errors.selectedId}</p>}
                    </div>

                    {/* Quantity */}
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
                            max={selectedItem?.quantity || 999}
                        />
                        {selectedItem && (
                            <p className="text-xs text-[var(--text-light)]">
                                Доступно: {selectedItem.quantity} {selectedItem.unit}
                            </p>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Причина (опционально)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Просрочка, брак, порча..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>

                    {/* Warning if quantity exceeds stock */}
                    {selectedItem && quantity > selectedItem.quantity && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            <span>Количество превышает остаток</span>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem' }}>
                        <button
                            onClick={handleWriteOff}
                            disabled={!selectedId || quantity <= 0 || (selectedItem && quantity > selectedItem.quantity)}
                            className="btn btn-danger w-full justify-center"
                        >
                            <Trash2 size={18} />
                            Списать
                        </button>
                    </div>
                </div>
            </div>

            {
                items.length === 0 && (
                    <div className="mt-6 text-center py-8 text-[var(--text-light)]">
                        <Trash2 size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Нет {type === 'ingredient' ? 'сырья' : 'продуктов'} для списания</p>
                    </div>
                )
            }
        </div >
    );
};

export default WriteOffManager;
