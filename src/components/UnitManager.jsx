import React, { useState } from 'react';
import { Plus, X, Scale } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const UnitManager = () => {
    const { units, addUnit, removeUnit, addToast } = useInventoryStore();
    const [newUnit, setNewUnit] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newUnit.trim()) {
            addUnit(newUnit.trim());
            addToast(`Единица "${newUnit.trim()}" добавлена`, 'success');
            setNewUnit('');
        }
    };

    const handleRemove = (unit) => {
        removeUnit(unit);
        addToast(`Единица "${unit}" удалена`, 'success');
    };

    return (
        <div className="max-w-4xl space-y-6">
            <p className="text-[var(--text-secondary)] text-sm">
                Настройте единицы, в которых будет измеряться сырьё и продукция.
            </p>

            {/* Add Form */}
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Добавить новую единицу</h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" size={18} />
                        <input
                            type="text"
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                            placeholder="Например: ящик, литр, метр..."
                            className="input pl-10"
                        />
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
                            className="card p-4 flex items-center justify-between group hover:border-[var(--primary)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                    {unit.substring(0, 2)}
                                </div>
                                <span className="font-medium">{unit}</span>
                            </div>
                            <button
                                onClick={() => handleRemove(unit)}
                                className="p-1.5 text-[var(--text-light)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all opacity-0 group-hover:opacity-100"
                                title="Удалить"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {units.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-light)] card border-dashed">
                        Список пуст. Добавьте первую единицу измерения.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitManager;
