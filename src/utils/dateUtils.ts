import { Task } from '../types/task';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatHumanDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDisplayMonth(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(timeStr?: string, format24: boolean = false): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  if (format24) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export function getMonthMatrix(currentDate: Date): CalendarDay[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const matrix: CalendarDay[] = [];
  const todayKey = formatDateKey(new Date());

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    const dateKey = formatDateKey(date);
    matrix.push({
      date,
      dateKey,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = formatDateKey(date);
    matrix.push({
      date,
      dateKey,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
    });
  }

  // Next month padding to fill either 35 or 42 slots (standard 6-row or 5-row grid)
  const remaining = (7 - (matrix.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const dateKey = formatDateKey(date);
    matrix.push({
      date,
      dateKey,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
    });
  }

  // Ensure full 42 items for consistent layout stability if 35
  if (matrix.length < 42) {
    const nextStart = matrix[matrix.length - 1].dayNumber + 1;
    for (let i = 0; i < 7; i++) {
      const day = nextStart + i;
      const date = new Date(year, month + 1, day);
      const dateKey = formatDateKey(date);
      matrix.push({
        date,
        dateKey,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isPast: dateKey < todayKey,
      });
    }
  }

  return matrix;
}

export function getWeekDays(referenceDate: Date): CalendarDay[] {
  const current = new Date(referenceDate);
  const day = current.getDay();
  // Set to Sunday of current week
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - day);

  const days: CalendarDay[] = [];
  const todayKey = formatDateKey(new Date());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
    });
  }

  return days;
}

export function isTaskOverdue(task: Task): boolean {
  if (task.completed) return false;
  const now = new Date();
  const todayKey = formatDateKey(now);

  if (task.dueDate < todayKey) return true;
  if (task.dueDate > todayKey) return false;

  // Same day - check time if present
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    const taskDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return now.getTime() > taskDate.getTime();
  }

  return false;
}

export function isTaskDueToday(task: Task): boolean {
  const todayKey = formatDateKey(new Date());
  return task.dueDate === todayKey;
}

export function isTaskDueThisWeek(task: Task): boolean {
  const now = new Date();
  const week = getWeekDays(now);
  const weekKeys = new Set(week.map((w) => w.dateKey));
  return weekKeys.has(task.dueDate);
}

/**
 * Calculates absolute trigger timestamp for an alarm/reminder
 */
export function getAlarmTriggerTime(task: Task): Date | null {
  if (!task.dueTime) return null;

  const [year, month, day] = task.dueDate.split('-').map(Number);
  const [hours, minutes] = task.dueTime.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);

  // Subtract offset
  const offset = task.reminderOffsetMinutes >= 0 ? task.reminderOffsetMinutes : 0;
  date.setMinutes(date.getMinutes() - offset);

  return date;
}

/**
 * Generates an iCalendar (.ics) standard string for exporting
 */
export function generateICalendarString(tasks: Task[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mponzi//Task & Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const task of tasks) {
    const [y, m, d] = task.dueDate.split('-');
    let dtstart = `${y}${m}${d}`;
    let dtend = `${y}${m}${d}`;

    if (task.dueTime) {
      const [h, min] = task.dueTime.split(':');
      dtstart += `T${h}${min}00`;
      const duration = task.durationMinutes || 30;
      const endDate = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min) + duration);
      const ey = endDate.getFullYear();
      const em = String(endDate.getMonth() + 1).padStart(2, '0');
      const ed = String(endDate.getDate()).padStart(2, '0');
      const eh = String(endDate.getHours()).padStart(2, '0');
      const emin = String(endDate.getMinutes()).padStart(2, '0');
      dtend = `${ey}${em}${ed}T${eh}${emin}00`;
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${task.id}@mponzi.app`);
    lines.push(`SUMMARY:${task.title.replace(/\n/g, ' ')}`);
    if (task.description) {
      lines.push(`DESCRIPTION:${task.description.replace(/\n/g, '\\n')}`);
    }
    if (task.location) {
      lines.push(`LOCATION:${task.location}`);
    }
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push(`PRIORITY:${task.priority === 'urgent' ? 1 : task.priority === 'high' ? 3 : 5}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
