import React, { useMemo, useState } from 'react';
import { Plus, Clock, Check, X, Bell } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { getMonthMatrix, formatTime, CalendarDay } from '../../utils/dateUtils';
import { Task } from '../../types/task';

export const MonthView: React.FC = () => {
  const {
    tasks,
    selectedDate,
    setSelectedDate,
    openNewTaskModal,
    openEditTaskModal,
    toggleCompleteTask,
    searchQuery,
    selectedPriority,
    selectedTag,
    hideCompleted,
    settings,
  } = useTaskContext();

  const [expandedDay, setExpandedDay] = useState<CalendarDay | null>(null);

  // Compute month matrix
  const matrix = useMemo(() => getMonthMatrix(selectedDate), [selectedDate]);

  // Filter tasks based on global search & active filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (hideCompleted && t.completed) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      if (selectedTag !== 'all' && !t.tags?.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }
      return true;
    });
  }, [tasks, hideCompleted, selectedPriority, selectedTag, searchQuery]);

  // Group tasks by dateKey
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasks.forEach((task) => {
      const arr = map.get(task.dueDate) || [];
      arr.push(task);
      map.set(task.dueDate, arr);
    });
    // Sort tasks in each date by time
    map.forEach((list) => {
      list.sort((a, b) => {
        if (!a.dueTime) return 1;
        if (!b.dueTime) return -1;
        return a.dueTime.localeCompare(b.dueTime);
      });
    });
    return map;
  }, [filteredTasks]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/60 shrink-0">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-semibold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 7x6 Month Matrix Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-800/80 bg-slate-950 overflow-hidden">
        {matrix.map((day) => {
          const dayTasks = tasksByDate.get(day.dateKey) || [];
          const visibleTasks = dayTasks.slice(0, 3);
          const hiddenCount = dayTasks.length - 3;

          return (
            <div
              key={day.dateKey}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  openNewTaskModal(day.dateKey);
                }
              }}
              className={`group relative flex flex-col p-1.5 transition-colors overflow-hidden ${
                day.isCurrentMonth ? 'bg-slate-950' : 'bg-slate-950/40 text-slate-600'
              } hover:bg-slate-900/40 cursor-pointer`}
            >
              {/* Day Header Row */}
              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-medium ${
                    day.isToday
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : day.isCurrentMonth
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Quick Add Button on Cell Hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNewTaskModal(day.dateKey);
                  }}
                  title="Add task on this date"
                  className="pointer-events-auto p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task Items List - Desktop text chips & Mobile dot indicators */}
              <div className="flex-1 space-y-1 overflow-hidden pointer-events-auto">
                {/* Mobile view (< sm): concise dots or count */}
                <div
                  className="flex sm:hidden flex-wrap items-center gap-1 mt-0.5"
                  onClick={(e) => {
                    if (dayTasks.length > 0) {
                      e.stopPropagation();
                      setExpandedDay(day);
                    }
                  }}
                >
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        t.priority === 'urgent'
                          ? 'bg-rose-500'
                          : t.priority === 'high'
                          ? 'bg-amber-500'
                          : t.priority === 'medium'
                          ? 'bg-indigo-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-mono text-indigo-400 leading-none">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>

                {/* Desktop view (>= sm): rich task chip with time and title */}
                <div className="hidden sm:block space-y-1">
                  {visibleTasks.map((task) => {
                    const priorityColor =
                      task.priority === 'urgent'
                        ? 'bg-rose-500'
                        : task.priority === 'high'
                        ? 'bg-amber-500'
                        : task.priority === 'medium'
                        ? 'bg-indigo-400'
                        : 'bg-emerald-400';

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTaskModal(task);
                        }}
                        className={`group/task flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left text-[11px] border border-slate-800/80 transition-all ${
                          task.completed
                            ? 'bg-slate-900/40 text-slate-500 line-through'
                            : 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColor}`} />
                          {task.dueTime && (
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums shrink-0">
                              {formatTime(task.dueTime, settings.timeFormat === '24h')}
                            </span>
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>

                        {/* Reminder Icon if alarm is set */}
                        {task.reminderOffsetMinutes >= 0 && !task.completed && (
                          <Bell className="w-2.5 h-2.5 text-indigo-400 shrink-0 opacity-70" />
                        )}
                      </div>
                    );
                  })}

                  {/* More Tasks overflow indicator */}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDay(day);
                      }}
                      className="w-full text-left px-1.5 py-0.5 text-[10px] font-mono font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 rounded"
                    >
                      +{hiddenCount} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Overflow Modal if user clicks "+X more" */}
      {expandedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {expandedDay.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <span className="text-xs text-slate-400">
                  {tasksByDate.get(expandedDay.dateKey)?.length || 0} scheduled tasks
                </span>
              </div>
              <button
                onClick={() => setExpandedDay(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(tasksByDate.get(expandedDay.dateKey) || []).map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setExpandedDay(null);
                    openEditTaskModal(task);
                  }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompleteTask(task.id);
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {task.completed && '✓'}
                    </button>
                    <div className="truncate">
                      <div
                        className={`text-xs font-medium truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {formatTime(task.dueTime, settings.timeFormat === '24h') || 'All day'}
                        {task.durationMinutes && ` · ${task.durationMinutes}m`}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between">
              <button
                onClick={() => {
                  const dKey = expandedDay.dateKey;
                  setExpandedDay(null);
                  openNewTaskModal(dKey);
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-500 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task Here</span>
              </button>

              <button
                onClick={() => setExpandedDay(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md text-xs font-medium hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
