import React, { useState, useCallback } from 'react';
import type { Child, Task } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { getBehaviorFeedback } from '../services/geminiService';
import StarRating from './StarRating';
import AvatarPicker from './AvatarPicker';
import { BrainCircuitIcon, HistoryIcon, TrashIcon, SparklesIcon } from './icons';
import FeedbackModal from './FeedbackModal';
import { useToast } from '../contexts/ToastContext';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  Star, 
  Smile, 
  UserCheck, 
  Trophy, 
  Clock, 
  Award,
  BookOpen,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';

interface ChildCardProps {
  child: Child;
  onUpdateScore: (childId: string, dayIndex: number, score: number) => void;
  onRemoveChild: (childId: string) => void;
  onUpdateAvatar: (childId: string, avatar: string) => void;
  onAddFeedback: (childId: string, feedbackText: string) => void;
  onAddTask: (childId: string, title: string, points: number, days: number[]) => void;
  onDeleteTask: (childId: string, taskId: string) => void;
  onToggleTask: (childId: string, taskId: string, dayIndex: number) => void;
  onUpdatePointsGoal: (childId: string, goal: number) => void;
}

const SUGGESTED_TASKS = [
  "Cepillarse los dientes 🪥",
  "Hacer la cama 🛌",
  "Ordenar mi cuarto 🧸",
  "Hacer los deberes 📚",
  "Poner la mesa 🍽️",
  "Comer fruta o verdura 🥦",
  "Ducharse / Bañarse 🧼"
];

const playCompletionSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    const now = audioCtx.currentTime;
    playNote(523.25, now, 0.12); // C5
    playNote(659.25, now + 0.08, 0.2); // E5
  } catch (error) {
    console.log("AudioContext blocked or uninitialized yet", error);
  }
};

const ChildCard: React.FC<ChildCardProps> = ({ 
  child, 
  onUpdateScore, 
  onRemoveChild, 
  onUpdateAvatar, 
  onAddFeedback,
  onAddTask,
  onDeleteTask,
  onToggleTask,
  onUpdatePointsGoal
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
    const [activeMode, setActiveMode] = useState<'kids' | 'summary' | 'parents'>('kids');
    const [activeCalendarDay, setActiveCalendarDay] = useState<number>(() => {
      const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
      return currentDayIndex === 0 ? 6 : currentDayIndex - 1; // convert to 0-Monday, 6-Sunday
    });

    // Parent task form states
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDays, setNewTaskDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // All days selected by default
    const [newTaskPoints, setNewTaskPoints] = useState<number>(2);

    const { addToast } = useToast();

    // Stats calculations
    const totalBehaviorStars = child.scores.reduce((sum, score) => sum + score, 0);
    
    const totalTaskPoints = (child.tasks || []).reduce((sum, task) => {
      let taskSum = 0;
      Object.keys(task.completed).forEach(dayKey => {
        const dIdx = Number(dayKey);
        if (task.completed[dIdx] && task.days.includes(dIdx)) {
          taskSum += task.points;
        }
      });
      return sum + taskSum;
    }, 0);

    const grandTotalPoints = Math.max(0, totalBehaviorStars * 10 + totalTaskPoints);
    const currentGoal = child.pointsGoal || 50;
    const progressPercent = Math.min(100, Math.round((grandTotalPoints / currentGoal) * 100));
    const isGoalReached = grandTotalPoints >= currentGoal;

    const handleGetFeedback = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getBehaviorFeedback(child.name, child.scores, child.tasks);
            onAddFeedback(child.id, result);
            setFeedback(result);
            addToast(`Feedback generado con IA para ${child.name}.`, 'success');
        } catch (err) {
            addToast('No se pudo obtener el feedback de la IA.', 'error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [child.name, child.scores, child.tasks, child.id, onAddFeedback, addToast]);

    const handleParentSubmitTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim()) {
        addToast('Escribe una descripción para la tarea.', 'error');
        return;
      }
      if (newTaskDays.length === 0) {
        addToast('Selecciona al menos un día.', 'error');
        return;
      }
      onAddTask(child.id, newTaskTitle.trim(), newTaskPoints, newTaskDays);
      setNewTaskTitle('');
      setNewTaskDays([0, 1, 2, 3, 4, 5, 6]);
      setNewTaskPoints(2);
    };

    const handleToggleFormDay = (dayIndex: number) => {
      setNewTaskDays(prev => 
        prev.includes(dayIndex) 
          ? prev.filter(d => d !== dayIndex) 
          : [...prev, dayIndex]
      );
    };

    const handleSelectAllDays = () => {
      setNewTaskDays([0, 1, 2, 3, 4, 5, 6]);
    };

    const handleSelectWeekdays = () => {
      setNewTaskDays([0, 1, 2, 3, 4]);
    };

    const handleSelectWeekend = () => {
      setNewTaskDays([5, 6]);
    };

    const handleToggleChildTaskCompleted = (taskId: string, dayIndex: number, isCurrentlyCompleted: boolean) => {
      if (!isCurrentlyCompleted) {
        playCompletionSound();
      }
      onToggleTask(child.id, taskId, dayIndex);
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate details for focused day
    const tasksForActiveDay = (child.tasks || []).filter(task => task.days.includes(activeCalendarDay));
    const completedTasksForActiveDay = tasksForActiveDay.filter(task => task.completed[activeCalendarDay]);
    
    const dailyTaskPointsEarned = completedTasksForActiveDay.reduce((sum, task) => sum + task.points, 0);
    const dailyBehaviorStarsGiven = child.scores[activeCalendarDay];
    const totalDailyPoints = Math.max(0, dailyTaskPointsEarned + (dailyBehaviorStarsGiven * 10));

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-sky-100 transition-shadow hover:shadow-xl child-card-enter">
            {feedback && <FeedbackModal feedback={feedback} childName={child.name} onClose={() => setFeedback(null)} />}
            <AvatarPicker 
                isOpen={isAvatarPickerOpen}
                onClose={() => setIsAvatarPickerOpen(false)}
                onSelect={(avatar) => onUpdateAvatar(child.id, avatar)}
                currentAvatar={child.avatar}
            />
            <div className="p-4 sm:p-6">
                {/* Header Profile details */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <button 
                            onClick={() => setIsAvatarPickerOpen(true)}
                            className="text-4xl sm:text-5xl rounded-xl p-1.5 bg-slate-50 border border-slate-100 shadow-sm transition-all hover:bg-slate-100 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shrink-0"
                            aria-label={`Cambiar avatar para ${child.name}`}
                        >
                            {child.avatar}
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-3xl font-bold text-slate-800 truncate" title={child.name}>
                                {child.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                    <Trophy className="h-3 w-3" />
                                    {grandTotalPoints} puntos totales
                                </span>
                                <span className="text-xs text-slate-400">
                                    (⭐ {totalBehaviorStars}★ conducta + 🏆 {totalTaskPoints} pts tareas)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto self-stretch md:self-auto justify-between shrink-0">
                        {/* Interactive Mode Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-[340px] md:w-auto select-none font-medium overflow-x-auto">
                            <button
                                onClick={() => setActiveMode('kids')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                                  activeMode === 'kids' 
                                    ? 'bg-white shadow-sm text-sky-600 font-bold scale-100' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Smile className="h-4 w-4 shrink-0" />
                                <span>Niño 📅</span>
                            </button>
                            <button
                                onClick={() => setActiveMode('summary')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                                  activeMode === 'summary' 
                                    ? 'bg-white shadow-sm text-amber-600 font-bold scale-100' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <CalendarDays className="h-4 w-4 shrink-0" />
                                <span>Resumen 📊</span>
                            </button>
                            <button
                                onClick={() => setActiveMode('parents')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all ${
                                  activeMode === 'parents' 
                                    ? 'bg-white shadow-sm text-indigo-600 font-bold' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <UserCheck className="h-4 w-4 shrink-0" />
                                <span>Padres 👑</span>
                            </button>
                        </div>

                        {/* Delete child button */}
                        <button 
                            onClick={() => onRemoveChild(child.id)} 
                            className="text-slate-400 hover:text-red-500 active:scale-90 active:bg-red-50 rounded-full transition-all p-2 focus:outline-none focus:ring-1 focus:ring-red-400" 
                            aria-label={`Eliminar a ${child.name}`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>

                {/* MODE 1: KIDS VIEW (Interactive Day Calendar) */}
                {activeMode === 'kids' && (
                  <div className="mt-5 space-y-5">
                    {/* Camino al Dulce Semanal Tracker */}
                    <div className="bg-gradient-to-r from-pink-500/5 via-amber-500/5 to-purple-500/5 border border-pink-100 p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-xs">
                      {/* Ambient background sparkles */}
                      <div className="absolute top-0 right-0 p-2 opacity-10 text-3xl select-none pointer-events-none">
                        🍬🍭✨
                      </div>
                      
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl animate-bounce shrink-0" style={{ animationDuration: '2.5s' }}>🍭</span>
                          <div>
                            <h3 className="font-bold text-slate-850 text-lg sm:text-2xl leading-tight">
                              Camino al Dulce Semanal de {child.name}
                            </h3>
                            <p className="text-sm sm:text-base text-slate-400 font-medium leading-tight">
                              ¡Consigue puntos con buena conducta (+10 pts por día) y haciendo tareas!
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Progreso</p>
                          <p className="text-xl sm:text-3xl font-black text-pink-600">
                            {grandTotalPoints} <span className="text-slate-400 text-sm sm:text-lg font-normal">/ {currentGoal} pts</span>
                          </p>
                        </div>
                      </div>

                      {/* Progress bar line with custom sliding candy */}
                      <div className="relative mt-5 mb-5">
                        {/* Background track */}
                        <div className="h-8 sm:h-12 bg-slate-100 rounded-full w-full overflow-hidden border-2 border-slate-200 relative">
                          {/* Colored filled progress */}
                          <div 
                            className="h-full bg-gradient-to-r from-pink-400 via-amber-400 to-purple-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Sliding candy icon */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out select-none pointer-events-none flex items-center justify-center"
                          style={{ 
                            left: `calc(${progressPercent}% - 20px)`,
                            filter: isGoalReached ? 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.7))' : 'none'
                          }}
                        >
                          <span className={`text-4xl sm:text-5xl block transition-transform`} title="¡Tu dulce!">
                            🍬
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-base sm:text-lg mt-2 font-bold">
                        <span className="text-pink-500">{progressPercent}% completado</span>
                        <span className="text-slate-400">Premio: ¡Un dulce especial! 🍬</span>
                      </div>

                      {/* Celebration panel when reached */}
                      {isGoalReached ? (
                        <div className="mt-4 bg-pink-100/90 border border-pink-200 p-3 rounded-xl flex items-center gap-3 animate-pulse shadow-xs">
                          <span className="text-3xl animate-bounce animate-duration-1000">🎉</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-pink-700 text-lg sm:text-xl">
                              ¡SÚPER FELICIDADES! 🎉 ¡META ALCANZADA!
                            </p>
                            <p className="text-sm sm:text-base text-pink-600 font-semibold mt-0.5 leading-snug">
                              ¡Has ganado tu dulce semanal! ¡Buen trabajo! 🍬🍭🍩💖
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between text-base sm:text-lg text-slate-500 font-semibold gap-2 text-center sm:text-left">
                          <span>🎯 Faltan <strong className="text-indigo-600 font-black text-lg sm:text-xl">{currentGoal - grandTotalPoints} puntos</strong> para abrir tu premio.</span>
                          <span className="text-lg">¡Sigue adelante! 💪</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border border-sky-100/40 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-sky-800 font-bold text-sm sm:text-base mb-3">
                        <CalendarDays className="h-5 w-5 text-sky-600" />
                        <span>Calendario Semanal — ¡Toca un día para ver tus tareas!</span>
                      </div>
                      
                      {/* Interactive Calendar Row */}
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {DAYS_OF_WEEK.map((day, index) => {
                          const isSelected = activeCalendarDay === index;
                          const behaviorStars = child.scores[index];
                          const dayTasks = (child.tasks || []).filter(t => t.days.includes(index));
                          const completedDayTasks = dayTasks.filter(t => t.completed[index]);
                          const isPerfectDay = dayTasks.length > 0 && dayTasks.length === completedDayTasks.length;

                          return (
                            <button
                              key={day}
                              onClick={() => setActiveCalendarDay(index)}
                              className={`p-2 sm:p-3 rounded-xl transition-all flex flex-col justify-between items-center border outline-none active:scale-95 ${
                                isSelected 
                                  ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white border-sky-600 shadow-md ring-2 ring-sky-200' 
                                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-100'
                              }`}
                            >
                              <span className="text-sm sm:text-lg font-bold block mb-1">
                                {day.substring(0, 3)}
                              </span>
                              
                              {/* Small task progress indicator */}
                              <div className="my-1.5 flex flex-col items-center">
                                {dayTasks.length > 0 ? (
                                  isPerfectDay ? (
                                    <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-md ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-green-100 text-green-700'} font-black`}>
                                      ✓
                                    </span>
                                  ) : (
                                    <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                      {completedDayTasks.length}/{dayTasks.length}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-xs sm:text-sm text-slate-300">—</span>
                                )}
                              </div>

                              {/* Daily Conduct stars */}
                              <div className="text-xs sm:text-base font-bold flex items-center justify-center min-h-[24px]">
                                {behaviorStars === 1 && (
                                  <span className={isSelected ? 'text-amber-300' : 'text-amber-500'} title="Todo hecho (1★)">🌟</span>
                                )}
                                {behaviorStars === 0.5 && (
                                  <span className={isSelected ? 'text-yellow-250' : 'text-amber-500 font-bold'} title="Media estrella (½★)">🌗</span>
                                )}
                                {behaviorStars === -1 && (
                                  <span className="text-red-500 font-extrabold" title="¡A mejorar! (⚠️)">⚠️</span>
                                )}
                                {(behaviorStars === 0 || behaviorStars === undefined) && (
                                  <span className="text-slate-350 font-normal">—</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active selected Day details */}
                    <div className="bg-slate-50/50 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-700 flex items-center gap-1.5">
                          <span>Día Elegido:</span>
                          <span className="text-sky-600 underline decoration-sky-300 decoration-wavy pl-1">
                            {DAYS_OF_WEEK[activeCalendarDay]}
                          </span>
                        </h3>
                        
                        {/* Daily conductive stars */}
                        <div className="flex items-center gap-1.5 bg-slate-100/60 border border-slate-200/50 px-3 py-1.5 rounded-xl text-xs sm:text-sm">
                          <span className="font-bold text-slate-600">Conducta:</span>
                          <div className="flex items-center shrink-0">
                            {dailyBehaviorStarsGiven === 1 && (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-500 shrink-0" />
                                <span>¡Excelente! Todo hecho (🌟)</span>
                              </span>
                            )}
                            {dailyBehaviorStarsGiven === 0.5 && (
                              <span className="inline-flex items-center gap-1 font-bold text-yellow-600">
                                <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                                  <Star className="h-4 w-4 text-amber-400" />
                                  <span className="absolute left-0 top-0 w-[50%] h-full overflow-hidden">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                                  </span>
                                </span>
                                <span>Media estrella (🌗)</span>
                              </span>
                            )}
                            {dailyBehaviorStarsGiven === -1 && (
                              <span className="inline-flex items-center gap-1 font-black text-red-600">
                                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 fill-red-150" />
                                <span>¡A mejorar! (-10 pts ⚠️)</span>
                              </span>
                            )}
                            {(dailyBehaviorStarsGiven === 0 || dailyBehaviorStarsGiven === undefined) && (
                              <span className="text-slate-400 italic text-xs font-normal">Sin evaluar hoy</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tareas del día */}
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold text-slate-600 mb-4 flex items-center gap-2">
                          <Clock className="h-6 w-6 text-sky-500" />
                          <span>Mis Tareas Clave (Toca para marcar como hecha):</span>
                        </h4>

                        {tasksForActiveDay.length === 0 ? (
                          <div className="text-center py-8 bg-white border border-slate-100 rounded-xl">
                            <p className="text-slate-500 text-base sm:text-lg">🎉 ¡No hay tareas asignadas para este día! ¡Disfruta!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tasksForActiveDay.map((task) => {
                              const isCompletedOnActiveDay = !!task.completed[activeCalendarDay];

                              return (
                                <button
                                  key={task.id}
                                  onClick={() => handleToggleChildTaskCompleted(task.id, activeCalendarDay, isCompletedOnActiveDay)}
                                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 transform active:scale-99 outline-none focus:ring-4 focus:ring-sky-100 ${
                                    isCompletedOnActiveDay
                                      ? 'bg-green-50/90 border-green-300 text-green-800 shadow-sm'
                                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full border-2 transition-all shrink-0 ${
                                      isCompletedOnActiveDay 
                                        ? 'bg-green-500 border-green-600 text-white animate-bounce' 
                                        : 'bg-slate-50 border-slate-300 text-slate-300'
                                    }`}>
                                      <Check className="h-6 w-6 stroke-[3]" />
                                    </div>
                                    <span className={`font-bold text-lg sm:text-2xl ${isCompletedOnActiveDay ? 'line-through text-green-600/70' : ''}`}>
                                      {task.title}
                                    </span>
                                  </div>
                                  <span className={`text-sm sm:text-lg font-black px-4 py-2 rounded-full whitespace-nowrap shrink-0 border-2 ${
                                    isCompletedOnActiveDay
                                      ? 'bg-green-100 border-green-200 text-green-700'
                                      : 'bg-sky-50 border-sky-100 text-sky-700'
                                  }`}>
                                    {isCompletedOnActiveDay ? '¡Ganado!' : ''} +{task.points} pts
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Daily point achievements summary */}
                      <div className="bg-gradient-to-r from-sky-450 to-indigo-500 text-sky-900 border border-sky-100 bg-sky-50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg text-sky-600 scale-105 shadow-xs">
                            <Award className="h-6 w-6" />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-xs uppercase tracking-wider text-sky-600 font-bold">Puntos conseguidos hoy</p>
                            <p className="text-xl sm:text-2xl font-black text-sky-850 mt-0.5">
                              {totalDailyPoints} puntos <span className="text-sm font-medium">({dailyBehaviorStarsGiven * 10} pts conducta + {dailyTaskPointsEarned} pts tareas)</span>
                            </p>
                          </div>
                        </div>

                        {tasksForActiveDay.length > 0 && tasksForActiveDay.length === completedTasksForActiveDay.length && (
                          <div className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 animate-pulse">
                            <SparklesIcon />
                            <span>🔥 ¡Día Perfecto Completo! 🎉</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 3: SUMMARY VIEW (Condensed Calendar) */}
                {activeMode === 'summary' && (
                  <div className="mt-5 space-y-4">
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100/50">
                        <h3 className="font-bold text-amber-800 text-lg sm:text-xl flex items-center gap-2">
                          <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                          Resumen Semanal de {child.name}
                        </h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {DAYS_OF_WEEK.map((day, index) => {
                          const behaviorStars = child.scores[index] || 0;
                          const dayTasks = (child.tasks || []).filter(t => t.days.includes(index));
                          const completedDayTasks = dayTasks.filter(t => t.completed[index]);
                          
                          const dailyTaskPointsEarned = completedDayTasks.reduce((sum, task) => sum + task.points, 0);
                          const totalDailyPoints = Math.max(0, dailyTaskPointsEarned + (behaviorStars * 10));

                          return (
                            <div key={day} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm sm:text-base shrink-0 border border-slate-200">
                                  {day.substring(0, 3)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-700 text-base sm:text-lg">{day}</p>
                                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                    Tareas completadas: {completedDayTasks.length} / {dayTasks.length}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 sm:gap-8 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl justify-center sm:justify-end">
                                <div className="flex flex-col items-center min-w-[60px]">
                                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Conducta</span>
                                  <div className="text-lg sm:text-2xl font-bold min-h-[28px] flex items-center justify-center">
                                    {behaviorStars === 1 ? '🌟' : behaviorStars === 0.5 ? '🌗' : behaviorStars === -1 ? '⚠️' : <span className="text-slate-300 font-normal text-sm">—</span>}
                                  </div>
                                </div>
                                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                                <div className="flex flex-col items-center min-w-[60px]">
                                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Puntos</span>
                                  <span className={`text-lg sm:text-2xl font-black ${totalDailyPoints > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                    +{totalDailyPoints}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 2: PARENTS VIEW (Manage stars, AI generation and Assign Tasks form) */}
                {activeMode === 'parents' && (
                  <div className="mt-5 space-y-6">
                    {/* Weekly Candy Target Configuration */}
                    <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-3 mb-4 border-b border-slate-100 pb-4">
                        <div className="bg-pink-50 p-2.5 rounded-xl text-pink-500">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight">
                            Meta de Dulce Semanal
                          </h3>
                          <p className="text-sm text-slate-500 font-medium mt-1">
                            Ajusta los puntos que necesita {child.name} esta semana para ganar su premio.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Selector/Input */}
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Puntos requeridos actuales: <strong className="text-pink-600 text-sm ml-1">{currentGoal} pts</strong>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[30, 50, 75, 100, 120].map((preset) => (
                              <button
                                type="button"
                                key={preset}
                                onClick={() => onUpdatePointsGoal(child.id, preset)}
                                className={`text-sm px-4 py-2 rounded-xl font-bold transition-all border-2 ${
                                  currentGoal === preset
                                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-pink-200 hover:bg-pink-50/50'
                                }`}
                              >
                                {preset} pts {preset === 50 ? '🍬' : ''}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom amount */}
                        <div className="shrink-0 flex items-center gap-3 lg:border-l lg:pl-6 border-slate-200 pt-4 lg:pt-0 border-t lg:border-t-0">
                          <span className="text-sm font-bold text-slate-600">Personalizado:</span>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={currentGoal}
                            onChange={(e) => {
                              const val = Math.max(5, Math.min(300, Number(e.target.value) || 5));
                              onUpdatePointsGoal(child.id, val);
                            }}
                            className="bg-white border-2 border-slate-200 text-slate-800 font-bold text-base rounded-xl py-2 px-3 w-24 text-center focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Part A: Original daily ratings grid */}
                    <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-50 p-2.5 rounded-xl text-amber-500">
                          <Star className="h-6 w-6 fill-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            Evaluar conducta diaria
                          </h3>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm mb-5 font-medium ml-14">
                        Asigna <strong className="text-amber-600">1 estrella</strong> si hizo todo, <strong className="text-yellow-600">media estrella</strong> por esfuerzo parcial, o <strong className="text-red-600">¡a mejorar! ⚠️</strong> si su conducta debe reforzarse.
                      </p>
                      
                      {/* Days of week - Responsive Dual Layout */}
                      {/* Mobile View: Vertical list rows for extreme ease of tap and read */}
                      <div className="block sm:hidden space-y-3">
                          {DAYS_OF_WEEK.map((day, index) => (
                              <div key={day} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <span className="font-bold text-slate-700 text-base">{day}</span>
                                  <StarRating
                                      rating={child.scores[index]}
                                      onRate={(score) => onUpdateScore(child.id, index, score)}
                                      compact={false}
                                  />
                              </div>
                          ))}
                      </div>

                      {/* Tablet/Desktop View: Original horizontal grid */}
                      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 text-center">
                          {DAYS_OF_WEEK.map((day, index) => (
                              <div key={day} className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-100 hover:border-slate-300 transition-colors shadow-sm">
                                  <p className="font-bold text-slate-700 text-sm mb-3">{day}</p>
                                  <div className="flex justify-center">
                                    <StarRating
                                        rating={child.scores[index]}
                                        onRate={(score) => onUpdateScore(child.id, index, score)}
                                        compact={true}
                                    />
                                  </div>
                              </div>
                          ))}
                      </div>
                    </div>

                    {/* Part B: Asignador de Tareas */}
                    <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                          <Check className="h-6 w-6 stroke-[3]" />
                        </div>
                        <h3 className="text-slate-800 font-bold text-lg">
                          Asignar y Gestionar Tareas de {child.name}
                        </h3>
                      </div>

                      <form onSubmit={handleParentSubmitTask} className="space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {/* Task title entry */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Escribe o selecciona una tarea sugerida:
                          </label>
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Ej. Recoger la mesa después de cenar"
                            className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-base placeholder-slate-400 text-slate-800 shadow-sm"
                          />
                          
                          {/* Suggested task chips */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {SUGGESTED_TASKS.map((chip) => (
                              <button
                                type="button"
                                key={chip}
                                onClick={() => setNewTaskTitle(chip)}
                                className="text-sm bg-white text-slate-600 font-semibold px-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Assign Days select */}
                        <div>
                          <span className="block text-sm font-bold text-slate-700 mb-2">
                            Días de asignación:
                          </span>
                          
                          {/* Day selector Quick helpers */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <button
                              type="button"
                              onClick={handleSelectAllDays}
                              className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                            >
                              Todo la semana
                            </button>
                            <button
                              type="button"
                              onClick={handleSelectWeekdays}
                              className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                            >
                              Lunes a viernes
                            </button>
                            <button
                              type="button"
                              onClick={handleSelectWeekend}
                              className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                            >
                              Fin de semana
                            </button>
                          </div>

                          {/* Days chips row */}
                          <div className="grid grid-cols-7 gap-2 text-center">
                            {DAYS_OF_WEEK.map((day, index) => {
                              const isSelected = newTaskDays.includes(index);
                              return (
                                <button
                                  type="button"
                                  key={day}
                                  onClick={() => handleToggleFormDay(index)}
                                  className={`py-2.5 px-1 rounded-xl text-sm font-bold transition-all border-2 ${
                                    isSelected
                                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                  }`}
                                >
                                  {day.substring(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Point value configuration & Submit */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-2">
                          <div className="flex-1">
                            <span className="block text-sm font-bold text-slate-700 mb-1">
                              Valor de la tarea (Puntos):
                            </span>
                            <span className="block text-xs text-slate-500 mb-2 font-medium">
                              Asigna más puntos para tareas costosas o desafiantes.
                            </span>
                            <select
                              value={newTaskPoints}
                              onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                              className="bg-white border-2 border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-base font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full sm:w-auto shadow-sm transition-all"
                            >
                              <option value="1">1 Punto</option>
                              <option value="2">2 Puntos</option>
                              <option value="3">3 Puntos</option>
                              <option value="5">5 Puntos ★</option>
                            </select>
                          </div>
                          
                          <button
                            type="submit"
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                          >
                            <Plus className="h-5 w-5" />
                            <span>Asignar Tarea</span>
                          </button>
                        </div>
                      </form>

                      {/* List of currently assigned tasks */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          Tareas Asignadas Actuales:
                        </h4>

                        {(child.tasks || []).length === 0 ? (
                          <div className="bg-slate-50 border border-slate-100 border-dashed rounded-xl p-6 text-center">
                            <p className="text-sm text-slate-500 font-medium">
                              No hay tareas activas asignadas. Agrega una arriba para incentivar sus logros.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {(child.tasks || []).map((t) => (
                              <div key={t.id} className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors">
                                <div className="text-sm">
                                  <p className="font-bold text-slate-800 text-base">{t.title}</p>
                                  <p className="text-xs text-slate-500 font-medium mt-1">
                                    Días: {t.days.map(d => DAYS_OF_WEEK[d].substring(0, 3)).join(', ')} | <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md ml-1">+{t.points} pts</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onDeleteTask(child.id, t.id)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                                  aria-label="Borrar tarea"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part C: Feedback history list */}
                    <div className="border-t border-slate-100 pt-4">
                        <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-sky-700 font-semibold list-none select-none">
                               <HistoryIcon />
                               <span>Historial de Feedback</span>
                               <svg className="h-5 w-5 transition-transform duration-300 group-open:rotate-90 ml-auto sm:ml-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                               </svg>
                            </summary>
                            <div className="mt-3 pl-1 sm:pl-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                {child.feedbackHistory && child.feedbackHistory.length > 0 ? (
                                    child.feedbackHistory.map((entry) => (
                                        <div key={entry.timestamp} className="border-l-4 border-sky-200 pl-3.5 py-2.5 bg-slate-50 rounded-r-xl border border-slate-100 border-l-0 shadow-xs">
                                            <p className="text-xs font-semibold text-sky-600 mb-1">{formatTimestamp(entry.timestamp)}</p>
                                            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs sm:text-sm text-slate-400 italic pl-5 py-2">Aún no hay feedback guardado.</p>
                                )}
                            </div>
                        </details>
                    </div>

                    {/* Part D: AI Feedback trigger */}
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleGetFeedback}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform active:scale-98 active:translate-y-0 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generando análisis y consejos...</span>
                                </>
                            ) : (
                                <>
                                    <BrainCircuitIcon />
                                    <span>Analizar conducta con IA</span>
                                </>
                            )}
                        </button>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
};

export default ChildCard;
