import React from 'react';
import { Clock, Factory, Trash2, FileText } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useLang } from '../../i18n';

const History = () => {
    const { history, clearHistory } = useInventoryStore();
    const { t, currentLang } = useLang();

    const getTranslatedType = (type) => {
        switch (type) {
            case 'Производство':
            case 'Production':
            case 'Виробництво':
                return t.history.typeProduction;
            case 'Удаление':
            case 'Deletion':
            case 'Видалення':
                return t.history.typeDeletion;
            case 'Обновление':
            case 'Update':
            case 'Оновлення':
                return t.history.typeUpdate;
            default:
                return t.history.typeOther;
        }
    };

    const getTypeIcon = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('производство') || lowerType.includes('production') || lowerType.includes('виробництво')) {
            return <Factory size={16} className="text-green-500" />;
        }
        if (lowerType.includes('удаление') || lowerType.includes('deletion') || lowerType.includes('видалення')) {
            return <Trash2 size={16} className="text-red-500" />;
        }
        return <FileText size={16} className="text-blue-500" />;
    };

    const getTypeBadge = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('производство') || lowerType.includes('production') || lowerType.includes('виробництво')) {
            return 'badge-success';
        }
        if (lowerType.includes('удаление') || lowerType.includes('deletion') || lowerType.includes('видалення')) {
            return 'badge-danger';
        }
        if (lowerType.includes('обновление') || lowerType.includes('update') || lowerType.includes('оновлення')) {
            return 'badge-warning';
        }
        return 'badge-success';
    };

    const formatDate = (date) => {
        const langMap = {
            uk: 'uk-UA',
            ru: 'ru-RU',
            en: 'en-US'
        };
        return new Date(date).toLocaleString(langMap[currentLang] || 'ru-RU');
    };

    return (
        <div className="">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[var(--text-secondary)] text-sm">
                    {t.history.desc}
                </p>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="btn btn-secondary text-sm">
                        <Trash2 size={16} /> {t.history.clear}
                    </button>
                )}
            </div>

            <div className="card p-0">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t.history.date}</th>
                                <th>{t.history.type}</th>
                                <th>{t.history.details || t.history.action}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id}>
                                    <td className="font-mono text-sm">
                                        {formatDate(h.date)}
                                    </td>
                                    <td>
                                        <span className={`badge ${getTypeBadge(h.type)}`}>
                                            {getTypeIcon(h.type)}
                                            {getTranslatedType(h.type)}
                                        </span>
                                    </td>
                                    <td>
                                        {(() => {
                                            let desc = h.description;
                                            const prefixes = {
                                                'Добавлен:': t.history.addLabel,
                                                'Удален:': t.history.deleteLabel,
                                                'Обновлен:': t.history.updateLabel,
                                                'Произведено:': t.history.produceLabel,
                                                'Списано:': t.history.writeoffLabel,
                                            };
                                            Object.entries(prefixes).forEach(([ru, translation]) => {
                                                if (desc.startsWith(ru)) desc = desc.replace(ru, translation);
                                            });
                                            return Object.entries(t.unitNames || {}).reduce((acc, [ru, translation]) => {
                                                if (ru === translation) return acc;
                                                const regex = new RegExp(`\\b${ru}\\b`, 'g');
                                                return acc.replace(regex, translation);
                                            }, desc);
                                        })()}
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center">
                                        <div className="flex flex-col items-center text-[var(--text-light)]">
                                            <Clock size={48} className="mb-4 opacity-30" />
                                            <p className="font-medium text-[var(--text-secondary)]">{t.history.empty}</p>
                                            <p className="text-sm">{t.history.emptyDesc}</p>
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
