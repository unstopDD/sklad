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
    const [errors, setErrors] = useState({});
    const [isAddingRecipeItem, setIsAddingRecipeItem] = useState(false);

    const openSlide = (product = null) => {
        if (product) {
            setFormData({ ...product });
        } else {
            setFormData({ id: null, name: '', unit: 'шт', recipe: [] });
        }
        setRecipeItem({ ingredientId: '', amount: '' });
        setErrors({});
        setIsAddingRecipeItem(false);
        setIsSlideOpen(true);
    };

    const addRecipeItem = () => {
        if (recipeItem.ingredientId && recipeItem.amount) {
            setFormData({
                ...formData,
                recipe: [...formData.recipe, { ...recipeItem, amount: Number(recipeItem.amount) }]
            });
            setRecipeItem({ ingredientId: '', amount: '' });
            setIsAddingRecipeItem(false);
        }
    };

    const removeRecipeItem = (index) => {
        setFormData({
            ...formData,
            recipe: formData.recipe.filter((_, i) => i !== index)
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Введите название продукта';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const result = addProduct({ ...formData, name: formData.name.trim() });

        if (result.success) {
            addToast(formData.id ? 'Продукт обновлён' : 'Продукт создан', 'success');
            setIsSlideOpen(false);
        }
    };

    const handleDelete = (id) => {
        removeProduct(id);
        addToast('Продукт удалён', 'success');
    };

    const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || 'Неизвестно';

    const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="">
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
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label className="block text-sm font-medium mb-2">Название продукта</label>
                        <input
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder="Например: Изделие А, Комплект B..."
                            value={formData.name}
                            onChange={e => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: null });
                            }}
                            required
                            autoFocus
                        />
                        {errors.name && <p className="error-message mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Единица измерения</label>
                        <select
                            className="input"
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                        >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>



                    {/* Recipe Builder */}
                    <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                        <label className="block text-sm font-medium">Рецепт (состав)</label>

                        {/* Empty State */}
                        {formData.recipe.length === 0 && !isAddingRecipeItem && (
                            <div className="bg-[var(--bg-page)] rounded-lg p-6 border border-dashed border-[var(--border)] text-center">
                                <div className="flex flex-col items-center gap-2 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <div className="i-lucide-lightbulb text-blue-500 text-xl">💡</div>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Добавьте ингредиенты, если продукт состоит из других позиций
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingRecipeItem(true)}
                                    className="btn btn-secondary w-full justify-center border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <Plus size={18} /> Добавить ингредиент
                                </button>
                            </div>
                        )}

                        {/* Filled State (List) */}
                        {formData.recipe.length > 0 && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[var(--text-secondary)] px-2 pb-1">
                                    <div className="col-span-6">Ингредиент</div>
                                    <div className="col-span-3">Кол-во</div>
                                    <div className="col-span-3 text-right">Ед.</div>
                                </div>
                                <div className="space-y-2">
                                    {formData.recipe.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[var(--bg-page)] p-2 rounded-lg group">
                                            <div className="grid grid-cols-12 gap-2 flex-1 items-center">
                                                <div className="col-span-6 text-sm truncate" title={getIngredientName(item.ingredientId)}>
                                                    {getIngredientName(item.ingredientId)}
                                                </div>
                                                <div className="col-span-3 font-mono text-sm">
                                                    {item.amount}
                                                </div>
                                                <div className="col-span-3 text-xs text-[var(--text-secondary)]">
                                                    {ingredients.find(i => i.id === item.ingredientId)?.unit}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeRecipeItem(idx)}
                                                className="btn-icon danger opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Button (at bottom of list) */}
                        {formData.recipe.length > 0 && !isAddingRecipeItem && (
                            <button
                                type="button"
                                onClick={() => setIsAddingRecipeItem(true)}
                                className="btn btn-secondary w-full justify-center border-dashed text-[var(--text-secondary)]"
                            >
                                <Plus size={18} /> Добавить ингредиент
                            </button>
                        )}

                        {/* Add Form (Input Mode) */}
                        {isAddingRecipeItem && (
                            <div className="bg-[var(--bg-page)] p-4 rounded-lg border border-[var(--primary)] space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2.5">Ингредиент</label>
                                        <select
                                            className="input"
                                            value={recipeItem.ingredientId}
                                            onChange={e => setRecipeItem({ ...recipeItem, ingredientId: e.target.value })}
                                            autoFocus
                                        >
                                            <option value="">Выберите...</option>
                                            {ingredients.map(ing => (
                                                <option key={ing.id} value={ing.id}>
                                                    {ing.name} ({ing.unit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2.5">Количество</label>
                                            <input
                                                type="number"
                                                className="input font-mono"
                                                placeholder="0.0"
                                                value={recipeItem.amount}
                                                onChange={e => setRecipeItem({ ...recipeItem, amount: e.target.value })}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addRecipeItem();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="w-20">
                                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2.5">Ед.</label>
                                            <div className="h-[44px] flex items-center text-sm text-[var(--text-secondary)]">
                                                {recipeItem.ingredientId ? ingredients.find(i => i.id === recipeItem.ingredientId)?.unit : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end" style={{ marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingRecipeItem(false)}
                                        className="btn btn-secondary text-sm"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addRecipeItem}
                                        className="btn btn-primary text-sm"
                                        disabled={!recipeItem.ingredientId || !recipeItem.amount}
                                    >
                                        <Plus size={16} /> Добавить
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-[var(--border)]" style={{ marginTop: '3rem' }}>
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
