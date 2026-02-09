import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'bx-check-circle';
            case 'error': return 'bx-error-circle';
            case 'info': return 'bx-info-circle';
            default: return 'bx-bell';
        }
    };

    return (
        <div className={`toast-container ${type}`}>
            <div className="toast-content">
                <i className={`bx ${getIcon()} toast-icon`}></i>
                <span className="toast-message">{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                <i className='bx bx-x'></i>
            </button>
            <div className="toast-progress"></div>
        </div>
    );
};

export default Toast;
