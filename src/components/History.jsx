import React from 'react';
import { Clock } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const History = () => {
    const { history } = useStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">История операций</h2>
                    <p className="text-gray-500 text-sm mt-1">Журнал всех действий в системе.</p>
                </div>
            </div>

            <div className="card border-none shadow-sm overflow-hidden p-0">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg)]">
                        <tr>
                            <th className="py-4 px-6">Дата и время</th>
                            <th className="py-4 px-6">Тип</th>
                            <th className="py-4 px-6">Описание</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(h => (
                            <tr key={h.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {new Date(h.date).toLocaleString('ru-RU')}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium 
                                    ${h.type === 'Производство' ? 'bg-indigo-100 text-indigo-700' :
                                            h.type === 'Создание' ? 'bg-green-100 text-green-700' :
                                                h.type === 'Удаление' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {h.type}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-gray-800 font-medium text-sm">
                                    {h.description}
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-12 text-gray-400">
                                    История пока пуста.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
