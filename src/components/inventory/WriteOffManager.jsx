import React, { useState } from 'react';
import { Trash2, Package, Beef, AlertCircle, Check } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useLang } from '../../i18n';

const WriteOffManager = () => {
    const { ingredients, products, addToast, logAction, updateIngredientQuantity, updateProductQuantity } = useInventoryStore();
    const { t } = useLang();
    const [type, setType] = useState('ingredient'); // 'ingredient' or 'product'
    const [selectedId, setSelectedId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState({});

    const items = type === 'ingredient' ? ingredients : products;
    const selectedItem = items.find(i => i.id === selectedId);

    const validate = () => {
        const newErrors = {};
        if (!selectedId) newErrors.selectedId = t.writeoff.selectItem;
        if (quantity <= 0) newErrors.quantity = t.writeoff.errorQty;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleWriteOff = async () => {
        if (!validate()) return;

        const item = items.find(i => i.id === selectedId);
        if (!item) return;

        if ((item.quantity || 0) < quantity) {
            addToast(t.writeoff.errorStock, 'error');
            return;
        }

        const newQty = (item.quantity || 0) - quantity;

        if (type === 'ingredient') {
            await updateIngredientQuantity(selectedId, newQty);
        } else {
            await updateProductQuantity(selectedId, newQty);
        }

        const reasonStr = reason ? ` (${reason})` : '';
        const logMsg = t.writeoff.logDesc
            .replace('{quantity}', quantity)
            .replace('{unit}', t.unitNames?.[item.unit] || item.unit || 'шт')
            .replace('{name}', item.name)
            .replace('{reason}', reasonStr);

        await logAction(t.writeoff.log, logMsg);
        addToast(t.writeoff.toastSuccess.replace('{name}', item.name), 'success');

        setQuantity(1);
        setReason('');
        setErrors({});
    };

    return (
        <div className="">
            <p className="text-[var(--text-secondary)] text-sm mb-6">
                {t.writeoff.desc}
            </p>

            <div className="card max-w-md">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Trash2 size={20} className="text-red-500" />
                    {t.writeoff.title}
                </h3>

                <div className="space-y-4">
                    {/* Type selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setType('ingredient'); setSelectedId(''); setErrors({}); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${type === 'ingredient'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-[var(--border)] hover:border-[var(--text-light)] text-[var(--text-secondary)]'
                                }`}
                        >
                            <Beef size={18} />
                            {t.writeoff.materials}
                        </button>
                        <button
                            onClick={() => { setType('product'); setSelectedId(''); setErrors({}); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${type === 'product'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-[var(--border)] hover:border-[var(--text-light)] text-[var(--text-secondary)]'
                                }`}
                        >
                            <Package size={18} />
                            {t.writeoff.products}
                        </button>
                    </div>

                    {/* Item selector */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            {type === 'ingredient' ? t.writeoff.materials : t.writeoff.products}
                        </label>
                        <select
                            className={`input ${errors.selectedId ? 'input-error' : ''}`}
                            value={selectedId}
                            onChange={e => {
                                setSelectedId(e.target.value);
                                if (errors.selectedId) setErrors({ ...errors, selectedId: null });
                            }}
                        >
                            <option value="">{t.writeoff.selectPlaceholder}</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({t.common.balance}: {item.quantity || 0} {t.unitNames?.[item.unit] || item.unit})
                                </option>
                            ))}
                        </select>
                        {errors.selectedId && <p className="error-message">{errors.selectedId}</p>}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">{t.writeoff.quantity}</label>
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
                                {t.writeoff.available}: {selectedItem.quantity} {t.unitNames?.[selectedItem.unit] || selectedItem.unit}
                            </p>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">{t.writeoff.reason}</label>
                        <input
                            type="text"
                            className="input"
                            placeholder={t.writeoff.reasonPlaceholder}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>

                    {/* Warning if quantity exceeds stock */}
                    {selectedItem && quantity > selectedItem.quantity && (
                        <div className="flex items-center gap-2 text-danger text-sm bg-danger/5 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            <span>{t.writeoff.errorExceeds}</span>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem' }}>
                        <button
                            onClick={handleWriteOff}
                            disabled={!selectedId || quantity <= 0 || (selectedItem && quantity > selectedItem.quantity)}
                            className="btn btn-danger w-full justify-center"
                        >
                            <Trash2 size={18} />
                            {t.writeoff.submit}
                        </button>
                    </div>
                </div>
            </div>

            {
                items.length === 0 && (
                    <div className="mt-6 text-center py-8 text-[var(--text-light)]">
                        <Trash2 size={48} className="mx-auto mb-4 opacity-30" />
                        <p>{t.writeoff.empty.replace('{type}', type === 'ingredient' ? t.writeoff.materials.toLowerCase() : t.writeoff.products.toLowerCase())}</p>
                    </div>
                )
            }
        </div >
    );
};

export default WriteOffManager;
