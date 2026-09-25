import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, CalendarViewType, AppSettings, ProductivityStats, Priority, SoundType } from '../types/task';
import { getInitialTasks } from '../utils/initialData';
import { formatDateKey, getAlarmTriggerTime, generateICalendarString } from '../utils/dateUtils';
import { soundEngine } from '../utils/soundEngine';

interface TaskContextType {
  tasks: Task[];
  settings: AppSettings;
  activeView: CalendarViewType;
  selectedDate: Date;
  activeAlarmTask: Task | null;
  searchQuery: string;
  selectedPriority: Priority | 'all';
  selectedTag: string | 'all';
  hideCompleted: boolean;
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  modalPrefillDate: string | null;
  modalPrefillTime: string | null;
  isSettingsModalOpen: boolean;
  isMobileSidebarOpen: boolean;
  stats: ProductivityStats;
  allTags: string[];

  // Setters
  setActiveView: (view: CalendarViewType) => void;
  setSelectedDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: Priority | 'all') => void;
  setSelectedTag: (tag: string | 'all') => void;
  setHideCompleted: (hide: boolean) => void;
  setIsSettingsModalOpen: (open: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  // Task Modal Handlers
  openNewTaskModal: (prefillDate?: string, prefillTime?: string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;

  // Task Actions
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleCompleteTask: (id: string) => void;
  moveTaskStatus: (id: string, status: Task['status']) => void;

  // Alarm Handlers
  snoozeAlarm: (minutes: number) => void;
  dismissAlarm: () => void;
  completeAlarmTask: () => void;
  testAlarm: (sound?: SoundType) => void;

  // Settings & System
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  requestNotificationPermission: () => Promise<boolean>;
  exportCalendarICal: () => void;
  exportTasksJSON: () => void;
  importTasksJSON: (jsonStr: string) => boolean;
  resetToSampleData: () => void;
}

const STORAGE_KEY_TASKS = 'auratask_pro_tasks_v1';
const STORAGE_KEY_SETTINGS = 'auratask_pro_settings_v1';

const defaultSettings: AppSettings = {
  volume: 0.8,
  defaultAlarmSound: 'chime',
  defaultDuration: 30,
  timeFormat: '12h',
  notificationsEnabled: false,
  autoSnoozeMinutes: 10,
  soundEnabled: true,
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize tasks from localStorage or sample data
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return getInitialTasks();
  });

  // 2. Initialize settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return defaultSettings;
  });

  // 3. Navigation and Filtering State
  const [activeView, setActiveView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // 4. Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalPrefillDate, setModalPrefillDate] = useState<string | null>(null);
  const [modalPrefillTime, setModalPrefillTime] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 5. Active Alarm State
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  // Persist tasks on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // Quota exceeded
    }
  }, [tasks]);

  // Persist settings on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Quota exceeded
    }
  }, [settings]);

  // Sync notification permission state on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setSettings((prev) => ({ ...prev, notificationsEnabled: true }));
      }
    }
  }, []);

  // 6. Real-time Alarm Ticker: checks every 1000ms
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date();
      const nowTime = now.getTime();

      // Don't interrupt if an alarm is already ringing
      if (activeAlarmTask) return;

      for (const task of tasks) {
        if (task.completed) continue;

        // Check if task was snoozed
        if (task.snoozedUntil) {
          const snoozedTime = new Date(task.snoozedUntil).getTime();
          if (nowTime >= snoozedTime) {
            triggerAlarm(task);
            break;
          }
          continue;
        }

        // If alarm already fired once and not snoozed, skip
        if (task.alarmTriggered) continue;

        const triggerDate = getAlarmTriggerTime(task);
        if (!triggerDate) continue;

        const triggerTime = triggerDate.getTime();
        // If trigger time is reached within the last 90 seconds
        const diffMs = nowTime - triggerTime;
        if (diffMs >= 0 && diffMs < 90000) {
          triggerAlarm(task);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, activeAlarmTask, settings]);

  const triggerAlarm = useCallback(
    (task: Task) => {
      setActiveAlarmTask(task);

      // Mark alarm as triggered on the task
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, alarmTriggered: true, snoozedUntil: undefined } : t))
      );

      // Start audio alarm loop if sound is enabled
      if (settings.soundEnabled) {
        soundEngine.startAlarmLoop(task.alarmSound || settings.defaultAlarmSound, settings.volume);
      }

      // Send desktop notification if available
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const offsetText =
            task.reminderOffsetMinutes > 0
              ? `Starts in ${task.reminderOffsetMinutes} minutes`
              : `Starting right now!`;
          new Notification(`Reminder: ${task.title}`, {
            body: `${offsetText}${task.description ? ` · ${task.description}` : ''}`,
            icon: '/favicon.ico',
            requireInteraction: true,
          });
        } catch {
          // Ignore notification error
        }
      }
    },
    [settings]
  );

  // Stop alarm loop helper
  const stopAlarm = useCallback(() => {
    soundEngine.stopAlarmLoop();
    setActiveAlarmTask(null);
  }, []);

  const snoozeAlarm = useCallback(
    (minutes: number) => {
      if (!activeAlarmTask) return;
      const snoozeTarget = new Date();
      snoozeTarget.setMinutes(snoozeTarget.getMinutes() + minutes);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeAlarmTask.id
            ? { ...t, snoozedUntil: snoozeTarget.toISOString(), alarmTriggered: true }
            : t
        )
      );

      stopAlarm();
    },
    [activeAlarmTask, stopAlarm]
  );

  const dismissAlarm = useCallback(() => {
    stopAlarm();
  }, [stopAlarm]);

  const completeAlarmTask = useCallback(() => {
    if (!activeAlarmTask) return;
    const targetId = activeAlarmTask.id;
    stopAlarm();

    // Trigger visual confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }

    // Play completion chime
    if (settings.soundEnabled) {
      soundEngine.playCompletionChime(settings.volume);
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              completed: true,
              completedAt: new Date().toISOString(),
              status: 'done',
              snoozedUntil: undefined,
            }
          : t
      )
    );
  }, [activeAlarmTask, stopAlarm, settings]);

  const testAlarm = useCallback(
    (sound?: SoundType) => {
      soundEngine.previewSound(sound || settings.defaultAlarmSound, settings.volume);
    },
    [settings]
  );

  // Task Modal Handlers
  const openNewTaskModal = useCallback((prefillDate?: string, prefillTime?: string) => {
    setEditingTask(null);
    setModalPrefillDate(prefillDate || formatDateKey(new Date()));
    setModalPrefillTime(prefillTime || null);
    setIsTaskModalOpen(true);
  }, []);

  const openEditTaskModal = useCallback((task: Task) => {
    setEditingTask(task);
    setModalPrefillDate(null);
    setModalPrefillTime(null);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setModalPrefillDate(null);
    setModalPrefillTime(null);
  }, []);

  // CRUD Operations
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    closeTaskModal();
  }, [closeTaskModal]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    closeTaskModal();
  }, [closeTaskModal]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeAlarmTask?.id === id) {
      stopAlarm();
    }
  }, [activeAlarmTask, stopAlarm]);

  const toggleCompleteTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            if (settings.soundEnabled) soundEngine.playCompletionChime(settings.volume);
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
              });
            } catch {
              // Ignore
            }
          }
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'done' : 'todo',
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [settings]
  );

  const moveTaskStatus = useCallback((id: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isDone = status === 'done';
        return {
          ...t,
          status,
          completed: isDone,
          completedAt: isDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      const granted = perm === 'granted';
      setSettings((prev) => ({ ...prev, notificationsEnabled: granted }));
      return granted;
    } catch {
      return false;
    }
  }, []);

  const exportCalendarICal = useCallback(() => {
    const ics = generateICalendarString(tasks);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mponzi_export_${formatDateKey(new Date())}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tasks]);

  const exportTasksJSON = useCallback(() => {
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mponzi_backup_${formatDateKey(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [tasks]);

  const importTasksJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        setTasks(parsed);
        return true;
      }
    } catch {
      // Invalid
    }
    return false;
  }, []);

  const resetToSampleData = useCallback(() => {
    setTasks(getInitialTasks());
  }, []);

  // Compute all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  // Compute productivity stats
  const stats = useMemo((): ProductivityStats => {
    const todayKey = formatDateKey(new Date());
    let completedToday = 0;
    let completedThisWeek = 0;
    let totalActive = 0;
    let overdueCount = 0;

    tasks.forEach((task) => {
      if (task.completed) {
        if (task.completedAt && task.completedAt.startsWith(todayKey)) {
          completedToday++;
        }
        completedThisWeek++;
      } else {
        totalActive++;
        if (task.dueDate < todayKey) {
          overdueCount++;
        }
      }
    });

    const totalTracked = completedThisWeek + totalActive;
    const onTimeRate = totalTracked > 0 ? Math.round(((totalTracked - overdueCount) / totalTracked) * 100) : 100;

    return {
      completedToday,
      completedThisWeek,
      totalActive,
      overdueCount,
      onTimeRate: Math.max(0, Math.min(100, onTimeRate)),
      focusMinutesToday: 90,
    };
  }, [tasks]);

  const value = useMemo(
    () => ({
      tasks,
      settings,
      activeView,
      selectedDate,
      activeAlarmTask,
      searchQuery,
      selectedPriority,
      selectedTag,
      hideCompleted,
      isTaskModalOpen,
      editingTask,
      modalPrefillDate,
      modalPrefillTime,
      isSettingsModalOpen,
      isMobileSidebarOpen,
      stats,
      allTags,
      setActiveView,
      setSelectedDate,
      setSearchQuery,
      setSelectedPriority,
      setSelectedTag,
      setHideCompleted,
      setIsSettingsModalOpen,
      setIsMobileSidebarOpen,
      toggleMobileSidebar,
      openNewTaskModal,
      openEditTaskModal,
      closeTaskModal,
      createTask,
      updateTask,
      deleteTask,
      toggleCompleteTask,
      moveTaskStatus,
      snoozeAlarm,
      dismissAlarm,
      completeAlarmTask,
      testAlarm,
      updateSettings,
      requestNotificationPermission,
      exportCalendarICal,
      exportTasksJSON,
      importTasksJSON,
      resetToSampleData,
    }),
    [
      tasks,
      settings,
      activeView,
      selectedDate,
      activeAlarmTask,
      searchQuery,
      selectedPriority,
      selectedTag,
      hideCompleted,
      isTaskModalOpen,
      editingTask,
      modalPrefillDate,
      modalPrefillTime,
      isSettingsModalOpen,
      isMobileSidebarOpen,
      stats,
      allTags,
      openNewTaskModal,
      openEditTaskModal,
      closeTaskModal,
      createTask,
      updateTask,
      deleteTask,
      toggleCompleteTask,
      moveTaskStatus,
      snoozeAlarm,
      dismissAlarm,
      completeAlarmTask,
      testAlarm,
      updateSettings,
      requestNotificationPermission,
      exportCalendarICal,
      exportTasksJSON,
      importTasksJSON,
      resetToSampleData,
      toggleMobileSidebar,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
