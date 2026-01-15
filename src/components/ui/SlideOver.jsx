import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SlideOver = ({ isOpen, onClose, title, children }) => {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="slide-over-backdrop" onClick={onClose}>
            <div
                className="slide-over-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="slide-over-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="slide-over-close">
                        <X size={24} />
                    </button>
                </div>
                <div className="slide-over-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SlideOver;
