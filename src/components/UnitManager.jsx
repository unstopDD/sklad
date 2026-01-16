import React, { useState } from 'react';
import { Plus, X, Scale } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const UnitManager = () => {
    const { units, addUnit, removeUnit, addToast } = useInventoryStore();
    const [newUnit, setNewUnit] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newUnit.trim()) {
            setError('Введите название');
            return;
        }

        if (units.includes(newUnit.trim())) {
            setError('Такая единица уже существует');
            return;
        }

        addUnit(newUnit.trim());
        addToast(`Единица "${newUnit.trim()}" добавлена`, 'success');
        setNewUnit('');
        setError('');
    };

    const handleRemove = (unit) => {
        removeUnit(unit);
        addToast(`Единица "${unit}" удалена`, 'success');
    };

    return (
        <div className="space-y-6">
            <p className="text-[var(--text-secondary)] text-sm">
                Настройте единицы, в которых будет измеряться сырьё и продукция.
            </p>

            {/* Add Form */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-w-lg shadow-sm">
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                    <Scale size={20} className="text-[var(--primary)]" />
                    Добавить новую единицу
                </h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-start" noValidate>
                    <div className="relative flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={newUnit}
                                onChange={(e) => {
                                    setNewUnit(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Например: шт, кг, литр..."
                                className={`input w-full ${error ? 'input-error' : ''}`}
                            />
                        </div>
                        {error && <p className="error-message mt-1">{error}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!newUnit.trim()}>
                        <Plus size={18} /> Добавить
                    </button>
                </form>
            </div>

            {/* Units Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-[var(--text-main)]">Доступные единицы ({units.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {units.map((unit) => (
                        <div
                            key={unit}
                            className="group flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
                        >
                            <span className="font-mono font-medium text-lg text-[var(--text-main)]">{unit}</span>
                            <button
                                onClick={() => handleRemove(unit)}
                                className="h-8 w-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title={`Удалить ${unit}`}
                                aria-label={`Удалить единицу измерения ${unit}`}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {units.length === 0 && (
                    <div className="text-center py-12 bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-[var(--radius)]">
                        <div className="flex flex-col items-center text-[var(--text-light)]">
                            <Scale size={48} className="mb-4 opacity-30" />
                            <p className="font-medium text-[var(--text-secondary)]">Список пуст</p>
                            <p className="text-sm">Добавьте первую единицу измерения</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitManager;
