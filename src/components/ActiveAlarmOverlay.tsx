import React, { useState } from 'react';
import {
  BellRing,
  Clock,
  CheckCircle2,
  X,
  Volume2,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { formatTime, formatHumanDate } from '../utils/dateUtils';

export const ActiveAlarmOverlay: React.FC = () => {
  const {
    activeAlarmTask,
    snoozeAlarm,
    dismissAlarm,
    completeAlarmTask,
    settings,
  } = useTaskContext();

  const [customSnoozeMinutes, setCustomSnoozeMinutes] = useState(10);

  if (!activeAlarmTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 shadow-2xl shadow-rose-950/50 overflow-hidden">
        {/* Pulsing visual halo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Alarm Ringing Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/60 flex items-center justify-center text-rose-400 animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Task Reminder & Alarm
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="capitalize">{activeAlarmTask.alarmSound} tone</span>
                <span>·</span>
                <span>Scheduled for {formatTime(activeAlarmTask.dueTime, settings.timeFormat === '24h')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={dismissAlarm}
            title="Dismiss alarm"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Title & Details */}
        <div className="py-5">
          <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
            {activeAlarmTask.title}
          </h2>

          {activeAlarmTask.description && (
            <p className="mt-2 text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {activeAlarmTask.description}
            </p>
          )}

          {/* Metadata Row: Zero-pill discipline */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatHumanDate(activeAlarmTask.dueDate)}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-300">
              Duration: {activeAlarmTask.durationMinutes} min
            </span>
            {activeAlarmTask.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{activeAlarmTask.location}</span>
              </>
            )}
            {activeAlarmTask.tags && activeAlarmTask.tags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400">
                  {activeAlarmTask.tags.map((t) => `#${t}`).join(' ')}
                </span>
              </>
            )}
          </div>

          {/* Subtasks Preview if any */}
          {activeAlarmTask.subtasks && activeAlarmTask.subtasks.length > 0 && (
            <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Checklist items</span>
                <span className="font-mono">
                  {activeAlarmTask.subtasks.filter((s) => s.completed).length} / {activeAlarmTask.subtasks.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {activeAlarmTask.subtasks.map((st) => (
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
            </div>
          )}
        </div>

        {/* Tactical Actions: Snooze vs Complete */}
        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
          {/* Quick Snooze Presets */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Snooze for:</span>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => snoozeAlarm(mins)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={dismissAlarm}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              Dismiss Alarm
            </button>
            <button
              onClick={completeAlarmTask}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-700/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Completed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
