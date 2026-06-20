import React, { useState, useCallback, useEffect } from 'react';
import type { Child, FeedbackEntry, Task } from './types';
import ChildCard from './components/ChildCard';
import { ResetIcon, UserPlusIcon } from './components/icons';
import AvatarPicker from './components/AvatarPicker';
import { useToast } from './contexts/ToastContext';

const APP_STORAGE_KEY = 'weeklyBehaviorChartApp';

const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>(() => {
    try {
      const storedData = window.localStorage.getItem(APP_STORAGE_KEY);
      const parsed: Child[] = storedData ? JSON.parse(storedData) : [];
      // Backward compatibility: ensure tasks array exists
      return parsed.map(c => ({
        ...c,
        tasks: c.tasks || []
      }));
    } catch (error) {
      console.error("Error loading data from localStorage", error);
      return [];
    }
  });
  const [newChildName, setNewChildName] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('😊');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(children));
    } catch (error) {
      console.error("Error saving data to localStorage", error);
    }
  }, [children]);


  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChildName.trim() === '') return;

    const newChild: Child = {
      id: Date.now().toString(),
      name: newChildName.trim(),
      avatar: newChildAvatar,
      scores: Array(7).fill(0),
      feedbackHistory: [],
      tasks: [],
    };

    setChildren([...children, newChild]);
    addToast(`${newChild.name} ha sido añadido/a con éxito.`, 'success');
    setNewChildName('');
    setNewChildAvatar('😊'); // Reset to default for the next one
  };

  const updateScore = useCallback((childId: string, dayIndex: number, score: number) => {
    setChildren(prevChildren =>
      prevChildren.map(child =>
        child.id === childId
          ? {
              ...child,
              scores: child.scores.map((s, i) => (i === dayIndex ? score : s)),
            }
          : child
      )
    );
  }, []);

  const handleUpdateAvatar = (childId: string, avatar: string) => {
    setChildren(prevChildren =>
      prevChildren.map(child =>
        child.id === childId ? { ...child, avatar } : child
      )
    );
  };
  
  const handleAddFeedback = useCallback((childId: string, feedbackText: string) => {
    const newFeedback: FeedbackEntry = {
        text: feedbackText,
        timestamp: new Date().toISOString(),
    };
    setChildren(prevChildren =>
        prevChildren.map(child =>
            child.id === childId
                ? { ...child, feedbackHistory: [newFeedback, ...child.feedbackHistory] }
                : child
        )
    );
  }, []);

  const handleAddTask = useCallback((childId: string, title: string, points: number, days: number[]) => {
    setChildren(prevChildren =>
      prevChildren.map(child => {
        if (child.id !== childId) return child;
        const newTask: Task = {
          id: Date.now().toString(),
          title: title.trim(),
          points: points,
          days: days,
          completed: {}
        };
        return {
          ...child,
          tasks: [...(child.tasks || []), newTask]
        };
      })
    );
    addToast('Tarea asignada correctamente.', 'success');
  }, [addToast]);

  const handleDeleteTask = useCallback((childId: string, taskId: string) => {
    setChildren(prevChildren =>
      prevChildren.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          tasks: (child.tasks || []).filter(t => t.id !== taskId)
        };
      })
    );
    addToast('Tarea eliminada.', 'info');
  }, [addToast]);

  const handleToggleTask = useCallback((childId: string, taskId: string, dayIndex: number) => {
    setChildren(prevChildren =>
      prevChildren.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          tasks: (child.tasks || []).map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              completed: {
                ...t.completed,
                [dayIndex]: !t.completed[dayIndex]
              }
            };
          })
        };
      })
    );
  }, []);

  const handleUpdatePointsGoal = useCallback((childId: string, goal: number) => {
    setChildren(prevChildren =>
      prevChildren.map(child =>
        child.id === childId ? { ...child, pointsGoal: goal } : child
      )
    );
  }, []);

  const handleResetAll = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todas las puntuaciones de la semana?')) {
        setChildren(prevChildren => 
            prevChildren.map(child => ({...child, scores: Array(7).fill(0)}))
        );
        addToast('Puntuaciones de la semana reiniciadas.', 'info');
    }
  };

  const handleRemoveChild = (childId: string) => {
    const childToRemove = children.find(c => c.id === childId);
    if (window.confirm('¿Estás seguro de que quieres eliminar a este niño? Esta acción no se puede deshacer.')) {
        setChildren(prevChildren => prevChildren.filter(child => child.id !== childId));
        if (childToRemove) {
            addToast(`${childToRemove.name} ha sido eliminado/a.`, 'error');
        }
    }
  }

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-slate-800">
       <AvatarPicker 
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={setNewChildAvatar}
        currentAvatar={newChildAvatar}
      />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-sky-700 tracking-tight">
            Tabla de Comportamiento Semanal
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg">
            ¡Registra los logros de tus peques y celebra su progreso!
          </p>
        </header>

        <main>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-5 sm:p-6 mb-8 border border-sky-100">
            <h2 className="text-xl sm:text-2xl font-bold text-sky-600 mb-4 text-center sm:text-left">Añadir un niño/a</h2>
            <form onSubmit={handleAddChild} className="flex flex-col gap-4">
              <div className="flex gap-3 w-full items-center">
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="text-4xl sm:text-5xl bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-2.5 transition-all hover:bg-slate-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500 flex items-center justify-center aspect-square shrink-0"
                  aria-label="Elegir avatar"
                >
                  {newChildAvatar}
                </button>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Nombre del niño/a"
                  className="w-full flex-grow p-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all outline-none text-base"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2 text-base"
                disabled={!newChildName.trim()}
              >
                <UserPlusIcon />
                <span>Añadir niño/a</span>
              </button>
            </form>
          </div>

          {children.length > 0 && (
              <div className="text-center mb-8 px-4">
                 <button onClick={handleResetAll} className="bg-amber-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto text-xs sm:text-sm md:text-base">
                    <ResetIcon />
                    <span>Reiniciar Puntuaciones de la Semana</span>
                </button>
              </div>
          )}

          <div className="space-y-6">
            {children.map(child => (
              <ChildCard 
                key={child.id} 
                child={child} 
                onUpdateScore={updateScore} 
                onRemoveChild={handleRemoveChild} 
                onUpdateAvatar={handleUpdateAvatar}
                onAddFeedback={handleAddFeedback}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onToggleTask={handleToggleTask}
                onUpdatePointsGoal={handleUpdatePointsGoal}
              />
            ))}
          </div>

          {children.length === 0 && (
            <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg border border-sky-100">
                <p className="text-slate-500 text-xl">Aún no has añadido a ningún niño.</p>
                <p className="text-slate-400 mt-2">Usa el formulario de arriba para empezar.</p>
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-slate-400 text-sm">
          <p>Creado con ❤️ para fomentar el refuerzo positivo.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;