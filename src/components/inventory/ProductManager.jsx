import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Package, Search, ChevronDown, ChevronUp, Download, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { ExportService } from '../../utils/ExportService';
import { ImportService } from '../../utils/ImportService';
import SlideOver from '../ui/SlideOver';
import ExportModal from '../ui/ExportModal';
import ImportGuideModal from '../ui/ImportGuideModal';
import { useLang } from '../../i18n';

const ProductManager = () => {
    const { products, ingredients, units, addProduct, removeProduct, addIngredient, addToast } = useInventoryStore();
    const { t } = useLang();
    const [isSlideOpen, setIsSlideOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [expandedRecipe, setExpandedRecipe] = useState(null);
    const [importPreview, setImportPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        id: null, name: '', unit: 'шт', recipe: []
    });
    const [recipeItem, setRecipeItem] = useState({ ingredientId: '', amount: '' });
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [isAddingRecipeItem, setIsAddingRecipeItem] = useState(false);
    const [editingRecipeIndex, setEditingRecipeIndex] = useState(null);

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
            // Check for duplicates
            const isDuplicate = formData.recipe.some(
                item => item.ingredientId === recipeItem.ingredientId
            );

            if (isDuplicate) {
                addToast(t.common.alreadyInComposition || 'Это сырье уже есть в составе', 'warning');
                return;
            }

            setFormData({
                ...formData,
                recipe: [...formData.recipe, { ...recipeItem, amount: Number(recipeItem.amount) }]
            });
            setRecipeItem({ ingredientId: '', amount: '' });
            setIsAddingRecipeItem(false);
        }
    };

    const updateRecipeItemAmount = (index, delta) => {
        const newRecipe = [...formData.recipe];
        const currentAmount = newRecipe[index].amount;
        const newAmount = Math.max(0, Number((currentAmount + delta).toFixed(3)));

        if (newAmount === 0) {
            // Optional: confirm deletion or just set to 0? Let's just set to 0 for now
        }

        newRecipe[index].amount = newAmount;
        setFormData({ ...formData, recipe: newRecipe });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const result = await addProduct({ ...formData, name: formData.name.trim() });

        if (result.success) {
            addToast(formData.id ? t.products.editSuccess || 'Продукт оновлено' : t.products.addSuccess || 'Продукт створено', 'success');
            setIsSlideOpen(false);
        }
    };

    const handleDelete = (id) => {
        removeProduct(id);
        addToast(t.products.deleteSuccess || 'Продукт видалено', 'success');
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const rawData = await ImportService.parseFile(file);
            const mapped = ImportService.mapToProducts(rawData, t, ingredients);
            if (mapped.length > 0) {
                setImportPreview(mapped);
            } else {
                addToast(t.common.noData || 'Нет данных для импорта', 'error');
            }
        } catch (err) {
            console.error('Import error:', err);
            addToast(t.ingredients.importError || 'Ошибка при импорте', 'error');
        }
        e.target.value = '';
    };

    const confirmImport = async () => {
        if (!importPreview) return;

        let added = 0;
        let skipped = 0;

        for (const item of importPreview) {
            // 1. Process Recipe: find or create missing ingredients
            const processedRecipe = [];
            for (const r of item.recipe) {
                if (r.ingredientId) {
                    processedRecipe.push(r);
                } else if (r.ingName) {
                    // Ingredient not found by ID, try finding by name again (could have been added in this loop)
                    const latestIngredients = useInventoryStore.getState().ingredients;
                    const existing = latestIngredients.find(i => i.name.toLowerCase() === r.ingName.toLowerCase());

                    if (existing) {
                        processedRecipe.push({ ingredientId: existing.id, amount: r.amount });
                    } else {
                        // Create NEW ingredient
                        const res = await addIngredient({
                            name: r.ingName,
                            quantity: 0,
                            unit: 'кг', // Default unit
                            minStock: 0
                        });

                        if (res.success && res.ingredient) {
                            processedRecipe.push({ ingredientId: res.ingredient.id, amount: r.amount });
                        }
                    }
                }
            }

            // 2. Add product with finalized recipe
            const res = await addProduct({ ...item, recipe: processedRecipe });
            if (res.success) added++;
            else skipped++;
        }

        const msg = (t.products.importSuccess || 'Імпортовано {count} записів').replace('{count}', added.toString());
        const extra = skipped > 0 ? ` (${skipped} ${t.common.skipped || 'пропущено'})` : '';
        addToast(msg + extra, added > 0 ? 'success' : 'info');
        setImportPreview(null);
    };

    const getIngredientName = (id) => ingredients.find(i => i.id === id)?.name || 'Неизвестно';

    const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)]">{t.products.title}</h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {t.products.desc || 'Управляйте составом ваших изделий.'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-light)]">
                        <AlertCircle size={14} className="text-[var(--primary)]" />
                        <span>{t.products.importFormat}</span>
                        <span className="mx-1">•</span>
                        <button
                            onClick={() => ExportService.downloadTemplate('products', t)}
                            className="text-[var(--primary)] hover:underline font-medium"
                        >
                            {t.common.downloadTemplate}
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />
                    <button
                        onClick={() => setIsImportGuideOpen(true)}
                        className="btn bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all"
                        title={t.common.import}
                    >
                        <Upload size={18} className="text-[var(--primary)]" />
                        <span className="hidden sm:inline">{t.common.import}</span>
                    </button>
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="btn bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all"
                        title={t.common.export}
                    >
                        <Download size={18} className="text-[var(--primary)]" />
                        <span className="font-bold hidden sm:inline">{t.common.export}</span>
                    </button>
                    <button onClick={() => openSlide()} className="btn btn-primary">
                        <Plus size={18} /> {t.products.addNew}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm p-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" size={18} aria-hidden="true" />
                    <input
                        id="product-search"
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-[var(--text-main)] placeholder-[var(--text-light)] focus:outline-none"
                        placeholder={t.products.searchPlaceholder}
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        aria-label={t.common.searchLabel || "Поиск продуктов"}
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map(product => (
                    <div key={product.id} className="group relative flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
                        <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                            <div className="flex flex-col gap-1 min-w-0">
                                <h3 className="text-lg font-bold text-[var(--text-main)] leading-tight">{product.name}</h3>
                                <span className="text-[13px] font-mono text-[var(--text-light)]">
                                    {product.recipe?.length || 0} {t.products.components}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <div className="text-2xl font-extrabold font-mono text-[var(--text-main)] leading-none">{product.quantity || 0}</div>
                                <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{t.unitNames?.[product.unit] || product.unit}</div>
                            </div>
                        </div>

                        {/* Expanded Recipe */}
                        {expandedRecipe === product.id && product.recipe?.length > 0 && (
                            <div className="pt-3 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-1 duration-200">
                                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                                    {t.products.compositionLabel || 'Состав'} на 1 {t.unitNames?.[product.unit] || product.unit}:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.recipe.map((item, idx) => (
                                        <span key={idx} className="text-xs bg-[var(--bg-page)] text-[var(--text-main)] px-2 py-1 rounded-md border border-[var(--border)]">
                                            {getIngredientName(item.ingredientId)} <span className="text-[var(--text-secondary)]">× {item.amount}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-3 border-t border-[var(--border)] mt-auto">
                            <button
                                className="flex-1 h-10 px-3 flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-page)] border border-transparent hover:border-[var(--border)] rounded-lg transition-all"
                                onClick={() => setExpandedRecipe(expandedRecipe === product.id ? null : product.id)}
                                aria-expanded={expandedRecipe === product.id}
                                aria-label={expandedRecipe === product.id ? t.products.hideComposition : t.products.showComposition}
                            >
                                {expandedRecipe === product.id ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                                <span className="text-xs">{t.products.composition}</span>
                            </button>
                            <button
                                className="h-10 w-10 flex items-center justify-center text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-lg transition-all"
                                onClick={() => openSlide(product)}
                                aria-label={`Редактировать ${product.name}`}
                            >
                                <Edit2 size={16} aria-hidden="true" />
                            </button>
                            <button
                                className="h-10 w-10 flex items-center justify-center text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 rounded-lg transition-all"
                                onClick={() => handleDelete(product.id)}
                                aria-label={`Удалить ${product.name}`}
                            >
                                <Trash2 size={16} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] text-center py-16">
                    <Package size={48} className="mx-auto mb-4 text-[var(--text-light)] opacity-30" />
                    <p className="font-medium text-[var(--text-secondary)]">{t.products.noFound || 'Продукты не найдены'}</p>
                    <p className="text-sm text-[var(--text-light)] mt-1">{t.products.createFirst || 'Создайте первый продукт, чтобы начать производство'}</p>
                </div>
            )}

            {/* SlideOver Form */}
            <SlideOver
                isOpen={isSlideOpen}
                onClose={() => setIsSlideOpen(false)}
                title={formData.id ? t.products.editProduct : t.products.newProduct}
            >
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium mb-2 text-[var(--text-main)]">{t.products.name}</label>
                        <input
                            id="product-name"
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder={t.products.namePlaceholder || "Название продукта..."}
                            value={formData.name}
                            onChange={e => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: null });
                            }}
                            required
                            autoFocus
                            aria-describedby={errors.name ? 'product-name-error' : undefined}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <p id="product-name-error" className="error-message mt-1" role="alert">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="product-unit" className="block text-sm font-medium mb-2 text-[var(--text-main)]">{t.common.unitLabel || t.ingredients.unit || 'Единица измерения'}</label>
                        <div className="relative">
                            <select
                                id="product-unit"
                                className="input appearance-none bg-[var(--bg-card)]"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                {units.map(u => <option key={u} value={u}>{t.unitNames?.[u] || u}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Recipe Builder */}
                    <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-[var(--text-main)]">{t.products.composition} ({t.products.compositionLabelLower || 'состав'})</label>
                            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-page)] px-2 py-0.5 rounded-full">
                                {formData.recipe.length} {t.products.components}
                            </span>
                        </div>

                        {/* Empty State */}
                        {formData.recipe.length === 0 && !isAddingRecipeItem && (
                            <div className="bg-[var(--bg-page)] rounded-xl p-6 border border-dashed border-[var(--border)] text-center ring-4 ring-transparent hover:ring-[var(--primary-light)] transition-all cursor-pointer" onClick={() => setIsAddingRecipeItem(true)}>
                                <div className="flex flex-col items-center gap-2 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <div className="text-blue-600 dark:text-blue-400 text-xl">💡</div>
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                                        {t.products.recipeEmptyTitle || 'Состав продукта пуст'}
                                    </p>
                                    <p className="text-xs text-[var(--text-light)]">
                                        {t.products.recipeEmptyDesc || 'Добавьте сырье, из которого производится этот продукт'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary w-full justify-center border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <Plus size={18} /> {t.products.addComponent}
                                </button>
                            </div>
                        )}

                        {/* Filled State (List) */}
                        {formData.recipe.length > 0 && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-3 pb-1 border-b border-[var(--border)]">
                                    <div className="col-span-6">{t.ingredients.name || 'Название'}</div>
                                    <div className="col-span-3">{t.ingredients.quantity || 'Кол-во'}</div>
                                    <div className="col-span-3 text-right">{t.common.action || 'Действия'}</div>
                                </div>
                                <div className="space-y-2">
                                    {formData.recipe.map((item, idx) => (
                                        <div key={idx} className="group flex items-center gap-2 bg-[var(--bg-page)] border border-transparent hover:border-[var(--border)] p-2.5 rounded-xl transition-all">
                                            <div className="grid grid-cols-12 gap-3 flex-1 items-center">
                                                <div className="col-span-4 text-sm font-medium text-[var(--text-main)] truncate" title={getIngredientName(item.ingredientId)}>
                                                    {getIngredientName(item.ingredientId)}
                                                </div>
                                                <div className="col-span-5 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateRecipeItemAmount(idx, -1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--text-light)] transition-all active:scale-95"
                                                        tabIndex="-1"
                                                    >
                                                        -
                                                    </button>

                                                    {editingRecipeIndex === idx ? (
                                                        <input
                                                            type="number"
                                                            className="w-16 h-8 text-center font-mono text-sm bg-[var(--bg-card)] border border-[var(--primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                                                            defaultValue={item.amount}
                                                            autoFocus
                                                            onBlur={(e) => {
                                                                const val = Number(e.target.value);
                                                                if (val > 0) {
                                                                    const newRecipe = [...formData.recipe];
                                                                    newRecipe[idx].amount = val;
                                                                    setFormData({ ...formData, recipe: newRecipe });
                                                                }
                                                                setEditingRecipeIndex(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    e.currentTarget.blur();
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() => setEditingRecipeIndex(idx)}
                                                            className="flex-1 h-8 flex items-center justify-center font-mono text-lg font-bold text-[var(--text-main)] cursor-pointer hover:bg-[var(--bg-card)] hover:text-[var(--primary)] rounded transition-colors select-none"
                                                            title="Нажмите, чтобы изменить количество"
                                                        >
                                                            {item.amount} <span className="text-[var(--text-secondary)] text-xs ml-1 font-normal">{t.unitNames?.[ingredients.find(i => i.id === item.ingredientId)?.unit] || ingredients.find(i => i.id === item.ingredientId)?.unit}</span>
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => updateRecipeItemAmount(idx, 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--text-light)] transition-all active:scale-95"
                                                        tabIndex="-1"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="col-span-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRecipeItem(idx)}
                                                        className="h-8 w-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        aria-label={`${t.common.delete || 'Удалить'} ${getIngredientName(item.ingredientId)} ${t.products.fromComposition || 'из состава'}`}
                                                    >
                                                        <Trash2 size={16} aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
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
                                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all font-medium text-sm"
                            >
                                <Plus size={18} /> {t.products.addComponent}
                            </button>
                        )}

                        {/* Add Form (Input Mode) */}
                        {isAddingRecipeItem && (
                            <div className="bg-[var(--bg-card)] p-4 rounded-xl border-2 border-[var(--primary)] shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="recipe-ingredient" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{t.products.selectIngredient || 'Выберите сырье'}</label>
                                        <div className="relative">
                                            <select
                                                id="recipe-ingredient"
                                                className="input appearance-none"
                                                value={recipeItem.ingredientId}
                                                onChange={e => setRecipeItem({ ...recipeItem, ingredientId: e.target.value })}
                                                autoFocus
                                            >
                                                <option value="">{t.products.notSelected || 'Не выбрано...'}</option>
                                                {ingredients
                                                    .filter(ing => !formData.recipe.some(r => r.ingredientId === ing.id))
                                                    .map(ing => (
                                                        <option key={ing.id} value={ing.id}>
                                                            {ing.name} ({t.unitNames?.[ing.unit] || ing.unit})
                                                        </option>
                                                    ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="recipe-amount" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{t.products.consumption || 'Расход'}</label>
                                            <input
                                                type="number"
                                                id="recipe-amount"
                                                className="input font-mono text-lg"
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
                                        <div className="w-24">
                                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{t.products.unitLabel || 'Ед. изм.'}</label>
                                            <div className="h-[50px] flex items-center justify-center bg-[var(--bg-page)] rounded-xl border border-[var(--border)] font-mono text-sm text-[var(--text-secondary)]">
                                                {recipeItem.ingredientId ? (t.unitNames?.[ingredients.find(i => i.id === recipeItem.ingredientId)?.unit] || ingredients.find(i => i.id === recipeItem.ingredientId)?.unit) : '---'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingRecipeItem(false)}
                                        className="btn flex-1 bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        {t.common.cancel || 'Отмена'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addRecipeItem}
                                        className="btn btn-primary flex-1 shadow-md shadow-blue-500/20"
                                        disabled={!recipeItem.ingredientId || !recipeItem.amount}
                                    >
                                        <Plus size={18} /> {t.common.add || 'Добавить'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-6 mt-8 border-t border-[var(--border)] sticky bottom-0 bg-[var(--bg-card)] z-10">
                        <button type="button" onClick={() => setIsSlideOpen(false)} className="btn btn-secondary flex-1 h-12 text-base">
                            {t.common.cancel}
                        </button>
                        <button type="submit" className="btn btn-primary flex-1 h-12 text-base shadow-lg shadow-blue-500/20">
                            {t.common.save}
                        </button>
                    </div>
                </form>
            </SlideOver>
            {/* Export Format Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={(format) => ExportService.exportProducts(products, t, ingredients, format)}
            />

            {/* Import Preview Modal */}
            {importPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-main)]">{t.products.importPreview || 'Предварительный просмотр'}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{t.products.importConfirm || 'Подтвердите импорт данных'}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                                    <AlertCircle size={14} />
                                    <span>{t.products.importFormatTip || (t.lang === 'uk' ? 'Формат складу: "Назва: Кількість, ..."' : 'Формат состава: "Название: Количество, ..."')}</span>
                                </div>
                                <button onClick={() => setImportPreview(null)} className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-secondary)]">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-[var(--bg-page)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">{t.products.name}</th>
                                        <th className="px-6 py-3">{t.products.quantity}</th>
                                        <th className="px-6 py-3">{t.products.composition}</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {importPreview.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-[var(--bg-page)]">
                                            <td className="px-6 py-4 font-bold text-[var(--text-main)]">{item.name}</td>
                                            <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.recipe.map((r, i) => (
                                                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${r.ingredientId ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                            {r.ingredientId ? getIngredientName(r.ingredientId) : r.ingName}: {r.amount}
                                                            {!r.ingredientId && <Plus size={8} />}
                                                        </span>
                                                    ))}
                                                    {item.warnings?.map((w, i) => (
                                                        <span key={i} className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1">
                                                            <AlertCircle size={10} /> {w}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.warnings && <AlertCircle className="text-orange-500" size={18} title={item.warnings.join('\n')} />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-page)] flex justify-end gap-3">
                            <button onClick={() => setImportPreview(null)} className="btn btn-secondary">
                                {t.common.cancel}
                            </button>
                            <button onClick={confirmImport} className="btn btn-primary shadow-lg shadow-blue-500/20">
                                <CheckCircle2 size={18} />
                                {t.common.confirm} ({importPreview.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Guide Modal */}
            <ImportGuideModal
                isOpen={isImportGuideOpen}
                onClose={() => setIsImportGuideOpen(false)}
                type="products"
                t={t}
                onDownloadTemplate={() => ExportService.downloadTemplate('products', t)}
                onProceed={() => {
                    setIsImportGuideOpen(false);
                    fileInputRef.current?.click();
                }}
            />
        </div>
    );
};

export default ProductManager;
