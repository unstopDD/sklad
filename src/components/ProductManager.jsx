import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, ChevronRight, X, Save } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const ProductManager = () => {
    const { products, ingredients, units, addProduct, removeProduct } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        unit: 'шт',
        recipe: []
    });

    const openModal = (prod = null) => {
        if (prod) {
            setFormData(prod);
        } else {
            setFormData({ id: null, name: '', unit: 'шт', recipe: [] });
        }
        setIsModalOpen(true);
    };

    const handleAddIngredient = () => {
        setFormData({
            ...formData,
            recipe: [...formData.recipe, { ingredientId: '', amount: '' }]
        });
    };

    const updateRecipeItem = (idx, field, val) => {
        const newRecipe = [...formData.recipe];
        newRecipe[idx][field] = val;
        setFormData({ ...formData, recipe: newRecipe });
    };

    const removeRecipeItem = (idx) => {
        setFormData({
            ...formData,
            recipe: formData.recipe.filter((_, i) => i !== idx)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanRecipe = formData.recipe
            .filter(r => r.ingredientId && r.amount)
            .map(r => ({ ...r, amount: Number(r.amount) }));

        addProduct({ ...formData, recipe: cleanRecipe });
        setIsModalOpen(false);
    };

    const getIngName = (id) => ingredients.find(i => i.id === id)?.name || '???';
    const getIngUnit = (id) => ingredients.find(i => i.id === id)?.unit || '';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">Продукты и Рецепты</h2>
                    <p className="text-gray-500 text-sm mt-1">Создавайте технологические карты изделий.</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary bg-[#1e40af] hover:bg-[#1e3a8a]">
                    <Plus size={18} /> Создать продукт
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(prod => (
                    <div key={prod.id} className="card shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">
                                    {prod.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 m-0 text-lg">{prod.name}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        В наличии: 0 {prod.unit}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(prod)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 size={16} /></button>
                                <button onClick={() => removeProduct(prod.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Состав (на 1 {prod.unit})</p>
                            {prod.recipe.length > 0 ? (
                                <ul className="space-y-1 text-sm">
                                    {prod.recipe.slice(0, 3).map((r, i) => (
                                        <li key={i} className="flex justify-between text-gray-600">
                                            <span>{getIngName(r.ingredientId)}</span>
                                            <span className="font-medium text-gray-900">{r.amount} {getIngUnit(r.ingredientId)}</span>
                                        </li>
                                    ))}
                                    {prod.recipe.length > 3 && <li className="text-xs text-gray-400 pt-1">+ еще {prod.recipe.length - 3} ...</li>}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Рецепт не задан</p>
                            )}
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <Package className="mx-auto text-gray-300 mb-2" size={48} />
                        <p className="text-gray-500 font-medium">Продукты не найдены</p>
                        <button onClick={() => openModal()} className="text-blue-600 text-sm hover:underline mt-1">Создать первый продукт</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 m-0">{formData.id ? 'Редактировать продукт' : 'Новый продукт'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Название продукта</label>
                                    <input
                                        className="input bg-gray-800 text-white placeholder:text-gray-400 border-gray-700 focus:border-blue-500"
                                        style={{ backgroundColor: '#374151', color: 'white' }}
                                        placeholder="Например: Стул, Пицца, Обувь..."
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Ед. измерения</label>
                                    <select
                                        className="input bg-gray-800 text-white border-gray-700"
                                        style={{ backgroundColor: '#374151', color: 'white' }}
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-gray-700">Рецепт (Ингредиенты)</label>
                                    <button type="button" onClick={handleAddIngredient} className="btn btn-secondary text-xs py-1">
                                        <Plus size={14} /> Добавить
                                    </button>
                                </div>

                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[100px]">
                                    {formData.recipe.map((row, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <select
                                                className="input flex-1 bg-white border-gray-200 text-sm"
                                                value={row.ingredientId}
                                                onChange={e => updateRecipeItem(idx, 'ingredientId', e.target.value)}
                                                required
                                            >
                                                <option value="">Выберите сырьё...</option>
                                                {ingredients.map(ing => (
                                                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                className="input w-24 bg-white border-gray-200 text-sm"
                                                placeholder="Кол-во"
                                                value={row.amount}
                                                onChange={e => updateRecipeItem(idx, 'amount', e.target.value)}
                                                step="0.001"
                                                required
                                            />
                                            <span className="text-xs text-gray-500 w-8">
                                                {row.ingredientId ? getIngUnit(row.ingredientId) : ''}
                                            </span>
                                            <button type="button" onClick={() => removeRecipeItem(idx)} className="text-gray-400 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.recipe.length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-2">Список ингредиентов пуст.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Отмена</button>
                                <button type="submit" className="btn btn-primary bg-blue-600 hover:bg-blue-700 flex-1">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
