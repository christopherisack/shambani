import React, { useMemo } from 'react';
import {
  Clock,
  Bell,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Plus,
  MapPin,
  ListTodo,
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { formatDateKey, formatTime, formatHumanDate } from '../../utils/dateUtils';
import { Task } from '../../types/task';

export const AgendaView: React.FC = () => {
  const {
    tasks,
    openNewTaskModal,
    openEditTaskModal,
    toggleCompleteTask,
    searchQuery,
    selectedPriority,
    selectedTag,
    hideCompleted,
    settings,
  } = useTaskContext();

  const todayKey = formatDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
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
    });
  }, [tasks, hideCompleted, selectedPriority, selectedTag, searchQuery]);

  // Group chronologically
  const groups = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrowTasks: Task[] = [];
    const upcoming: Task[] = [];
    const completedList: Task[] = [];

    filteredTasks.forEach((task) => {
      if (task.completed) {
        completedList.push(task);
        return;
      }

      if (task.dueDate < todayKey) {
        overdue.push(task);
      } else if (task.dueDate === todayKey) {
        today.push(task);
      } else if (task.dueDate === tomorrowKey) {
        tomorrowTasks.push(task);
      } else {
        upcoming.push(task);
      }
    });

    const sortFn = (a: Task, b: Task) => {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;
      return a.dueTime.localeCompare(b.dueTime);
    };

    overdue.sort(sortFn);
    today.sort(sortFn);
    tomorrowTasks.sort(sortFn);
    upcoming.sort(sortFn);

    return [
      { id: 'overdue', title: 'Overdue Attention Required', tasks: overdue, isWarning: true },
      { id: 'today', title: 'Today', tasks: today, isToday: true },
      { id: 'tomorrow', title: 'Tomorrow', tasks: tomorrowTasks },
      { id: 'upcoming', title: 'Upcoming Later', tasks: upcoming },
      { id: 'completed', title: 'Completed Recently', tasks: completedList, isCompletedGroup: true },
    ].filter((g) => g.tasks.length > 0);
  }, [filteredTasks, todayKey, tomorrowKey]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
      {/* View Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Executive Schedule Agenda</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological task stream with alarm triggers and priority cues
          </p>
        </div>

        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Groups */}
      <div className="py-6 space-y-8">
        {groups.map((group) => (
          <div key={group.id} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {group.isWarning && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${
                    group.isWarning
                      ? 'text-rose-400'
                      : group.isToday
                      ? 'text-indigo-400'
                      : 'text-slate-400'
                  }`}
                >
                  {group.title}
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Group List Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden">
              {group.tasks.map((task) => {
                const priorityPip =
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
                    onClick={() => openEditTaskModal(task)}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-900 cursor-pointer transition-colors group"
                  >
                    {/* Checkbox & Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompleteTask(task.id);
                        }}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {task.completed && '✓'}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${priorityPip}`} />
                          <span
                            className={`text-sm font-semibold truncate ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        {/* Unboxed Metadata row */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                          <span className="font-mono text-slate-400">
                            {formatHumanDate(task.dueDate)}
                          </span>
                          {task.dueTime && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-300">
                                {formatTime(task.dueTime, settings.timeFormat === '24h')}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{task.durationMinutes}m</span>
                          {task.location && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400 truncate max-w-[150px]">
                                {task.location}
                              </span>
                            </>
                          )}
                          {task.tags?.map((tag) => (
                            <span key={tag} className="text-indigo-400 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Alarm Sound Pill or Icon */}
                    <div className="flex items-center gap-3 shrink-0">
                      {task.reminderOffsetMinutes >= 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2.5 py-1 rounded-md">
                          <Bell className="w-3.5 h-3.5" />
                          <span className="capitalize">{task.alarmSound} Alarm</span>
                        </div>
                      )}

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">No tasks match your filters</div>
            <p className="text-xs text-slate-500 mt-1">Try clearing search or active tag filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
