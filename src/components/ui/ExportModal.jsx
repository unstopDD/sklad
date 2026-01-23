import React from 'react';
import { X, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useLang } from '../../i18n';

const ExportModal = ({ isOpen, onClose, onExport }) => {
    const { t } = useLang();

    if (!isOpen) return null;

    const formats = [
        {
            id: 'xlsx',
            label: 'Excel (.xlsx)',
            desc: 'Рекомендовано для таблиц и печати',
            icon: FileSpreadsheet,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            id: 'csv',
            label: 'Table (.csv)',
            desc: 'Для обмена данными и другими системами',
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-page)]/50">
                    <div className="flex items-center gap-2">
                        <Download size={18} className="text-[var(--primary)]" />
                        <h3 className="font-bold text-[var(--text-main)]">{t.common.export}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[var(--bg-page)] rounded-full text-[var(--text-secondary)] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {formats.map((format) => (
                        <button
                            key={format.id}
                            onClick={() => {
                                onExport(format.id);
                                onClose();
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group text-left"
                        >
                            <div className={`p-3 rounded-lg ${format.bgColor} group-hover:scale-110 transition-transform`}>
                                <format.icon className={format.color} size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-[var(--text-main)]">{format.label}</div>
                                <div className="text-xs text-[var(--text-secondary)]">{format.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-[var(--bg-page)]/30 text-center">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                    >
                        {t.common.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
