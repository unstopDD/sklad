import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import SlideOver from './ui/SlideOver';

const ProductManager = () => {
    const { products, ingredients, units, addProduct, removeProduct, addToast } = useInventoryStore();
    const [isSlideOpen, setIsSlideOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [expandedRecipe, setExpandedRecipe] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        id: null, name: '', unit: 'шт', recipe: []
    });
    const [recipeItem, setRecipeItem] = useState({ ingredientId: '', amount: '' });

    const openSlide = (product = null) => {
        if (product) {
            setFormData({ ...product });
        } else {
            setFormData({ id: null, name: '', unit: 'шт', recipe: [] });
        }
        setRecipeItem({ ingredientId: '', amount: '' });
        setIsSlideOpen(true);
    };

    const addRecipeItem = () => {
        if (recipeItem.ingredientId && recipeItem.amount) {
            setFormData({
                ...formData,
                recipe: [...formData.recipe, { ...recipeItem, amount: Number(recipeItem.amount) }]
            });
            setRecipeItem({ ingredientId: '', amount: '' });
        }
    };

    const removeRecipeItem = (index) => {
        setFormData({
            ...formData,
            recipe: formData.recipe.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addProduct(formData);
        addToast(formData.id ? 'Продукт обновлён' : 'Продукт создан', 'success');
        setIsSlideOpen(false);
    };

    const handleDelete = (id) => {
        removeProduct(id);
        addToast('Продукт удалён', 'success');
    };

    const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || 'Неизвестно';

    const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-[var(--text-secondary)] text-sm">
                    Создавайте технологические карты изделий.
                </p>
                <button onClick={() => openSlide()} className="btn btn-primary">
                    <Plus size={18} /> Создать продукт
                </button>
            </div>

            {/* Search */}
            <div className="card mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" size={18} />
                    <input
                        className="input pl-10"
                        placeholder="Поиск продукта..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Products List */}
            <div className="space-y-4">
                {filtered.map(product => (
                    <div key={product.id} className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Package size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold m-0">{product.name}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {product.recipe?.length || 0} ингредиентов • {product.unit}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setExpandedRecipe(expandedRecipe === product.id ? null : product.id)}
                                    className="btn btn-secondary text-sm"
                                >
                                    {expandedRecipe === product.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    Рецепт
                                </button>
                                <button onClick={() => openSlide(product)} className="btn-icon">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="btn-icon danger">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Recipe */}
                        {expandedRecipe === product.id && product.recipe?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Состав на 1 {product.unit}:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {product.recipe.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[var(--bg-page)] px-3 py-2 rounded-lg text-sm">
                                            <span className="flex-1">{getIngredientName(item.ingredientId)}</span>
                                            <span className="font-mono font-bold">{item.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="card text-center py-12">
                        <Package size={48} className="mx-auto mb-4 text-[var(--text-light)] opacity-30" />
                        <p className="font-medium text-[var(--text-secondary)]">Продукты не найдены</p>
                        <p className="text-sm text-[var(--text-light)]">Создайте первый продукт</p>
                    </div>
                )}
            </div>

            {/* SlideOver Form */}
            <SlideOver
                isOpen={isSlideOpen}
                onClose={() => setIsSlideOpen(false)}
                title={formData.id ? 'Редактировать продукт' : 'Новый продукт'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Название продукта</label>
                        <input
                            className="input"
                            placeholder="Например: Торт Наполеон"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Единица измерения</label>
                        <select
                            className="input"
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                        >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    {/* Recipe Builder */}
                    <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                        <label className="text-sm font-medium">Рецепт (состав)</label>

                        {formData.recipe.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {formData.recipe.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-[var(--bg-page)] p-2 rounded-lg">
                                        <span className="flex-1 text-sm">{getIngredientName(item.ingredientId)}</span>
                                        <span className="font-mono">{item.amount}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeRecipeItem(idx)}
                                            className="text-red-500 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <select
                                className="input flex-1"
                                value={recipeItem.ingredientId}
                                onChange={e => setRecipeItem({ ...recipeItem, ingredientId: e.target.value })}
                            >
                                <option value="">Выберите сырьё...</option>
                                {ingredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unit})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="input w-24 font-mono"
                                placeholder="Кол-во"
                                value={recipeItem.amount}
                                onChange={e => setRecipeItem({ ...recipeItem, amount: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={addRecipeItem}
                                className="btn btn-secondary"
                                disabled={!recipeItem.ingredientId || !recipeItem.amount}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
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

export default ProductManager;
