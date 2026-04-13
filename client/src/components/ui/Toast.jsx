import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return { success: () => {}, error: () => {}, warning: () => {}, info: () => {}, toasts: [], removeToast: () => {} };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef(null);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    const { id, message, type } = queueRef.current.shift();
    
    setToasts(prev => [...prev, { id, message, type }]);

    timeoutRef.current = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setTimeout(processQueue, 300);
    }, 3500);
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (toasts.length >= 3) {
      queueRef.current.push({ id, message, type });
      if (!isProcessingRef.current) {
        setTimeout(processQueue, 100);
      }
    } else {
      if (isProcessingRef.current) {
        queueRef.current.push({ id, message, type });
      } else {
        queueRef.current.push({ id, message, type });
        processQueue();
      }
    }
    
    return id;
  }, [toasts.length, processQueue]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    queueRef.current = queueRef.current.filter(t => t.id !== id);
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  const getStyles = (type) => {
    const styles = {
      success: {
        bg: 'bg-white',
        border: 'border-l-4 border-l-emerald-500',
        icon: 'text-emerald-500',
        title: 'text-emerald-800',
        text: 'text-gray-600',
      },
      error: {
        bg: 'bg-white',
        border: 'border-l-4 border-l-red-500',
        icon: 'text-red-500',
        title: 'text-red-800',
        text: 'text-gray-600',
      },
      warning: {
        bg: 'bg-white',
        border: 'border-l-4 border-l-amber-500',
        icon: 'text-amber-500',
        title: 'text-amber-800',
        text: 'text-gray-600',
      },
      info: {
        bg: 'bg-white',
        border: 'border-l-4 border-l-blue-500',
        icon: 'text-blue-500',
        title: 'text-blue-800',
        text: 'text-gray-600',
      },
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    const icons = {
      success: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => {
        const styles = getStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.border} rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md border border-gray-200`}
            style={{
              animation: `slideIn 0.3s ease-out`,
            }}
          >
            <div className={styles.icon}>
              {getIcon(toast.type)}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${styles.title}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ToastProvider;
