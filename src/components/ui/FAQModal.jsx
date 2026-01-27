import React from 'react';
import { X, HelpCircle, Box, Zap, CreditCard, Wrench, Globe } from 'lucide-react';
import { useLang } from '../../i18n';

const FAQModal = ({ isOpen, onClose }) => {
    const { t } = useLang();

    if (!isOpen) return null;

    const currentFaq = [
        {
            category: t.faq.categories.start,
            icon: Box,
            questions: [
                { q: t.faq.questions.howToStart, a: t.faq.questions.howToStartA },
                { q: t.faq.questions.howProductionWorks, a: t.faq.questions.howProductionWorksA }
            ]
        },
        {
            category: t.faq.categories.plans,
            icon: CreditCard,
            questions: [
                { q: t.faq.questions.freeLimits, a: t.faq.questions.freeLimitsA },
                { q: t.faq.questions.export1C, a: t.faq.questions.export1CA }
            ]
        },
        {
            category: t.faq.categories.warehouse,
            icon: Wrench,
            questions: [
                { q: t.faq.questions.minStock, a: t.faq.questions.minStockA },
                { q: t.faq.questions.writeOff, a: t.faq.questions.writeOffA }
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <HelpCircle size={24} />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                            {t.common.faq || 'Помощь / FAQ'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    {currentFaq.map((group, idx) => (
                        <section key={idx} className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                <group.icon size={16} />
                                {group.category}
                            </div>
                            <div className="grid gap-3">
                                {group.questions.map((item, qIdx) => (
                                    <div key={qIdx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 transition-all bg-gray-50/30 dark:bg-gray-900/10">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex gap-2">
                                            <span className="text-blue-500">Q:</span> {item.q}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex gap-2">
                                            <span className="text-emerald-500 font-bold">A:</span> {item.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-center">
                    <button
                        onClick={onClose}
                        className="btn btn-primary px-8 font-bold shadow-lg shadow-blue-500/20"
                    >
                        {t.common.understand || 'Понятно'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQModal;
