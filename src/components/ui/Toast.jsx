import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
};

const Toast = () => {
    const toasts = useInventoryStore(state => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => {
                const Icon = icons[toast.type] || Info;
                return (
                    <div
                        key={toast.id}
                        className="toast"
                        style={{ borderLeftColor: colors[toast.type] || colors.info }}
                    >
                        <Icon size={20} style={{ color: colors[toast.type] }} />
                        <span>{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default Toast;
