import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const SlideOver = ({ isOpen, onClose, title, children }) => {
    const panelRef = useRef(null);
    const closeButtonRef = useRef(null);
    const titleId = `slideover-title-${React.useId()}`;

    // Focus trap - keep focus inside modal
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (e.key === 'Tab' && panelRef.current) {
            const focusableElements = panelRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (isOpen) {
            // Focus first focusable element when opened
            const timer = setTimeout(() => {
                const firstInput = panelRef.current?.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                } else {
                    closeButtonRef.current?.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="slide-over-backdrop"
            onClick={onClose}
            aria-hidden="true"
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="slide-over-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="slide-over-header">
                    <h2 id={titleId}>{title}</h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="slide-over-close"
                        aria-label="Закрыть панель"
                    >
                        <X size={24} aria-hidden="true" />
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

