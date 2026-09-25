import React, { useMemo, useRef, useEffect } from 'react';
import {
  Clock,
  Plus,
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MapPin,
  ListTodo,
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { formatDateKey, formatTime, formatHumanDate } from '../../utils/dateUtils';
import { Task } from '../../types/task';

const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_HEIGHT = 72;

export const DayView: React.FC = () => {
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());
  const isToday = selectedDateKey === todayKey;

  // Filter tasks for this specific day
  const dayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate === selectedDateKey)
      .filter((t) => {
        if (hideCompleted && t.completed) return false;
        if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
        if (selectedTag !== 'all' && !t.tags?.includes(selectedTag)) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return (
            t.title.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (!a.dueTime) return 1;
        if (!b.dueTime) return -1;
        return a.dueTime.localeCompare(b.dueTime);
      });
  }, [tasks, selectedDateKey, hideCompleted, selectedPriority, selectedTag, searchQuery]);

  // Timed tasks vs all day tasks
  const timedTasks = dayTasks.filter((t) => !!t.dueTime);
  const allDayTasks = dayTasks.filter((t) => !t.dueTime);

  // Next upcoming task on this day
  const nextUpcomingTask = useMemo(() => {
    const uncompleted = timedTasks.filter((t) => !t.completed);
    return uncompleted[0] || null;
  }, [timedTasks]);

  // All subtasks for this day
  const daySubtasks = useMemo(() => {
    const items: { taskId: string; taskTitle: string; subtaskId: string; subtaskTitle: string; completed: boolean }[] = [];
    dayTasks.forEach((t) => {
      t.subtasks?.forEach((st) => {
        items.push({
          taskId: t.id,
          taskTitle: t.title,
          subtaskId: st.id,
          subtaskTitle: st.title,
          completed: st.completed,
        });
      });
    });
    return items;
  }, [dayTasks]);

  // Scroll to current hour
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = Math.max(START_HOUR, Math.min(END_HOUR, currentHour - 1));
      scrollRef.current.scrollTop = (targetHour - START_HOUR) * HOUR_HEIGHT;
    }
  }, [selectedDateKey]);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isNowInView = currentHour >= START_HOUR && currentHour <= END_HOUR;
  const currentTimeTop =
    isNowInView ? ((currentHour - START_HOUR) + currentMinute / 60) * HOUR_HEIGHT : -1;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-950 overflow-hidden">
      {/* Left Column: Hourly Time-blocking Timeline */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-800 overflow-hidden">
        {/* Day Header Banner */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{formatHumanDate(selectedDateKey)}</span>
              {isToday && (
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                  Today
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {dayTasks.filter((t) => t.completed).length} of {dayTasks.length} tasks completed
            </div>
          </div>

          <button
            onClick={() => openNewTaskModal(selectedDateKey)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Day</span>
          </button>
        </div>

        {/* All Day Banner if any */}
        {allDayTasks.length > 0 && (
          <div className="p-3 border-b border-slate-800 bg-slate-950/80 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
              All Day
            </span>
            <div className="flex flex-wrap gap-2">
              {allDayTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openEditTaskModal(t)}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 cursor-pointer flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompleteTask(t.id);
                    }}
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                      t.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {t.completed && '✓'}
                  </button>
                  <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hourly Grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative bg-slate-950">
          <div
            className="grid grid-cols-[80px_1fr] relative"
            style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
          >
            {/* Time Labels */}
            <div className="border-r border-slate-800 bg-slate-950 select-none">
              {hours.map((h) => {
                const label =
                  settings.timeFormat === '24h'
                    ? `${String(h).padStart(2, '0')}:00`
                    : `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                return (
                  <div
                    key={h}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="pr-3 pt-1 text-right text-xs font-mono text-slate-500 border-b border-slate-900"
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Time Slot Body */}
            <div className="relative">
              {hours.map((h) => (
                <div
                  key={h}
                  onClick={() => {
                    const hourStr = String(h).padStart(2, '0') + ':00';
                    openNewTaskModal(selectedDateKey, hourStr);
                  }}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="border-b border-slate-900 hover:bg-slate-900/30 cursor-pointer transition-colors"
                />
              ))}

              {/* Current Time Line */}
              {isToday && currentTimeTop >= 0 && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                  style={{ top: `${currentTimeTop}px` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 shadow-sm shadow-rose-500" />
                  <div className="flex-1 h-[2px] bg-rose-500 shadow-sm shadow-rose-500/50" />
                </div>
              )}

              {/* Day Time-Blocked Cards */}
              {timedTasks.map((task) => {
                if (!task.dueTime) return null;
                const [h, m] = task.dueTime.split(':').map(Number);
                const startHour = h - START_HOUR + m / 60;
                if (startHour < 0 || startHour > hours.length) return null;

                const top = startHour * HOUR_HEIGHT;
                const duration = task.durationMinutes || 30;
                const height = Math.max(34, (duration / 60) * HOUR_HEIGHT - 4);

                const priorityBorder =
                  task.priority === 'urgent'
                    ? 'border-l-rose-500'
                    : task.priority === 'high'
                    ? 'border-l-amber-500'
                    : task.priority === 'medium'
                    ? 'border-l-indigo-400'
                    : 'border-l-emerald-400';

                return (
                  <div
                    key={task.id}
                    onClick={() => openEditTaskModal(task)}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                    className={`absolute left-3 right-3 z-10 p-2.5 rounded-lg bg-slate-900 border border-slate-800 border-l-4 ${priorityBorder} hover:border-slate-700 shadow-sm cursor-pointer transition-all flex flex-col justify-between`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
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
                        <span
                          className={`text-xs font-semibold ${
                            task.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-xs font-mono">
                        <span>{formatTime(task.dueTime, settings.timeFormat === '24h')}</span>
                        {task.reminderOffsetMinutes >= 0 && (
                          <Bell className="w-3 h-3 text-indigo-400" />
                        )}
                      </div>
                    </div>

                    {height > 52 && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="font-mono">{task.durationMinutes}m duration</span>
                        {task.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {task.location}
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <span className="text-indigo-400">
                            {task.tags.map((t) => `#${t}`).join(' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Executive Day Briefing */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0 overflow-y-auto p-5 space-y-6">
        {/* Next Alarm Spotlight */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next Alarm & Focus</span>
          </div>

          {nextUpcomingTask ? (
            <div
              onClick={() => openEditTaskModal(nextUpcomingTask)}
              className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-md shadow-indigo-950/40 hover:border-indigo-500/60 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-xs text-indigo-300 font-mono mb-1">
                <span>{formatTime(nextUpcomingTask.dueTime, settings.timeFormat === '24h')}</span>
                <span className="capitalize">{nextUpcomingTask.priority} Priority</span>
              </div>
              <div className="text-sm font-bold text-white">{nextUpcomingTask.title}</div>
              {nextUpcomingTask.description && (
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {nextUpcomingTask.description}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-500">
              No further pending alarms today
            </div>
          )}
        </div>

        {/* Day Subtask Focus List */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-amber-400" />
              <span>Day Checklist</span>
            </span>
            <span className="font-mono text-xs">
              {daySubtasks.filter((s) => s.completed).length} / {daySubtasks.length}
            </span>
          </div>

          {daySubtasks.length > 0 ? (
            <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {daySubtasks.map((st) => (
                <div key={st.subtaskId} className="p-1 text-xs flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                      st.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {st.completed && '✓'}
                  </span>
                  <div className="truncate">
                    <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {st.subtaskTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 truncate">
                      ({st.taskTitle})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-500 text-center">
              No subtasks logged for today
            </div>
          )}
        </div>

        {/* Priority Breakdown for the day */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Day Schedule Breakdown
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">TOTAL TASKS</div>
              <div className="text-base font-bold text-white mt-0.5">{dayTasks.length}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-500 text-[10px]">COMPLETED</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {dayTasks.filter((t) => t.completed).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
