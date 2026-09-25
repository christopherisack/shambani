import React, { useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
  Tag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  X,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { formatDateKey, getMonthMatrix } from '../utils/dateUtils';
import { Priority } from '../types/task';

export const Sidebar: React.FC = () => {
  const {
    tasks,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedTag,
    setSelectedTag,
    hideCompleted,
    setHideCompleted,
    allTags,
    stats,
    exportCalendarICal,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useTaskContext();

  // Mini calendar state based on selectedDate
  const miniMatrix = useMemo(() => getMonthMatrix(selectedDate), [selectedDate]);

  // Map dates with active tasks to show task dots
  const datesWithTasks = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (!t.completed) set.add(t.dueDate);
    });
    return set;
  }, [tasks]);

  const handleMiniPrev = () => {
    const prev = new Date(selectedDate);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedDate(prev);
  };

  const handleMiniNext = () => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + 1);
    setSelectedDate(next);
  };

  const todayKey = formatDateKey(new Date());
  const selectedDateKey = formatDateKey(selectedDate);

  const priorities: { id: Priority | 'all'; label: string; color: string }[] = [
    { id: 'all', label: 'All Priorities', color: 'bg-slate-400' },
    { id: 'urgent', label: 'Urgent', color: 'bg-rose-500' },
    { id: 'high', label: 'High', color: 'bg-amber-500' },
    { id: 'medium', label: 'Medium', color: 'bg-indigo-400' },
    { id: 'low', label: 'Low', color: 'bg-emerald-400' },
  ];

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleFilterClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Mobile Drawer Close Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
        <span className="text-sm font-bold text-white tracking-tight">Navigation & Filters</span>
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tasks or tags..."
          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Mini Calendar Widget */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 font-mono tracking-tight">
            {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMiniPrev}
              className="p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMiniNext}
              className="p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-semibold text-slate-500">
              {d}
            </span>
          ))}
        </div>

        {/* Matrix days */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {miniMatrix.slice(0, 35).map((item, idx) => {
            const isSelected = item.dateKey === selectedDateKey;
            const hasTask = datesWithTasks.has(item.dateKey);

            return (
              <button
                key={idx}
                onClick={() => handleSelectDate(item.date)}
                className={`relative py-1 rounded text-[11px] font-mono transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold'
                    : item.isToday
                    ? 'border border-indigo-400 text-indigo-300 font-medium'
                    : item.isCurrentMonth
                    ? 'text-slate-300 hover:bg-slate-800/80'
                    : 'text-slate-600 hover:bg-slate-900'
                }`}
              >
                <span>{item.dayNumber}</span>
                {hasTask && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-indigo-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Nav & Filter Section */}
      <div className="p-3 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Views & States
        </div>

        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedPriority('all');
              setSelectedTag('all');
              setHideCompleted(false);
              handleFilterClick();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>All Active Tasks</span>
            </div>
            <span className="font-mono text-slate-500 tabular-nums">{stats.totalActive}</span>
          </button>

          <button
            onClick={() => {
              setSelectedDate(new Date());
              handleFilterClick();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Due Today</span>
            </div>
            <span className="font-mono text-slate-500 tabular-nums">
              {tasks.filter((t) => !t.completed && t.dueDate === todayKey).length}
            </span>
          </button>

          {stats.overdueCount > 0 && (
            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-300 bg-rose-950/20 border border-rose-900/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Overdue Tasks</span>
              </div>
              <span className="font-mono font-bold text-rose-400 tabular-nums">{stats.overdueCount}</span>
            </div>
          )}

          <button
            onClick={() => {
              setHideCompleted(!hideCompleted);
              handleFilterClick();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hide Completed</span>
            </div>
            <span
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                hideCompleted ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
              }`}
            >
              {hideCompleted && '✓'}
            </span>
          </button>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="p-3 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Priority
        </div>
        <div className="space-y-0.5">
          {priorities.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPriority(p.id);
                handleFilterClick();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                selectedPriority === p.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                <span>{p.label}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {p.id === 'all'
                  ? tasks.length
                  : tasks.filter((t) => t.priority === p.id && (!hideCompleted || !t.completed)).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="p-3 border-b border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Categories & Tags
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                setSelectedTag('all');
                handleFilterClick();
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedTag === 'all'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  handleFilterClick();
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Productivity Metric Cards */}
      <div className="p-3 mt-auto border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly Performance</span>
          </span>
          <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
            {stats.onTimeRate}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${stats.onTimeRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{stats.completedThisWeek} done</span>
          <button
            onClick={exportCalendarICal}
            title="Export calendar file (.ics)"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>.ics export</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 bg-slate-950/95 flex-col shrink-0 select-none overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 z-50 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
