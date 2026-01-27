import React from 'react';
import { X, FileSpreadsheet, FileText, Download, Lock } from 'lucide-react';
import { useLang } from '../../i18n';
import { useInventoryStore } from '../../store/inventoryStore';

const ExportModal = ({ isOpen, onClose, onExport }) => {
    const { t } = useLang();
    const { profile, PLAN_RANK } = useInventoryStore();
    const userRole = profile?.subscription_plan || 'free';
    const userRank = PLAN_RANK[userRole] || 0;

    if (!isOpen) return null;

    const formats = [
        {
            id: 'xlsx',
            label: 'Excel (.xlsx)',
            desc: userRank >= PLAN_RANK.starter ? t.common.recommendedPrint : t.upsell.starterOnly,
            icon: userRank >= PLAN_RANK.starter ? FileSpreadsheet : Lock,
            color: userRank >= PLAN_RANK.starter ? 'text-green-600' : 'text-amber-500',
            bgColor: userRank >= PLAN_RANK.starter ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
            locked: userRank < PLAN_RANK.starter
        },
        {
            id: 'csv',
            label: 'Table (.csv)',
            desc: userRank >= PLAN_RANK.starter ? (t.common.importGuideMaterials?.substring(0, 30) + '...') : t.upsell.starterOnly,
            icon: userRank >= PLAN_RANK.starter ? FileText : Lock,
            color: userRank >= PLAN_RANK.starter ? 'text-blue-500' : 'text-amber-500',
            bgColor: userRank >= PLAN_RANK.starter ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
            locked: userRank < PLAN_RANK.starter
        },
        {
            id: '1c',
            label: t.common.export1C + ' (.csv)',
            desc: userRank >= PLAN_RANK.pro ? t.common.exportIntegration : t.upsell.proOnly,
            icon: userRank >= PLAN_RANK.pro ? FileText : Lock,
            color: userRank >= PLAN_RANK.pro ? 'text-orange-600' : 'text-amber-500',
            bgColor: userRank >= PLAN_RANK.pro ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
            locked: userRank < PLAN_RANK.pro
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

                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    {formats.map((format) => (
                        <button
                            key={format.id}
                            onClick={() => {
                                if (format.locked) return;
                                onExport(format.id);
                                onClose();
                            }}
                            className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[var(--border)] transition-all group text-left
                                ${format.locked
                                    ? 'opacity-60 grayscale-[0.5] cursor-not-allowed bg-gray-50/50 dark:bg-gray-900/20 hover:border-gray-300'
                                    : 'hover:border-[var(--primary)] hover:bg-[var(--primary-light)]'
                                }`}
                        >
                            <div className={`p-2 sm:p-3 rounded-lg ${format.bgColor} ${!format.locked && 'group-hover:scale-110'} transition-transform`}>
                                <format.icon className={`${format.color} sm:w-6 sm:h-6`} size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="font-bold text-sm sm:text-base text-[var(--text-main)] truncate">{format.label}</div>
                                    {format.locked && <Lock size={12} className="text-amber-500" />}
                                </div>
                                <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] truncate font-medium">{format.desc}</div>
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
