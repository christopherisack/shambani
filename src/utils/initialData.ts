import { Task } from '../types/task';
import { formatDateKey } from './dateUtils';

export function getInitialTasks(): Task[] {
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  // Day after tomorrow
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);
  const dayAfterKey = formatDateKey(dayAfter);

  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  // Next week
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);
  const nextWeekKey = formatDateKey(nextWeek);

  return [
    {
      id: 'task-1',
      title: 'Q3 Executive Strategy & Deliverables Review',
      description: 'Align product milestones with VP of Engineering and Operations. Review budget allocations and critical path dependencies.',
      dueDate: todayKey,
      dueTime: '10:00',
      durationMinutes: 60,
      priority: 'urgent',
      status: 'in_progress',
      completed: false,
      tags: ['Executive', 'Strategy'],
      color: '#ef4444',
      reminderOffsetMinutes: 10,
      alarmSound: 'radar',
      subtasks: [
        { id: 'sub-1', title: 'Compile Q3 performance metrics deck', completed: true },
        { id: 'sub-2', title: 'Verify server expenditure targets', completed: true },
        { id: 'sub-3', title: 'Draft hiring roadmap for Q4', completed: false },
      ],
      recurrence: 'none',
      location: 'Boardroom A / Google Meet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Deep Work: Core API Refactor & Performance Pass',
      description: 'Implement Redis caching layer and optimize SQL queries for low-latency dashboard metrics.',
      dueDate: todayKey,
      dueTime: '13:30',
      durationMinutes: 90,
      priority: 'high',
      status: 'todo',
      completed: false,
      tags: ['Engineering', 'Focus'],
      color: '#6366f1',
      reminderOffsetMinutes: 5,
      alarmSound: 'chime',
      subtasks: [
        { id: 'sub-4', title: 'Profile slowest endpoints', completed: false },
        { id: 'sub-5', title: 'Add database indices', completed: false },
      ],
      recurrence: 'weekdays',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Client Contract Sign-off & Security Audit Review',
      description: 'Finalize SOC2 compliance paperwork with legal team before signing master service agreement.',
      dueDate: todayKey,
      dueTime: '16:00',
      durationMinutes: 45,
      priority: 'urgent',
      status: 'todo',
      completed: false,
      tags: ['Legal', 'Client'],
      color: '#f59e0b',
      reminderOffsetMinutes: 15,
      alarmSound: 'bell',
      subtasks: [],
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Weekly Cross-Functional All-Hands Briefing',
      description: 'Departmental updates, customer spotlight, and open Q&A forum with all team leads.',
      dueDate: todayKey,
      dueTime: '17:15',
      durationMinutes: 45,
      priority: 'medium',
      status: 'todo',
      completed: false,
      tags: ['Company', 'Meeting'],
      color: '#06b6d4',
      reminderOffsetMinutes: 5,
      alarmSound: 'digital',
      subtasks: [],
      recurrence: 'weekly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Product Design Sprint: Mobile Calendar Interactions',
      description: 'Review interactive prototypes for calendar time-blocking and gesture navigation.',
      dueDate: tomorrowKey,
      dueTime: '11:00',
      durationMinutes: 60,
      priority: 'high',
      status: 'todo',
      completed: false,
      tags: ['Design', 'Product'],
      color: '#8b5cf6',
      reminderOffsetMinutes: 15,
      alarmSound: 'chime',
      subtasks: [
        { id: 'sub-6', title: 'Figma prototype walkthrough', completed: false },
        { id: 'sub-7', title: 'Collect design team feedback', completed: false },
      ],
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Quarterly Infrastructure Budget Review',
      description: 'Analyze cloud spend across compute, storage, and egress instances to maintain target margins.',
      dueDate: dayAfterKey,
      dueTime: '14:00',
      durationMinutes: 60,
      priority: 'medium',
      status: 'backlog',
      completed: false,
      tags: ['Finance', 'DevOps'],
      color: '#10b981',
      reminderOffsetMinutes: 30,
      alarmSound: 'bell',
      subtasks: [],
      recurrence: 'monthly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-7',
      title: 'Publish Product Changelog & Release Notes v2.4',
      description: 'Announce new calendar reminders, alarm engine, and keyboard shortcuts in newsletter.',
      dueDate: yesterdayKey,
      dueTime: '15:00',
      durationMinutes: 30,
      priority: 'medium',
      status: 'done',
      completed: true,
      completedAt: new Date(yesterday).toISOString(),
      tags: ['Marketing', 'Product'],
      color: '#10b981',
      reminderOffsetMinutes: 0,
      alarmSound: 'chime',
      subtasks: [],
      recurrence: 'none',
      createdAt: new Date(yesterday).toISOString(),
      updatedAt: new Date(yesterday).toISOString(),
    },
    {
      id: 'task-8',
      title: 'Security Vulnerability Scan & Penetration Test',
      description: 'External security assessment report sign-off and token rotation verification.',
      dueDate: nextWeekKey,
      dueTime: '09:30',
      durationMinutes: 120,
      priority: 'urgent',
      status: 'backlog',
      completed: false,
      tags: ['Security', 'DevOps'],
      color: '#ef4444',
      reminderOffsetMinutes: 30,
      alarmSound: 'radar',
      subtasks: [],
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
