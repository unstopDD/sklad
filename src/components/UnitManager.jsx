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
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Добавить новую единицу</h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-start" noValidate>
                    <div className="relative flex-1 max-w-sm">
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" size={18} />
                            <input
                                type="text"
                                value={newUnit}
                                onChange={(e) => {
                                    setNewUnit(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Например: шт, кг, литр..."
                                className={`input pl-10 ${error ? 'input-error' : ''}`}
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!newUnit.trim()}>
                        <Plus size={18} /> Добавить
                    </button>
                </form>
            </div>

            {/* Units Grid */}
            <div>
                <h3 className="text-lg font-medium mb-4">Доступные единицы ({units.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {units.map((unit) => (
                        <div
                            key={unit}
                            className="card p-4 flex items-center justify-between group hover:border-[var(--primary)] transition-colors"
                        >
                            <span className="font-medium text-lg">{unit}</span>
                            <button
                                onClick={() => handleRemove(unit)}
                                className="btn-icon danger opacity-0 group-hover:opacity-100"
                                title="Удалить"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {units.length === 0 && (
                    <div className="text-center py-12 card border-dashed">
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
