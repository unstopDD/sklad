import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { useLang } from '../../i18n';

/**
 * A dropdown component to select export format (Excel or CSV)
 */
const ExportDropdown = ({ onExport, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLang();
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (format) => {
        onExport(format);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex">
                <button
                    onClick={() => onExport('xlsx')}
                    className="btn bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border)] border-r-0 rounded-r-none hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all flex items-center gap-2"
                    title={title || t.common.export}
                >
                    <Download size={18} className="text-[var(--primary)]" />
                    <span className="font-bold hidden sm:inline">{t.common.export}</span>
                </button>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border)] rounded-l-none px-2 hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all"
                >
                    <ChevronDown size={16} className={`${isOpen ? 'rotate-180' : ''} transition-transform`} />
                </button>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => handleSelect('xlsx')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-main)] hover:bg-[var(--primary-light)] transition-colors text-left"
                    >
                        <FileSpreadsheet size={18} className="text-green-600" />
                        <div className="flex flex-col">
                            <span className="font-bold">Excel (.xlsx)</span>
                            <span className="text-[10px] text-[var(--text-secondary)]">Для таблиц и отчетов</span>
                        </div>
                    </button>
                    <button
                        onClick={() => handleSelect('csv')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-main)] hover:bg-[var(--primary-light)] transition-colors text-left border-t border-[var(--border)]"
                    >
                        <FileText size={18} className="text-blue-500" />
                        <div className="flex flex-col">
                            <span className="font-bold">Table (.csv)</span>
                            <span className="text-[10px] text-[var(--text-secondary)]">Для обмена данными</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;
