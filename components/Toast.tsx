import React, { useEffect, useState } from 'react';
import type { ToastType } from '../types';
import { CheckCircleIcon, InfoIcon, XCircleIcon } from './icons';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon />,
  error: <XCircleIcon />,
  info: <InfoIcon />,
};

const colors: Record<ToastType, string> = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-sky-500 border-sky-600',
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsExiting(true);
        // The parent will remove the component from the DOM after the animation
    }, 4500); 

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    // Give time for the animation to play before calling onDismiss
    setTimeout(onDismiss, 500); 
  }

  return (
    <div
      className={`toast-anim ${isExiting ? 'toast-exit' : ''} flex items-center p-4 text-white rounded-lg shadow-lg border-b-4 ${colors[type]}`}
      role="alert"
    >
        <div className="text-xl mr-3">
            {icons[type]}
        </div>
        <p className="flex-1 font-medium">{message}</p>
        <button onClick={handleDismiss} className="ml-4 -mr-2 p-1 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
    </div>
  );
};

export default Toast;
