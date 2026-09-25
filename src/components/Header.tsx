import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Sliders,
  Menu,
  X,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { CalendarViewType } from '../types/task';
import { formatDisplayMonth, formatDateKey } from '../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedDate,
    setSelectedDate,
    openNewTaskModal,
    settings,
    updateSettings,
    setIsSettingsModalOpen,
    activeAlarmTask,
    testAlarm,
    isMobileSidebarOpen,
    toggleMobileSidebar,
  } = useTaskContext();

  const handlePrev = () => {
    const next = new Date(selectedDate);
    if (activeView === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (activeView === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setSelectedDate(next);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    if (activeView === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (activeView === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const views: { id: CalendarViewType; label: string }[] = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'kanban', label: 'Kanban' },
    { id: 'focus', label: 'Focus' },
  ];

  const formattedMonthYear = formatDisplayMonth(selectedDate);
  const isTodaySelected = formatDateKey(selectedDate) === formatDateKey(new Date());

  return (
    <header className="h-16 px-3 sm:px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-30 relative">
      {/* Zone 1: Mobile Hamburger + Brand Wordmark + Date Navigator */}
      <div className="flex items-center gap-2 sm:gap-5">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={toggleMobileSidebar}
          title="Toggle Sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Wordmark: Mponzi */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Mponzi
          </span>
        </div>

        {/* Date Navigator Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-4 border-l border-slate-800">
          <button
            onClick={handleToday}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              isTodaySelected
                ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              onClick={handlePrev}
              title="Previous period"
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              title="Next period"
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-slate-200 pl-1 font-mono tracking-tight hidden sm:inline-block">
            {formattedMonthYear}
          </span>
        </div>
      </div>

      {/* Zone 2: View Switcher (Desktop Tabs + Mobile Dropdown) */}
      {/* Desktop Segmented Buttons */}
      <nav className="hidden xl:flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-lg">
        {views.map((v) => {
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </nav>

      {/* Medium & Mobile View Switcher Dropdown */}
      <div className="xl:hidden flex items-center">
        <select
          value={activeView}
          onChange={(e) => setActiveView(e.target.value as CalendarViewType)}
          className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} View
            </option>
          ))}
        </select>
      </div>

      {/* Zone 3: Primary Actions (Alarm Status & New Task Button) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Active Alarm Flasher if ringing */}
        {activeAlarmTask && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/20 border border-rose-500 text-rose-300 text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span className="font-semibold hidden sm:inline">Alarm Firing</span>
          </div>
        )}

        {/* Audio Mute / Sound Toggle */}
        <button
          onClick={() => {
            const nextSound = !settings.soundEnabled;
            updateSettings({ soundEnabled: nextSound });
            if (nextSound) {
              testAlarm();
            }
          }}
          title={settings.soundEnabled ? 'Alarm Sound: Enabled' : 'Alarm Sound: Muted'}
          className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
            settings.soundEnabled
              ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700'
              : 'border-rose-900/40 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30'
          }`}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notifications Status Indicator (hidden on very narrow screens) */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          title="Notification status"
          className={`hidden sm:flex p-2 rounded-lg border text-xs font-medium transition-colors ${
            settings.notificationsEnabled
              ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-400'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          {settings.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          title="App Settings & Data Export"
          className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Primary CTA: New Task */}
        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
};
