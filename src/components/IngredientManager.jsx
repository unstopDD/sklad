import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, X, AlertCircle } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const IngredientManager = () => {
    const { ingredients, units, addIngredient, removeIngredient } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('');

    // Form State
    const [formData, setFormData] = useState({ id: null, name: '', unit: 'кг', quantity: '', minStock: '' });

    const openModal = (ing = null) => {
        if (ing) {
            setFormData({ ...ing, quantity: ing.quantity.toString(), minStock: ing.minStock ? ing.minStock.toString() : '' });
        } else {
            setFormData({ id: null, name: '', unit: 'кг', quantity: '0', minStock: '5' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addIngredient({
            ...formData,
            quantity: Number(formData.quantity),
            minStock: Number(formData.minStock)
        });
        setIsModalOpen(false);
    };

    const filtered = ingredients.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">Склад сырья</h2>
                    <p className="text-gray-500 text-sm mt-1">Управляйте остатками ингредиентов и материалов.</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary bg-[#1e40af] hover:bg-[#1e3a8a]">
                    <Plus size={18} /> Добавить сырьё
                </button>
            </div>

            <div className="card p-0 overflow-hidden border-none shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            className="input pl-9"
                            placeholder="Поиск..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ед. изм.</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Остаток</th>
                            <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Мин. остаток</th>
                            <th className="py-3 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filtered.map(ing => {
                            const isLow = ing.minStock && ing.quantity <= ing.minStock;
                            return (
                                <tr key={ing.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">{ing.name}</td>
                                    <td className="py-4 px-6 text-gray-500">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 round text-xs rounded">{ing.unit}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono font-bold ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                                                {ing.quantity}
                                            </span>
                                            {isLow && <AlertCircle size={14} className="text-red-500" title="Мало на складе" />}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-500 font-mono">{ing.minStock || '-'}</td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(ing)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => removeIngredient(ing.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
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
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Search size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium text-gray-500">Склад пуст</p>
                                        <p className="text-sm">Добавьте материалы, из которых будете производить продукцию.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 m-0">{formData.id ? 'Редактировать' : 'Добавить сырьё'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Название</label>
                                <input
                                    className="input text-gray-900 placeholder:text-gray-400 border-gray-300 bg-gray-50 focus:bg-white"
                                    placeholder="Например: Ткань, Мука, Доски, Кожа..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Ед. изм.</label>
                                    <select
                                        className="input text-gray-900 border-gray-300 bg-gray-50 focus:bg-white"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Мин. остаток</label>
                                    <input
                                        type="number"
                                        className="input text-gray-900 border-gray-300 bg-gray-50 focus:bg-white"
                                        value={formData.minStock}
                                        onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Текущий остаток</label>
                                <input
                                    type="number"
                                    className="input text-gray-900 border-gray-300 bg-gray-50 focus:bg-white"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="0"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Используйте это поле для начального ввода или инвентаризации.</p>
                            </div>

                            <div className="flex gap-3 mt-6 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1 justify-center">Отмена</button>
                                <button type="submit" className="btn btn-primary flex-1 justify-center bg-blue-600 hover:bg-blue-700">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IngredientManager;
