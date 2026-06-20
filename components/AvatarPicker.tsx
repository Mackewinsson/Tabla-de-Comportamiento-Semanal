import React from 'react';
import { AVATAR_CATEGORIES } from '../constants';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
  currentAvatar: string;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ isOpen, onClose, onSelect, currentAvatar }) => {
  if (!isOpen) return null;

  const handleSelect = (avatar: string) => {
    onSelect(avatar);
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full transform transition-all duration-300" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-sky-700">Elige un avatar</h3>
            <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Cerrar selector de avatar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
          {Object.entries(AVATAR_CATEGORIES).map(([category, avatars]) => (
            <div key={category} className="mb-4">
              <h4 className="text-md sm:text-lg font-semibold text-slate-600 mb-2">{category}</h4>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
                {avatars.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => handleSelect(avatar)}
                    className={`text-3xl sm:text-4xl rounded-xl p-1 sm:p-2.5 transition-all duration-200 aspect-square flex items-center justify-center ${
                      avatar === currentAvatar 
                        ? 'bg-sky-200 ring-2 ring-sky-500 scale-110' 
                        : 'bg-slate-100 hover:bg-sky-100 hover:scale-110 active:scale-95'
                    }`}
                    aria-label={`Seleccionar avatar ${avatar}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
