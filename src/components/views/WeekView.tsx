import React, { useMemo, useEffect, useRef } from 'react';
import { Clock, Plus, Bell, MapPin } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { getWeekDays, formatTime, formatDateKey } from '../../utils/dateUtils';
import { Task } from '../../types/task';

const START_HOUR = 7; // 7 AM
const END_HOUR = 23; // 11 PM
const HOUR_HEIGHT = 64; // px per hour

export const WeekView: React.FC = () => {
  const {
    tasks,
    selectedDate,
    openNewTaskModal,
    openEditTaskModal,
    searchQuery,
    selectedPriority,
    selectedTag,
    hideCompleted,
    settings,
  } = useTaskContext();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute 7 days of the selected week
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (hideCompleted && t.completed) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      if (selectedTag !== 'all' && !t.tags?.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [tasks, hideCompleted, selectedPriority, selectedTag, searchQuery]);

  // Group into timed vs all-day tasks per day
  const tasksByDate = useMemo(() => {
    const timedMap = new Map<string, Task[]>();
    const allDayMap = new Map<string, Task[]>();

    filteredTasks.forEach((task) => {
      if (task.dueTime) {
        const list = timedMap.get(task.dueDate) || [];
        list.push(task);
        timedMap.set(task.dueDate, list);
      } else {
        const list = allDayMap.get(task.dueDate) || [];
        list.push(task);
        allDayMap.set(task.dueDate, list);
      }
    });

    return { timedMap, allDayMap };
  }, [filteredTasks]);

  // Auto scroll to current hour or 8 AM on load
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = Math.max(START_HOUR, Math.min(END_HOUR, currentHour - 1));
      scrollRef.current.scrollTop = (targetHour - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  // Current time position calculation
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayKey = formatDateKey(now);
  const isNowInView = currentHour >= START_HOUR && currentHour <= END_HOUR;
  const currentTimeTop =
    isNowInView ? ((currentHour - START_HOUR) + currentMinute / 60) * HOUR_HEIGHT : -1;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-x-auto overflow-y-hidden select-none">
      <div className="flex-1 flex flex-col h-full min-w-[660px] md:min-w-0 w-full">
        {/* Week Header Row */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-800 bg-slate-900/70 shrink-0">
        <div className="p-2 border-r border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-center">
          GMT
        </div>
        {weekDays.map((day) => {
          return (
            <div
              key={day.dateKey}
              className={`p-2 text-center border-r border-slate-800 last:border-r-0 ${
                day.isToday ? 'bg-indigo-950/20' : ''
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold mt-0.5 ${
                  day.isToday
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-200'
                }`}
              >
                {day.dayNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-Day Tasks Section */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-800 bg-slate-950 shrink-0 min-h-[36px]">
        <div className="p-2 border-r border-slate-800 text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-center">
          All Day
        </div>
        {weekDays.map((day) => {
          const allDayTasks = tasksByDate.allDayMap.get(day.dateKey) || [];
          return (
            <div
              key={day.dateKey}
              className="p-1 border-r border-slate-800 last:border-r-0 space-y-1"
            >
              {allDayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => openEditTaskModal(task)}
                  className="px-1.5 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 truncate cursor-pointer"
                >
                  {task.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hourly Grid Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div
          className="grid grid-cols-[64px_repeat(7,1fr)] relative"
          style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
        >
          {/* Time Labels Column */}
          <div className="border-r border-slate-800 bg-slate-950">
            {hours.map((h) => {
              const displayTime =
                settings.timeFormat === '24h'
                  ? `${String(h).padStart(2, '0')}:00`
                  : `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`;

              return (
                <div
                  key={h}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="pr-2 pt-1 text-right text-[11px] font-mono text-slate-500 border-b border-slate-900 select-none"
                >
                  {displayTime}
                </div>
              );
            })}
          </div>

          {/* 7 Day Columns */}
          {weekDays.map((day) => {
            const timedTasks = tasksByDate.timedMap.get(day.dateKey) || [];
            const isToday = day.dateKey === todayKey;

            return (
              <div
                key={day.dateKey}
                className={`relative border-r border-slate-800 last:border-r-0 ${
                  isToday ? 'bg-indigo-950/5' : ''
                }`}
              >
                {/* Horizontal hour guide lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    onClick={() => {
                      const hourStr = String(h).padStart(2, '0') + ':00';
                      openNewTaskModal(day.dateKey, hourStr);
                    }}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-slate-900/80 hover:bg-slate-900/30 cursor-pointer transition-colors"
                  />
                ))}

                {/* Red Current Time Line if today */}
                {isToday && currentTimeTop >= 0 && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: `${currentTimeTop}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1 shadow-sm shadow-rose-500" />
                    <div className="flex-1 h-[2px] bg-rose-500 shadow-sm shadow-rose-500/50" />
                  </div>
                )}

                {/* Timed Task Cards */}
                {timedTasks.map((task) => {
                  if (!task.dueTime) return null;
                  const [h, m] = task.dueTime.split(':').map(Number);
                  const startHoursFromBase = h - START_HOUR + m / 60;
                  if (startHoursFromBase < 0 || startHoursFromBase > hours.length) return null;

                  const top = startHoursFromBase * HOUR_HEIGHT;
                  const duration = task.durationMinutes || 30;
                  const height = Math.max(28, (duration / 60) * HOUR_HEIGHT - 2);

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
                      className={`absolute left-1 right-1 z-10 p-1.5 rounded bg-slate-900/95 border border-slate-800 border-l-[3px] ${priorityBorder} hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer overflow-hidden group`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-slate-400 font-medium">
                          {formatTime(task.dueTime, settings.timeFormat === '24h')}
                        </span>
                        {task.reminderOffsetMinutes >= 0 && (
                          <Bell className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                        )}
                      </div>

                      <div
                        className={`text-xs font-semibold leading-tight truncate mt-0.5 ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </div>

                      {height > 48 && task.location && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{task.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};
