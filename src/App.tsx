import React from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MonthView } from './components/views/MonthView';
import { WeekView } from './components/views/WeekView';
import { DayView } from './components/views/DayView';
import { AgendaView } from './components/views/AgendaView';
import { KanbanView } from './components/views/KanbanView';
import { FocusTimerView } from './components/views/FocusTimerView';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { ActiveAlarmOverlay } from './components/ActiveAlarmOverlay';

const MainAppContent: React.FC = () => {
  const { activeView } = useTaskContext();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Bar Header */}
      <Header />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible / Dense Sidebar */}
        <Sidebar />

        {/* Dynamic View Canvas */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeView === 'month' && <MonthView />}
          {activeView === 'week' && <WeekView />}
          {activeView === 'day' && <DayView />}
          {activeView === 'agenda' && <AgendaView />}
          {activeView === 'kanban' && <KanbanView />}
          {activeView === 'focus' && <FocusTimerView />}
        </main>
      </div>

      {/* Overlay & Modals */}
      <TaskModal />
      <SettingsModal />
      <ActiveAlarmOverlay />
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <MainAppContent />
    </TaskProvider>
  );
}
