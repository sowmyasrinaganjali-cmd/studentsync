import React from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';
import { sounds } from '../../utils/audio';

export const ReminderDrawer: React.FC = () => {
  const { 
    showReminderDrawer, 
    setShowReminderDrawer, 
    tasks, 
    courses, 
    toggleTaskStatus, 
    snoozeTaskReminder, 
    requestDesktopNotifications, 
    notificationPermission 
  } = useApp();

  if (!showReminderDrawer) return null;

  const courseMap = new Map();
  courses.forEach(c => courseMap.set(c.id, c));

  const now = new Date().getTime();

  // Filter tasks that need attention: overdue, due today, or due in 48 hours
  const activeAlerts = tasks
    .filter(t => t.status !== 'completed')
    .map(t => {
      const due = new Date(t.dueDate).getTime();
      const diffMinutes = Math.round((due - now) / 60000);
      const isOverdue = diffMinutes < 0;
      return {
        task: t,
        course: courseMap.get(t.courseId),
        diffMinutes,
        isOverdue,
      };
    })
    .sort((a, b) => a.diffMinutes - b.diffMinutes);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity" 
        onClick={() => setShowReminderDrawer(false)} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Active Reminders & Alerts</h2>
                <p className="text-xs text-slate-500">
                  {activeAlerts.length} upcoming deadlines
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReminderDrawer(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop notifications prompt if not granted */}
          {notificationPermission !== 'granted' && (
            <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">Enable Desktop Notifications</p>
                <p className="text-amber-700 mt-0.5">
                  Receive browser notifications right before your assignments and study sessions are due.
                </p>
                <button
                  onClick={requestDesktopNotifications}
                  className="mt-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  Allow Notifications
                </button>
              </div>
            </div>
          )}

          {/* Alert list */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {activeAlerts.map(({ task, course, diffMinutes, isOverdue }) => {
              const diffHours = Math.round(diffMinutes / 60);

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-50/40 border-rose-200'
                      : diffMinutes <= 1440
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {course && (
                      <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${course.accentBg} ${course.textColor}`}>
                        {course.code}
                      </span>
                    )}

                    <span
                      className={`text-[11px] font-bold ${
                        isOverdue
                          ? 'text-rose-600'
                          : diffMinutes <= 180
                            ? 'text-amber-600'
                            : 'text-slate-500'
                      }`}
                    >
                      {isOverdue
                        ? `Overdue by ${Math.abs(diffHours)}h`
                        : diffMinutes <= 60
                          ? `Due in ${diffMinutes}m`
                          : diffHours <= 24
                            ? `Due in ${diffHours}h`
                            : `Due in ${Math.ceil(diffHours / 24)} days`}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h4>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => snoozeTaskReminder(task.id, 60)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        +1h Snooze
                      </button>
                      <button
                        onClick={() => snoozeTaskReminder(task.id, 1440)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        +1d Snooze
                      </button>
                    </div>

                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {activeAlerts.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active deadline alerts! You are ahead of schedule.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => sounds.playReminderAlert()}
              className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio Chime</span>
            </button>
            <span className="text-[11px]">Syncs automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
};
