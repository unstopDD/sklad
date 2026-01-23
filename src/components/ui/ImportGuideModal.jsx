import React from 'react';
import { X, Download, Upload, Info, FileSpreadsheet } from 'lucide-react';

const ImportGuideModal = ({ isOpen, onClose, type, t, onDownloadTemplate, onProceed }) => {
    if (!isOpen) return null;

    const isMaterials = type === 'materials';

    const headers = isMaterials
        ? [t.ingredients.name, t.ingredients.quantity, t.ingredients.unit, t.ingredients.minStock]
        : [t.products.name, t.products.quantity, t.common.unitLabel || t.ingredients.unit, t.products.composition || 'Состав'];

    const sampleRow = isMaterials
        ? [t.ingredients.sampleName, '100', t.ingredients.sampleUnit, '10']
        : [t.products.sampleName, '50', t.products.sampleUnit, t.products.sampleRecipe];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-page)]/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <FileSpreadsheet size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-main)]">
                            {isMaterials ? t.ingredients.importTitle : t.products.importTitle}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-page)] rounded-full text-[var(--text-secondary)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="flex gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl">
                        <Info className="text-blue-500 shrink-0" size={20} />
                        <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {isMaterials ? t.common.importGuideMaterials : t.common.importGuideProducts}
                        </div>
                    </div>

                    {/* Table Example */}
                    <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-light)] ml-1">
                            {t.common.exampleFormat || 'Пример формата:'}
                        </span>
                        <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[var(--bg-page)] border-b border-[var(--border)]">
                                    <tr>
                                        {headers.map((h, i) => (
                                            <th key={i} className="px-3 py-2.5 font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-[var(--bg-card)] hover:bg-blue-50/20">
                                        {sampleRow.map((cell, i) => (
                                            <td key={i} className="px-3 py-3 text-[var(--text-main)] border-r border-[var(--border)] last:border-0 italic opacity-80">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onDownloadTemplate}
                        className="flex-1 btn bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-page)] h-11"
                    >
                        <Download size={18} />
                        {t.common.downloadTemplate}
                    </button>
                    <button
                        onClick={onProceed}
                        className="flex-1 btn btn-primary h-11 shadow-lg shadow-blue-500/20"
                    >
                        <Upload size={18} />
                        {t.common.selectFile || 'Выбрать файл'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportGuideModal;
