import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Bell,
  Sparkles,
  Volume2,
  Clock,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTaskContext } from '../../context/TaskContext';
import { soundEngine } from '../../utils/soundEngine';
import { Task } from '../../types/task';

export const FocusTimerView: React.FC = () => {
  const { tasks, toggleCompleteTask, settings } = useTaskContext();

  // Mode durations in minutes
  const MODES = {
    focus: 25,
    deep: 50,
    shortBreak: 5,
    longBreak: 15,
  };

  const [mode, setMode] = useState<'focus' | 'deep' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODES.focus * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const timerRef = useRef<number | null>(null);

  // Available pending tasks to focus on
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Auto-select first pending task
  useEffect(() => {
    if (!selectedTaskId && pendingTasks.length > 0) {
      setSelectedTaskId(pendingTasks[0].id);
    }
  }, [pendingTasks, selectedTaskId]);

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Handle Mode Change
  const handleSwitchMode = (newMode: 'focus' | 'deep' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODES[newMode] * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);

            // Play completion chime
            if (settings.soundEnabled) {
              soundEngine.playCompletionChime(settings.volume);
            }
            try {
              confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
            } catch {
              // Ignore
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, settings]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode] * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  const totalModeSeconds = MODES[mode] * 60;
  const progressPercent = ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 overflow-y-auto select-none">
      <div className="w-full max-w-xl flex flex-col items-center text-center space-y-6">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap justify-center items-center p-1 bg-slate-900 border border-slate-800 rounded-xl gap-1">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleSwitchMode('deep')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'deep'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deep Work (50m)
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'shortBreak'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'longBreak'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Circular Display with Countdown */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex flex-col items-center justify-center bg-slate-900/60 rounded-full border-4 border-slate-800 shadow-2xl">
          {/* Subtle progress ring accent */}
          <div
            className="absolute inset-0 rounded-full border-4 border-indigo-500 transition-all duration-1000 opacity-60 pointer-events-none"
            style={{
              clipPath: `inset(0 0 ${100 - progressPercent}% 0)`,
            }}
          />

          <span className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white font-mono tabular-nums">
            {formattedMinutes}:{formattedSeconds}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-medium mt-1">
            {isRunning ? 'Session Active' : 'Paused'}
          </span>
        </div>

        {/* Play/Pause & Reset Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset timer"
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Target Task Anchor Card */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Task to Accomplish</span>
            </span>

            {/* Task selector dropdown */}
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 px-2 py-1 focus:outline-none focus:border-indigo-500 max-w-[220px] truncate"
            >
              {pendingTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {activeTask ? (
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white leading-tight">
                  {activeTask.title}
                </div>
                {activeTask.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {activeTask.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => toggleCompleteTask(activeTask.id)}
                className="ml-3 px-3 py-1.5 bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-2">
              No pending tasks available. Great job!
            </div>
          )}

          {/* Subtasks if any */}
          {activeTask?.subtasks && activeTask.subtasks.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Checklist Progress
              </div>
              {activeTask.subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 text-xs text-slate-300">
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                      st.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {st.completed && '✓'}
                  </span>
                  <span className={st.completed ? 'line-through text-slate-500' : ''}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
