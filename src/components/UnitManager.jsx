import React, { useState } from 'react';
import { Plus, X, Ruler, Tag } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const UnitManager = () => {
    const { units, addUnit, removeUnit } = useStore();
    const [newUnit, setNewUnit] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newUnit.trim()) {
            addUnit(newUnit.trim());
            setNewUnit('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="m-0">Единицы измерения</h2>
                    <p className="text-gray text-sm mt-1">Настройте единицы, в которых будет измеряться сырьё и продукция.</p>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-4 text-lg font-medium">Добавить новую единицу</h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                            placeholder="Например: ящик, литр, метр..."
                            className="input pl-10"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!newUnit.trim()}>
                        <Plus size={18} />
                        Добавить
                    </button>
                </form>
            </div>

            <h3 className="text-lg font-medium mb-4 mt-8">Доступные единицы ({units.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {units.map((unit) => (
                    <div key={unit} className="card p-4 flex items-center justify-between group hover:border-blue-400 cursor-default">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                {unit.substring(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900">{unit}</span>
                        </div>
                        <button
                            onClick={() => removeUnit(unit)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Удалить"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {units.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white border border-dashed rounded-lg">
                    Список пуст. Добавьте первую единицу измерения.
                </div>
            )}
        </div>
    );
};

export default UnitManager;
