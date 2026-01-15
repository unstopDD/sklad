import React from 'react';
import { Clock, Factory, Trash2, FileText } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const History = () => {
    const { history, clearHistory } = useInventoryStore();

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Производство': return <Factory size={16} className="text-green-500" />;
            case 'Удаление': return <Trash2 size={16} className="text-red-500" />;
            default: return <FileText size={16} className="text-blue-500" />;
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'Производство': return 'badge-success';
            case 'Удаление': return 'badge-danger';
            case 'Обновление': return 'badge-warning';
            default: return 'badge-success';
        }
    };

    return (
        <div className="">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[var(--text-secondary)] text-sm">
                    Журнал всех операций в системе.
                </p>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="btn btn-secondary text-sm">
                        <Trash2 size={16} /> Очистить
                    </button>
                )}
            </div>

            <div className="card p-0">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Тип</th>
                                <th>Описание</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id}>
                                    <td className="font-mono text-sm">
                                        {new Date(h.date).toLocaleString('ru-RU')}
                                    </td>
                                    <td>
                                        <span className={`badge ${getTypeBadge(h.type)}`}>
                                            {getTypeIcon(h.type)}
                                            {h.type}
                                        </span>
                                    </td>
                                    <td>{h.description}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center">
                                        <div className="flex flex-col items-center text-[var(--text-light)]">
                                            <Clock size={48} className="mb-4 opacity-30" />
                                            <p className="font-medium text-[var(--text-secondary)]">История пуста</p>
                                            <p className="text-sm">Здесь будут отображаться все операции.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;
