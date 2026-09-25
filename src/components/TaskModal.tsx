import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Bell,
  Volume2,
  ListPlus,
  Trash2,
  Tag,
  Repeat,
  MapPin,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Priority, SoundType, RecurrenceType, Subtask, TaskStatus } from '../types/task';
import { formatDateKey } from '../utils/dateUtils';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    editingTask,
    modalPrefillDate,
    modalPrefillTime,
    closeTaskModal,
    createTask,
    updateTask,
    deleteTask,
    testAlarm,
    settings,
  } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(formatDateKey(new Date()));
  const [dueTime, setDueTime] = useState('10:00');
  const [hasTime, setHasTime] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [reminderOffset, setReminderOffset] = useState<number>(10);
  const [alarmSound, setAlarmSound] = useState<SoundType>('chime');
  const [location, setLocation] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [tags, setTags] = useState<string[]>(['Work']);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Sync state when editing or opening
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate);
      if (editingTask.dueTime) {
        setDueTime(editingTask.dueTime);
        setHasTime(true);
      } else {
        setHasTime(false);
      }
      setDurationMinutes(editingTask.durationMinutes || 30);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setReminderOffset(editingTask.reminderOffsetMinutes ?? 10);
      setAlarmSound(editingTask.alarmSound || settings.defaultAlarmSound);
      setLocation(editingTask.location || '');
      setRecurrence(editingTask.recurrence || 'none');
      setTags(editingTask.tags || []);
      setSubtasks(editingTask.subtasks || []);
    } else {
      // New task prefill
      setTitle('');
      setDescription('');
      setDueDate(modalPrefillDate || formatDateKey(new Date()));
      setDueTime(modalPrefillTime || '09:00');
      setHasTime(true);
      setDurationMinutes(settings.defaultDuration || 30);
      setPriority('medium');
      setStatus('todo');
      setReminderOffset(10);
      setAlarmSound(settings.defaultAlarmSound || 'chime');
      setLocation('');
      setRecurrence('none');
      setTags(['Work']);
      setSubtasks([]);
    }
  }, [editingTask, modalPrefillDate, modalPrefillTime, isTaskModalOpen, settings]);

  if (!isTaskModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: hasTime ? dueTime : undefined,
      durationMinutes,
      priority,
      status,
      completed: status === 'done',
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
      tags,
      reminderOffsetMinutes: hasTime ? reminderOffset : -1,
      alarmSound,
      subtasks,
      recurrence,
      location: location.trim() || undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      createTask(taskPayload);
    }
  };

  const priorityOptions: { id: Priority; label: string; borderClass: string }[] = [
    { id: 'urgent', label: 'Urgent', borderClass: 'border-rose-500 text-rose-300' },
    { id: 'high', label: 'High', borderClass: 'border-amber-500 text-amber-300' },
    { id: 'medium', label: 'Medium', borderClass: 'border-indigo-400 text-indigo-300' },
    { id: 'low', label: 'Low', borderClass: 'border-emerald-400 text-emerald-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-white tracking-tight">
            {editingTask ? 'Edit Task & Schedule' : 'Create New Task & Reminder'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deliverable Sign-off & Architecture Review"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Date, Time & Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400">Time</label>
                <button
                  type="button"
                  onClick={() => setHasTime(!hasTime)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {hasTime ? 'All Day' : 'Add Time'}
                </button>
              </div>
              <input
                type="time"
                disabled={!hasTime}
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Alarm & Reminder Configuration */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <span>Alarm & Reminder Settings</span>
              </span>
              {!hasTime && (
                <span className="text-[11px] text-amber-400">
                  (Requires time to trigger audible alarm)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reminder Offset */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Trigger Reminder
                </label>
                <select
                  disabled={!hasTime}
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                >
                  <option value={0}>At scheduled time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                  <option value={-1}>No alarm reminder</option>
                </select>
              </div>

              {/* Alarm Sound Tone + Preview Button */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Alarm Sound Ringtone
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    disabled={!hasTime || reminderOffset === -1}
                    value={alarmSound}
                    onChange={(e) => setAlarmSound(e.target.value as SoundType)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-40 capitalize"
                  >
                    <option value="chime">Chime (Melodic)</option>
                    <option value="radar">Radar (Urgent alert)</option>
                    <option value="bell">Acoustic Bell (Zen)</option>
                    <option value="digital">Digital (Classic beep)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => testAlarm(alarmSound)}
                    title="Preview sound"
                    className="px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Priority & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {priorityOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setPriority(opt.id)}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-all ${
                      priority === opt.id
                        ? `${opt.borderClass} bg-slate-800 font-semibold shadow-sm`
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekdays">Every weekday (Mon-Fri)</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
              </select>
            </div>
          </div>

          {/* Notes & Location */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Description / Agenda Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key meeting discussion points, documentation links, or execution steps..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Location or Video Link
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Conference Room B or https://meet.google.com/xyz"
                  className="w-full py-2 bg-transparent text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Checklist / Subtasks
              </label>
              {subtasks.length > 0 && (
                <span className="text-[11px] font-mono text-slate-400">
                  {subtasks.filter((s) => s.completed).length} / {subtasks.length} done
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask item and press enter..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-800 text-slate-200 hover:text-white rounded-md text-xs font-medium"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 max-h-36 overflow-y-auto">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between group py-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2 text-xs text-left"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                          st.completed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-700'
                        }`}
                      >
                        {st.completed && '✓'}
                      </span>
                      <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                        {st.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories / Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Categories & Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-indigo-300 rounded text-xs border border-slate-700 font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ New tag"
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 placeholder:text-slate-600 w-24 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
          {editingTask ? (
            <button
              type="button"
              onClick={() => deleteTask(editingTask.id)}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
