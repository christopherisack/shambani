import React, { useState } from 'react';
import {
  X,
  Volume2,
  Bell,
  Clock,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { SoundType } from '../types/task';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    settings,
    updateSettings,
    testAlarm,
    requestNotificationPermission,
    exportCalendarICal,
    exportTasksJSON,
    importTasksJSON,
    resetToSampleData,
  } = useTaskContext();

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isSettingsModalOpen) return null;

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('Notification permissions were not granted or are blocked by browser settings.');
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importTasksJSON(importText);
    if (ok) {
      setImportStatus('Successfully imported tasks!');
      setImportText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Error: Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-white tracking-tight">
            Calendar & Alarm Preferences
          </h2>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sound & Alarm Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Audio Synthesis Engine</span>
            </div>

            {/* Sound Toggle & Volume Slider */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Audible Alarm Sounds</div>
                  <div className="text-[11px] text-slate-500">Play tone when task reminder triggers</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Alarm Volume</span>
                  <span className="font-mono text-slate-200">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Default Sound Ringtone */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Default Alarm Tone</span>
                <div className="flex items-center gap-2">
                  <select
                    value={settings.defaultAlarmSound}
                    onChange={(e) => updateSettings({ defaultAlarmSound: e.target.value as SoundType })}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-xs capitalize"
                  >
                    <option value="chime">Chime</option>
                    <option value="radar">Radar</option>
                    <option value="bell">Acoustic Bell</option>
                    <option value="digital">Digital Beep</option>
                  </select>
                  <button
                    onClick={() => testAlarm(settings.defaultAlarmSound)}
                    className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 hover:text-white rounded-md"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Browser Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Desktop Notifications</span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-200">System Notification Banners</div>
                <div className="text-[11px] text-slate-500">
                  {typeof window !== 'undefined' && 'Notification' in window
                    ? Notification.permission === 'granted'
                      ? 'Status: Granted & Active'
                      : Notification.permission === 'denied'
                      ? 'Status: Blocked in browser settings'
                      : 'Status: Permission not requested'
                    : 'Not supported in this browser'}
                </div>
              </div>

              <button
                onClick={handleRequestNotifications}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          </div>

          {/* Time & Calendar Format */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Display & Time Preferences</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="block text-xs text-slate-400 mb-1.5">Time Display Format</span>
                <div className="flex rounded-md bg-slate-900 p-0.5 border border-slate-800">
                  <button
                    onClick={() => updateSettings({ timeFormat: '12h' })}
                    className={`flex-1 py-1 text-xs font-medium rounded ${
                      settings.timeFormat === '12h' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    12-Hour (AM/PM)
                  </button>
                  <button
                    onClick={() => updateSettings({ timeFormat: '24h' })}
                    className={`flex-1 py-1 text-xs font-medium rounded ${
                      settings.timeFormat === '24h' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    24-Hour
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="block text-xs text-slate-400 mb-1.5">Default Task Duration</span>
                <select
                  value={settings.defaultDuration}
                  onChange={(e) => updateSettings({ defaultDuration: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 text-xs"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Export & Backup */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Data Export & Sync</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exportCalendarICal}
                className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-colors group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                  Export to iCal (.ics)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Import into Apple, Google, or Outlook Calendar
                </div>
              </button>

              <button
                onClick={exportTasksJSON}
                className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-colors group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                  Backup Tasks (JSON)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Full offline raw data backup
                </div>
              </button>
            </div>

            {/* Quick import paste box */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
              <span className="block text-xs font-medium text-slate-300">
                Restore Tasks from JSON
              </span>
              <textarea
                rows={2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste backup JSON string here..."
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleImport}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
                >
                  Import & Merge
                </button>
                {importStatus && (
                  <span className="text-xs text-indigo-400 font-mono">{importStatus}</span>
                )}
              </div>
            </div>

            {/* Reset to initial sample tasks */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (confirm('Reset tasks to initial sample executive schedule?')) {
                    resetToSampleData();
                    setIsSettingsModalOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Sample Schedule Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-end shrink-0">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
