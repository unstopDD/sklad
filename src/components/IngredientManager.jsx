import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, AlertCircle, ScanLine } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import SlideOver from './ui/SlideOver';

const IngredientManager = () => {
    const { ingredients, units, addIngredient, removeIngredient, updateIngredientQuantity, addToast } = useInventoryStore();
    const [isSlideOpen, setIsSlideOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [editingQty, setEditingQty] = useState(null);

    // Form State
    const [formData, setFormData] = useState({ id: null, name: '', unit: 'кг', quantity: '', minStock: '' });

    const openSlide = (ing = null) => {
        if (ing) {
            setFormData({ ...ing, quantity: ing.quantity.toString(), minStock: ing.minStock ? ing.minStock.toString() : '' });
        } else {
            setFormData({ id: null, name: '', unit: 'кг', quantity: '0', minStock: '5' });
        }
        setIsSlideOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addIngredient({
            ...formData,
            quantity: Number(formData.quantity),
            minStock: Number(formData.minStock)
        });
        addToast(formData.id ? 'Сырьё обновлено' : 'Сырьё добавлено', 'success');
        setIsSlideOpen(false);
    };

    const handleInlineEdit = (id, value) => {
        updateIngredientQuantity(id, Number(value));
        setEditingQty(null);
        addToast('Остаток обновлён', 'success');
    };

    const handleDelete = (id) => {
        removeIngredient(id);
        addToast('Сырьё удалено', 'success');
    };

    const getStockStatus = (ing) => {
        if (ing.quantity === 0) return 'danger';
        if (ing.minStock && ing.quantity <= ing.minStock) return 'warning';
        return 'success';
    };

    const filtered = ingredients.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[var(--text-secondary)] text-sm">Управляйте остатками ингредиентов и материалов.</p>
                </div>
                <button onClick={() => openSlide()} className="btn btn-primary">
                    <Plus size={18} /> Добавить сырьё
                </button>
            </div>

            {/* Search */}
            <div className="card mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" size={18} />
                        <input
                            className="input pl-10"
                            placeholder="Поиск по названию..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <ScanLine size={18} /> Сканировать
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="card p-0 desktop-table">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Ед. изм.</th>
                                <th className="text-right">Остаток</th>
                                <th className="text-right">Мин.</th>
                                <th className="text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(ing => {
                                const status = getStockStatus(ing);
                                return (
                                    <tr key={ing.id}>
                                        <td className="font-medium">{ing.name}</td>
                                        <td>
                                            <span className="badge badge-success">{ing.unit}</span>
                                        </td>
                                        <td className="text-right">
                                            {editingQty === ing.id ? (
                                                <input
                                                    type="number"
                                                    className="inline-edit"
                                                    defaultValue={ing.quantity}
                                                    autoFocus
                                                    onBlur={(e) => handleInlineEdit(ing.id, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleInlineEdit(ing.id, e.target.value);
                                                        if (e.key === 'Escape') setEditingQty(null);
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    className={`font-mono cursor-pointer badge badge-${status}`}
                                                    onClick={() => setEditingQty(ing.id)}
                                                    title="Кликните для редактирования"
                                                >
                                                    {ing.quantity}
                                                    {status !== 'success' && <AlertCircle size={12} />}
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-right font-mono text-[var(--text-secondary)]">
                                            {ing.minStock || '-'}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openSlide(ing)}
                                                    className="btn-icon"
                                                    title="Редактировать"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ing.id)}
                                                    className="btn-icon danger"
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-[var(--text-light)]">
                                            <Search size={48} className="mb-4 opacity-30" />
                                            <p className="font-medium text-[var(--text-secondary)]">Склад пуст</p>
                                            <p className="text-sm">Добавьте материалы, из которых будете производить продукцию.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-cards">
                {filtered.map(ing => {
                    const status = getStockStatus(ing);
                    return (
                        <div key={ing.id} className="mobile-card">
                            <div className="mobile-card-header">
                                <span className="mobile-card-name">{ing.name}</span>
                                <span className={`badge badge-${status}`}>
                                    {ing.quantity} {ing.unit}
                                    {status !== 'success' && <AlertCircle size={12} />}
                                </span>
                            </div>
                            <div className="mobile-card-meta">
                                <span>Мин: {ing.minStock || '-'}</span>
                            </div>
                            <div className="mobile-card-actions">
                                <button onClick={() => openSlide(ing)} className="btn btn-secondary flex-1">
                                    <Edit2 size={16} /> Изменить
                                </button>
                                <button onClick={() => handleDelete(ing.id)} className="btn btn-secondary">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-light)]">
                        <Search size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Склад пуст</p>
                    </div>
                )}
            </div>

            {/* SlideOver Form */}
            <SlideOver
                isOpen={isSlideOpen}
                onClose={() => setIsSlideOpen(false)}
                title={formData.id ? 'Редактировать сырьё' : 'Добавить сырьё'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Название</label>
                        <input
                            className="input"
                            placeholder="Например: Ткань, Мука, Доски..."
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Ед. измерения</label>
                            <select
                                className="input"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Мин. остаток</label>
                            <input
                                type="number"
                                className="input font-mono"
                                value={formData.minStock}
                                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Текущий остаток</label>
                        <input
                            type="number"
                            className="input font-mono"
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="0"
                            required
                        />
                        <p className="text-xs text-[var(--text-light)] mt-1">
                            Используйте для начального ввода или инвентаризации.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsSlideOpen(false)} className="btn btn-secondary flex-1">
                            Отмена
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            Сохранить
                        </button>
                    </div>
                </form>
            </SlideOver>
        </div>
    );
};

export default IngredientManager;
