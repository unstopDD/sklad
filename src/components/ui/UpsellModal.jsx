import React from 'react';
import { Sparkles, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLang } from '../../i18n';

const UpsellModal = ({ isOpen, onClose, featureName, benefitTitle, benefitDesc }) => {
    const { t } = useLang();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-900 shadow-2xl rounded-[32px] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Visual Header */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/30">
                            <Sparkles size={32} className="text-white fill-white/20" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight uppercase px-8 text-center leading-tight">
                            {featureName}
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {benefitTitle}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {benefitDesc}
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t.upsell.saveEfficiency}
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t.upsell.accurateData}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="group w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            <span>{t.upsell.upgradeNow}</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {t.common.later}
                        </button>
                    </div>
                </div>

                <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-center italic">
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                        {t.upsell.businessTrust}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpsellModal;
