
import React from 'react';
import { Star, AlertTriangle, CircleDot } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 1 = Hizo todo, 0.5 = Media estrella, 0 = Sin evaluar, -1 = ¡A mejorar!
  onRate: (rating: number) => void;
  compact?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, compact = false }) => {
  const options = [
    {
      value: 1,
      label: 'Todo hecho',
      shortLabel: '1★',
      tooltip: 'Puntuación máxima: Todo hecho (🌟 Enorme progreso)',
      icon: <Star className="h-4 w-4 fill-amber-400 text-amber-500" />,
      activeClass: 'bg-amber-100 border-amber-300 text-amber-800 ring-2 ring-amber-100/50',
      inactiveClass: 'bg-slate-50 hover:bg-amber-50/50 text-slate-500 border-slate-200 hover:border-amber-200',
    },
    {
      value: 0.5,
      label: 'Medio',
      shortLabel: '½★',
      tooltip: 'Media estrella: Buen intento o tareas parciales (🌗)',
      icon: (
        <span className="relative flex items-center justify-center w-4 h-4">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="absolute left-0 top-0 w-[50%] h-full overflow-hidden">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </span>
        </span>
      ),
      activeClass: 'bg-yellow-50 border-yellow-300 text-yellow-800 ring-2 ring-yellow-100/30',
      inactiveClass: 'bg-slate-50 hover:bg-yellow-50/30 text-slate-500 border-slate-200 hover:border-yellow-200',
    },
    {
      value: 0,
      label: 'Sin evaluar',
      shortLabel: '0★',
      tooltip: 'Limpiar puntuación / Sin valorar',
      icon: <CircleDot className="h-3.5 w-3.5 text-slate-300" />,
      activeClass: 'bg-slate-100 border-slate-300 text-slate-700 font-semibold',
      inactiveClass: 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-slate-200',
    },
    {
      value: -1,
      label: '¡A mejorar!',
      shortLabel: 'Ups',
      tooltip: '¡A mejorar! Un momento difícil, ¡pero mañana será otro día para intentarlo de nuevo!',
      icon: <AlertTriangle className="h-4 w-4 text-red-500 fill-red-100" />,
      activeClass: 'bg-red-100 border-red-300 text-red-900 ring-2 ring-red-100 font-bold',
      inactiveClass: 'bg-slate-50 hover:bg-red-50 text-red-600/80 border-slate-200 hover:border-red-200',
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1">
        {options.map((opt) => {
          const isActive = rating === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRate(opt.value)}
              className={`p-1.5 rounded-lg border transition-all text-xs flex items-center justify-center active:scale-90 cursor-pointer focus:outline-none ${
                isActive ? opt.activeClass : opt.inactiveClass
              }`}
              title={`${opt.label}: ${opt.tooltip}`}
            >
              <div className="shrink-0">{opt.icon}</div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
      {options.map((opt) => {
        const isActive = rating === opt.value;
        return (
          <button
            key={opt.value}
            id={`rate-button-${opt.value}`}
            type="button"
            onClick={() => onRate(opt.value)}
            className={`w-full sm:flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer outline-none ${
              isActive ? opt.activeClass : opt.inactiveClass
            }`}
            title={opt.tooltip}
          >
            <span className="shrink-0">{opt.icon}</span>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

