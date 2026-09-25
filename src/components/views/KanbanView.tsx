import React, { useMemo } from 'react';
import { Plus, Clock, Bell, CheckCircle2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { Task, TaskStatus } from '../../types/task';
import { formatTime, formatHumanDate } from '../../utils/dateUtils';

interface ColumnDef {
  id: TaskStatus;
  title: string;
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'backlog', title: 'Backlog & Ideas', color: 'border-t-slate-500' },
  { id: 'todo', title: 'To Do', color: 'border-t-indigo-500' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-amber-500' },
  { id: 'done', title: 'Completed', color: 'border-t-emerald-500' },
];

export const KanbanView: React.FC = () => {
  const {
    tasks,
    openNewTaskModal,
    openEditTaskModal,
    moveTaskStatus,
    toggleCompleteTask,
    searchQuery,
    selectedPriority,
    selectedTag,
    hideCompleted,
    settings,
  } = useTaskContext();

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

  const tasksByColumn = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    COLUMNS.forEach((c) => map.set(c.id, []));

    filteredTasks.forEach((t) => {
      const list = map.get(t.status) || [];
      list.push(t);
      map.set(t.status, list);
    });

    return map;
  }, [filteredTasks]);

  return (
    <div className="flex-1 flex gap-4 p-6 bg-slate-950 overflow-x-auto select-none">
      {COLUMNS.map((col) => {
        const colTasks = tasksByColumn.get(col.id) || [];

        return (
          <div
            key={col.id}
            className={`w-80 flex flex-col shrink-0 bg-slate-900/50 border border-slate-800 rounded-xl border-t-2 ${col.color} overflow-hidden max-h-full`}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="font-mono text-xs text-slate-500 tabular-nums bg-slate-800 px-1.5 py-0.5 rounded">
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => openNewTaskModal()}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards Column */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {colTasks.map((task) => {
                const priorityColor =
                  task.priority === 'urgent'
                    ? 'text-rose-400'
                    : task.priority === 'high'
                    ? 'text-amber-400'
                    : task.priority === 'medium'
                    ? 'text-indigo-400'
                    : 'text-emerald-400';

                return (
                  <div
                    key={task.id}
                    onClick={() => openEditTaskModal(task)}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm cursor-pointer transition-all space-y-2 group"
                  >
                    {/* Top Row: Priority & Next Status Action */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold uppercase tracking-wider ${priorityColor}`}>
                        {task.priority}
                      </span>

                      {/* Quick Move Shortcut */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== 'backlog' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const prevStatus =
                                col.id === 'done'
                                  ? 'in_progress'
                                  : col.id === 'in_progress'
                                  ? 'todo'
                                  : 'backlog';
                              moveTaskStatus(task.id, prevStatus);
                            }}
                            title="Move back"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[10px]"
                          >
                            ←
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus =
                                col.id === 'backlog'
                                  ? 'todo'
                                  : col.id === 'todo'
                                  ? 'in_progress'
                                  : 'done';
                              moveTaskStatus(task.id, nextStatus);
                            }}
                            title="Move forward"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-[10px]"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div
                      className={`text-xs font-semibold leading-snug ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </div>

                    {/* Time & Reminder info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatHumanDate(task.dueDate)}</span>
                      </span>

                      {task.reminderOffsetMinutes >= 0 && (
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Bell className="w-3 h-3" />
                          <span>{formatTime(task.dueTime, settings.timeFormat === '24h')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-lg">
                  No items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
