import React from 'react';
import { SparklesIcon } from './icons';

interface FeedbackModalProps {
  feedback: string;
  childName: string;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedback, childName, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 sm:p-6" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 max-w-lg w-full relative transform animate-fade-in max-h-[85vh] overflow-y-auto flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center mb-4 pr-8">
                    <div className="flex-shrink-0">
                        <SparklesIcon />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-sky-600 ml-2.5 truncate">
                        Feedback para {childName}
                    </h3>
                </div>
                <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    <p className="text-slate-600 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                        {feedback}
                    </p>
                </div>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 active:scale-90 transition-all p-2 rounded-lg hover:bg-slate-100"
                    aria-label="Cerrar feedback"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FeedbackModal;
