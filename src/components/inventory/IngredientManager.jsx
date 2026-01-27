import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, AlertCircle, Download, Upload, X, CheckCircle2, HelpCircle, Lock } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { ExportService } from '../../utils/ExportService';
import { ImportService } from '../../utils/ImportService';
import SlideOver from '../ui/SlideOver';
import ExportModal from '../ui/ExportModal';
import ImportGuideModal from '../ui/ImportGuideModal';
import { useLang } from '../../i18n';

const IngredientManager = () => {
    const { ingredients, units, addIngredient, removeIngredient, updateIngredientQuantity, addToast } = useInventoryStore();
    const { t } = useLang();
    const [isSlideOpen, setIsSlideOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [editingQty, setEditingQty] = useState(null);
    const [importPreview, setImportPreview] = useState(null);
    const [importMode, setImportMode] = useState('inventory'); // 'inventory' or 'supply'
    const [fileTypeMismatch, setFileTypeMismatch] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const fileInputRef = React.useRef(null);

    // Form State
    const [formData, setFormData] = useState({ id: null, name: '', unit: 'кг', quantity: '', minStock: '', pricePerUnit: '' });
    const [errors, setErrors] = useState({});
    const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
    const { profile, PLAN_RANK } = useInventoryStore();
    const userRole = profile?.subscription_plan || 'free';
    const userRank = PLAN_RANK[userRole] || 0;
    const isPro = userRank >= PLAN_RANK.pro;
    const canImport = userRank >= PLAN_RANK.starter;

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t.ingredients.errorName || 'Введите название материала';
        if (formData.quantity === '' || Number(formData.quantity) < 0) newErrors.quantity = t.ingredients.errorQuantity || 'Количество не может быть отрицательным';
        if (formData.minStock && Number(formData.minStock) < 0) newErrors.minStock = t.ingredients.errorMinStock || 'Мин. остаток не может быть отрицательным';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const openSlide = (ing = null) => {
        if (ing) {
            setFormData({
                ...ing,
                quantity: ing.quantity.toString(),
                minStock: ing.minStock ? ing.minStock.toString() : '',
                pricePerUnit: ing.pricePerUnit ? ing.pricePerUnit.toString() : '0'
            });
        } else {
            setFormData({ id: null, name: '', unit: 'кг', quantity: '0', minStock: '5', pricePerUnit: '0' });
        }
        setErrors({});
        setIsSlideOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const result = await addIngredient({
            ...formData,
            name: formData.name.trim(),
            quantity: Number(formData.quantity) || 0,
            minStock: Number(formData.minStock) || 0,
            pricePerUnit: Number(formData.pricePerUnit) || 0
        });

        if (result.success) {
            addToast(formData.id ? t.ingredients.updated || 'Материал обновлён' : t.ingredients.added || 'Материал добавлен', 'success');
            setIsSlideOpen(false);
        }
    };

    const handleInlineEdit = (id, value) => {
        updateIngredientQuantity(id, Number(value));
        setEditingQty(null);
        addToast(t.ingredients.stockUpdated || 'Остаток обновлён', 'success');
    };

    const handleDelete = (id) => {
        removeIngredient(id);
        addToast(t.ingredients.deleted || 'Материал удален', 'success');
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const rawData = await ImportService.parseFile(file);
            const detectedType = ImportService.detectFileType(rawData);

            // Warn if it explicitly looks like products
            setFileTypeMismatch(detectedType === 'products');

            const mapped = ImportService.mapToIngredients(rawData, t);
            if (mapped.length > 0) {
                setImportPreview(mapped);
            } else {
                addToast(t.common.noData || 'Нет данных для импорта', 'error');
            }
        } catch (err) {
            console.error('Import error:', err);
            addToast(t.ingredients.importError || 'Ошибка при импорте', 'error');
        }
        e.target.value = ''; // Reset input
    };

    const confirmImport = async () => {
        if (!importPreview) return;

        let added = 0;
        let updated = 0;
        let skipped = 0;

        for (const item of importPreview) {
            const res = await addIngredient({
                ...item,
                isSupplyMode: importMode === 'supply'
            });
            if (res.success) {
                if (res.updated) updated++;
                else added++;
            } else skipped++;
        }

        let msg = '';
        if (added > 0) msg += (t.ingredients.importAdded || 'Добавлено {count} новых').replace('{count}', added.toString()) + '. ';
        if (updated > 0) msg += (t.ingredients.importUpdated || 'Обновлено {count} существующих').replace('{count}', updated.toString()) + '. ';
        if (added === 0 && updated === 0) msg = t.common.noData || 'Нет данных для импорта';
        const extra = skipped > 0 ? ` (${skipped} ${t.common.skipped || 'пропущено'})` : '';

        addToast(msg + extra, (added > 0 || updated > 0) ? 'success' : 'info');
        setImportPreview(null);
    };

    const getStockStatus = (ing) => {
        if (ing.quantity === 0) return 'danger';
        if (ing.minStock && ing.quantity <= ing.minStock) return 'warning';
        return 'success';
    };

    const filtered = ingredients.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{t.ingredients.title}</h2>
                    <p className="text-[var(--text-secondary)] text-sm">{t.ingredients.desc || 'Управляйте остатками материалов и сырья.'}</p>
                    {canImport && (
                        <div className="hidden sm:flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-light)]">
                            <AlertCircle size={14} className="text-[var(--primary)]" />
                            <span>{t.ingredients.importFormat}</span>
                            <span className="mx-1">•</span>
                            <button
                                onClick={() => ExportService.downloadTemplate('materials', t)}
                                className="text-[var(--primary)] hover:underline font-medium"
                            >
                                {t.common.downloadTemplate}
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />
                    <div title={canImport ? t.common.import : t.upsell.starterOnly}>
                        <button
                            onClick={() => canImport ? setIsImportGuideOpen(true) : null}
                            className={`btn bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border)] transition-all p-2.5 sm:px-4 
                                ${!canImport ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--primary-light)] hover:border-[var(--primary)]'}`}
                        >
                            {canImport ? <Upload size={18} className="text-[var(--primary)]" /> : <Lock size={18} className="text-amber-500" />}
                            <span className="hidden sm:inline ml-1 font-bold">{t.common.import}</span>
                        </button>
                    </div>
                    <div title={canImport ? t.common.export : t.upsell.starterOnly}>
                        <button
                            onClick={() => canImport ? setIsExportModalOpen(true) : null}
                            className={`btn bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border)] transition-all p-2.5 sm:px-4 
                                ${!canImport ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--primary-light)] hover:border-[var(--primary)]'}`}
                        >
                            {canImport ? <Download size={18} className="text-[var(--primary)]" /> : <Lock size={18} className="text-amber-500" />}
                            <span className="hidden sm:inline ml-1 font-bold">{t.common.export}</span>
                        </button>
                    </div>
                    <button onClick={() => openSlide()} className="btn btn-primary flex-1 sm:flex-initial h-11 shrink-0 px-4 font-black">
                        <Plus size={20} /> <span className="whitespace-nowrap">{t.ingredients.addNew}</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm p-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" size={18} aria-hidden="true" />
                    <input
                        id="ingredient-search"
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent text-[var(--text-main)] placeholder-[var(--text-light)] focus:outline-none"
                        placeholder={t.ingredients.searchPlaceholder}
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        aria-label={t.ingredients.searchLabel || "Поиск материалов"}
                    />
                </div>
            </div>

            {/* Item Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map(ing => {
                    const status = getStockStatus(ing);
                    // Mapping legacy status to Tailwind colors
                    const statusColors = {
                        danger: 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10',
                        warning: 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10',
                        success: 'border-[var(--border)] bg-[var(--bg-card)]'
                    };
                    const borderColor = statusColors[status] || statusColors.success;

                    return (
                        <div key={ing.id} className={`group relative flex flex-col gap-4 border rounded-[var(--radius)] p-5 shadow-sm hover:shadow-md transition-all duration-200 ${borderColor}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <h3 className="text-lg font-bold text-[var(--text-main)] leading-tight truncate" title={ing.name}>{ing.name}</h3>
                                    <span className="text-[13px] font-mono text-[var(--text-light)]">
                                        {t.ingredients.minStock}: {ing.minStock || 0} {t.unitNames?.[ing.unit] || ing.unit}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                    <div className={`text-2xl font-extrabold font-mono leading-none ${status === 'danger' ? 'text-red-600' : 'text-[var(--text-main)]'}`}>
                                        {ing.quantity}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                                        {t.unitNames?.[ing.unit] || ing.unit}
                                    </div>
                                    {isPro && ing.pricePerUnit > 0 && (
                                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                            Σ {(ing.quantity * ing.pricePerUnit).toLocaleString()} {profile?.currency || 'грн'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-[var(--border)] mt-auto">
                                <button
                                    className="h-10 w-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-page)] border border-transparent hover:border-[var(--border)] rounded-lg transition-all"
                                    onClick={() => {
                                        if (ing.quantity > 0) {
                                            updateIngredientQuantity(ing.id, ing.quantity - 1);
                                            addToast(`−1 ${t.unitNames?.[ing.unit] || ing.unit}`, 'info');
                                        }
                                    }}
                                    disabled={ing.quantity <= 0}
                                    aria-label={`Уменьшить количество ${ing.name}`}
                                >
                                    <span className="text-xl font-medium" aria-hidden="true">−</span>
                                </button>
                                <button
                                    className="h-10 w-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-page)] border border-transparent hover:border-[var(--border)] rounded-lg transition-all"
                                    onClick={() => {
                                        updateIngredientQuantity(ing.id, ing.quantity + 1);
                                        addToast(`+1 ${t.unitNames?.[ing.unit] || ing.unit}`, 'info');
                                    }}
                                    aria-label={`Увеличить количество ${ing.name}`}
                                >
                                    <span className="text-xl font-medium" aria-hidden="true">+</span>
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    className="h-10 w-10 flex items-center justify-center text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-lg transition-all"
                                    onClick={() => openSlide(ing)}
                                    aria-label={`Редактировать ${ing.name}`}
                                >
                                    <Edit2 size={16} aria-hidden="true" />
                                </button>
                                <button
                                    className="h-10 w-10 flex items-center justify-center text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 rounded-lg transition-all"
                                    onClick={() => handleDelete(ing.id)}
                                    aria-label={`Удалить ${ing.name}`}
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] text-center py-16">
                    <Search size={48} className="mx-auto mb-4 text-[var(--text-light)] opacity-30" />
                    <p className="font-medium text-[var(--text-secondary)]">{t.ingredients.empty || 'Склад пуст'}</p>
                    <p className="text-sm text-[var(--text-light)] mt-1">{t.ingredients.emptyDesc || 'Добавьте материалы, из которых будете производить продукцию.'}</p>
                </div>
            )}

            {/* SlideOver Form */}
            <SlideOver
                isOpen={isSlideOpen}
                onClose={() => setIsSlideOpen(false)}
                title={formData.id ? t.ingredients.edit || 'Редактировать материал' : t.ingredients.addNew}
            >
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label htmlFor="ingredient-name" className="block text-sm font-medium mb-2 text-[var(--text-main)]">{t.ingredients.name}</label>
                        <input
                            id="ingredient-name"
                            className={`input ${errors.name ? 'input-error' : ''}`}
                            placeholder={t.ingredients.namePlaceholder || "Например: Материал А, Компонент Б..."}
                            value={formData.name}
                            onChange={e => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: null });
                            }}
                            required
                            onInvalid={e => e.target.setCustomValidity(t.ingredients.errorName)}
                            onInput={e => e.target.setCustomValidity('')}
                            autoFocus
                            aria-describedby={errors.name ? 'ingredient-name-error' : undefined}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <p id="ingredient-name-error" className="error-message mt-1" role="alert">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ingredient-unit" className="block text-sm font-medium mb-2 text-[var(--text-main)]">{t.ingredients.unit}</label>
                            <select
                                id="ingredient-unit"
                                className="input appearance-none bg-[var(--bg-card)]"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                {units.map(u => <option key={u} value={u}>{t.unitNames?.[u] || u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="ingredient-minstock" className="block text-sm font-medium mb-2 text-[var(--text-main)]">{t.ingredients.minStock}</label>
                            <input
                                type="number"
                                id="ingredient-minstock"
                                className={`input font-mono ${errors.minStock ? 'input-error' : ''}`}
                                value={formData.minStock}
                                onChange={e => {
                                    setFormData({ ...formData, minStock: e.target.value });
                                    if (errors.minStock) setErrors({ ...errors, minStock: null });
                                }}
                                aria-describedby={errors.minStock ? 'ingredient-minstock-error' : undefined}
                                aria-invalid={!!errors.minStock}
                            />
                            {errors.minStock && <p id="ingredient-minstock-error" className="error-message mt-1" role="alert">{errors.minStock}</p>}
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="ingredient-price" className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-100">
                                {t.ingredients.price || 'Цена за единицу'}
                                <div className="group/tooltip relative">
                                    <HelpCircle size={14} className="text-blue-400 cursor-help transition-colors hover:text-blue-600" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-20 text-center shadow-xl">
                                        {t.settings.currencyTooltip || 'Изменить валюту можно в настройках профиля (иконка карандаша в боковом меню)'}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            </label>
                            {!isPro && (
                                <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold uppercase tracking-wider">PRO</span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                id="ingredient-price"
                                disabled={!isPro}
                                className={`input font-mono pr-12 text-lg hide-spinners ${!isPro ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
                                value={formData.pricePerUnit}
                                onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                placeholder="0.00"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-sm pointer-events-none">
                                {profile?.currency || 'грн'}
                            </div>
                        </div>
                        {!isPro && (
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                {t.ingredients.proOnlyPrice || 'Доступно только в плане PRO для расчета себестоимости.'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="ingredient-quantity" className="block text-sm font-medium mb-2 text-[var(--text-main)]">{t.ingredients.quantity}</label>
                        <input
                            type="number"
                            id="ingredient-quantity"
                            className={`input font-mono ${errors.quantity ? 'input-error' : ''}`}
                            value={formData.quantity}
                            onChange={e => {
                                setFormData({ ...formData, quantity: e.target.value });
                                if (errors.quantity) setErrors({ ...errors, quantity: null });
                            }}
                            placeholder="0"
                            required
                            onInvalid={e => e.target.setCustomValidity(t.ingredients.errorQuantity)}
                            onInput={e => e.target.setCustomValidity('')}
                            aria-describedby={errors.quantity ? 'ingredient-quantity-error' : 'ingredient-quantity-hint'}
                            aria-invalid={!!errors.quantity}
                        />
                        {errors.quantity && <p id="ingredient-quantity-error" className="error-message mt-1" role="alert">{errors.quantity}</p>}
                        <p id="ingredient-quantity-hint" className="text-xs text-[var(--text-light)] mt-2">
                            {t.ingredients.quantityHint || 'Используйте для начального ввода или инвентаризации.'}
                        </p>
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
            {/* Import Preview Modal */}
            {importPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-main)]">{t.ingredients.importPreview}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{t.ingredients.importConfirm}</p>
                            </div>
                            <button onClick={() => setImportPreview(null)} className="p-2 hover:bg-[var(--bg-page)] rounded-lg text-[var(--text-secondary)]">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Import Mode Toggle */}
                        <div className="px-6 py-4 bg-[var(--bg-page)] border-b border-[var(--border)]">
                            {fileTypeMismatch && (
                                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 animate-pulse">
                                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{t.common.importMismatchWarning}</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300">{t.common.importMismatchProducts}</p>
                                    </div>
                                </div>
                            )}
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                                {t.common.importMode}
                            </label>
                            <div className="flex p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-fit">
                                <button
                                    onClick={() => setImportMode('inventory')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${importMode === 'inventory'
                                        ? 'bg-[var(--primary)] text-white shadow-md'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                                        }`}
                                >
                                    {t.common.inventoryMode}
                                </button>
                                <button
                                    onClick={() => setImportMode('supply')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${importMode === 'supply'
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)]'
                                        }`}
                                >
                                    {t.common.deliveryMode}
                                </button>
                            </div>
                            <p className="mt-2 text-[11px] text-[var(--text-light)]">
                                {importMode === 'inventory'
                                    ? 'Текущие остатки будут заменены значениями из файла.'
                                    : 'Значения из файла будут прибавлены к текущим остаткам.'}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-[var(--bg-page)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">{t.ingredients.code || 'Код'}</th>
                                        <th className="px-6 py-3">{t.ingredients.name}</th>
                                        <th className="px-6 py-3">{t.ingredients.quantity}</th>
                                        <th className="px-6 py-3">{t.ingredients.unit}</th>
                                        <th className="px-6 py-3">{t.ingredients.minStock}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {importPreview.map((item, idx) => {
                                        const isExisting = ingredients.find(i =>
                                            (item.external_code && i.external_code === item.external_code) ||
                                            (i.name.trim().toLowerCase() === item.name.trim().toLowerCase())
                                        );

                                        return (
                                            <tr key={idx} className={`hover:bg-[var(--bg-page)] ${isExisting ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                                                <td className="px-6 py-4 font-mono text-[11px] text-[var(--text-light)]">{item.external_code || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[var(--text-main)]">{item.name}</span>
                                                        {isExisting && (
                                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                                                                {t.common.update || 'Обновление'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold">{item.quantity}</td>
                                                <td className="px-6 py-4 text-[var(--text-secondary)]">{item.unit}</td>
                                                <td className="px-6 py-4 text-[var(--text-light)]">{item.minStock}</td>
                                            </tr>
                                        );
                                    })}
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

            {/* Export Format Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={(format) => ExportService.exportIngredients(ingredients, t, format)}
            />

            {/* Import Guide Modal */}
            <ImportGuideModal
                isOpen={isImportGuideOpen}
                onClose={() => setIsImportGuideOpen(false)}
                type="materials"
                t={t}
                onDownloadTemplate={() => ExportService.downloadTemplate('materials', t)}
                onProceed={() => {
                    setIsImportGuideOpen(false);
                    fileInputRef.current?.click();
                }}
            />
        </div>
    );
};

export default IngredientManager;
