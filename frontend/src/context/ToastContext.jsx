import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-md">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
