export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda' | 'kanban' | 'focus';
export type SoundType = 'chime' | 'radar' | 'bell' | 'digital';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM (24-hour format internally)
  durationMinutes: number; // e.g. 15, 30, 45, 60, 90, 120
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  completedAt?: string;
  tags: string[];
  color?: string;
  reminderOffsetMinutes: number; // 0 = at time of task, 5 = 5m before, etc. -1 = none
  alarmSound: SoundType;
  alarmTriggered?: boolean;
  snoozedUntil?: string; // ISO string
  subtasks: Subtask[];
  recurrence: RecurrenceType;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  volume: number; // 0 to 1
  defaultAlarmSound: SoundType;
  defaultDuration: number;
  timeFormat: '12h' | '24h';
  notificationsEnabled: boolean;
  autoSnoozeMinutes: number;
  soundEnabled: boolean;
}

export interface ProductivityStats {
  completedToday: number;
  completedThisWeek: number;
  totalActive: number;
  overdueCount: number;
  onTimeRate: number; // percentage 0-100
  focusMinutesToday: number;
}
