import React from 'react';
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Calendar as CalendarIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';
import { sounds } from '../../utils/audio';

export const RemindersView: React.FC = () => {
  const { 
    tasks, 
    courses, 
    toggleTaskStatus, 
    snoozeTaskReminder, 
    soundEnabled, 
    setSoundEnabled, 
    notificationPermission, 
    requestDesktopNotifications 
  } = useApp();

  const courseMap = new Map();
  courses.forEach(c => courseMap.set(c.id, c));

  const now = new Date().getTime();

  // Categorize
  const overdueTasks: typeof tasks = [];
  const dueTodayTasks: typeof tasks = [];
  const dueSoonTasks: typeof tasks = [];

  tasks.forEach(t => {
    if (t.status === 'completed') return;
    const due = new Date(t.dueDate).getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      overdueTasks.push(t);
    } else if (diffHours <= 24) {
      dueTodayTasks.push(t);
    } else if (diffHours <= 72) {
      dueSoonTasks.push(t);
    }
  });

  return (
    <div className="space-y-6">
      {/* Settings / Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Deadline Reminders & Audio Alerts</h2>
              <p className="text-xs text-slate-500">
                Configure notification chimes, desktop alerts, and snooze intervals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio chime toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                soundEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Chimes Active' : 'Chimes Muted'}</span>
            </button>

            {/* Test Audio Button */}
            <button
              onClick={() => sounds.playReminderAlert()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Test Chime Tone
            </button>

            {/* Desktop notification button */}
            {notificationPermission !== 'granted' ? (
              <button
                onClick={requestDesktopNotifications}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Enable Desktop Alerts
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Desktop Alerts Allowed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Section if any */}
      {overdueTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">
              Overdue Tasks ({overdueTasks.length})
            </h3>
          </div>

          <div className="space-y-2">
            {overdueTasks.map(task => {
              const course = courseMap.get(task.courseId);

              return (
                <div
                  key={task.id}
                  className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {course && (
                        <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${course.accentBg} ${course.textColor}`}>
                          {course.code}
                        </span>
                      )}
                      <span className="text-xs font-bold text-rose-600">Past Due</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scheduled for {new Date(task.dueDate).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => snoozeTaskReminder(task.id, 60)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                    >
                      +1h Snooze
                    </button>
                    <button
                      onClick={() => snoozeTaskReminder(task.id, 1440)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                    >
                      +1d Snooze
                    </button>
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Due Today / In Next 24 Hours ({dueTodayTasks.length})
          </h3>
        </div>

        <div className="space-y-2">
          {dueTodayTasks.map(task => {
            const course = courseMap.get(task.courseId);

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 hover:border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {course && (
                      <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${course.accentBg} ${course.textColor}`}>
                        {course.code}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-amber-700">Due Today</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Est: {task.estimatedMinutes} mins
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={generateGoogleCalendarUrl(task, course)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Add to Google Calendar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => snoozeTaskReminder(task.id, 60)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    +1h Snooze
                  </button>
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Complete
                  </button>
                </div>
              </div>
            );
          })}

          {dueTodayTasks.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No tasks due today. You are in good shape!
            </div>
          )}
        </div>
      </div>

      {/* Due in 48-72 Hours */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Coming Up This Week ({dueSoonTasks.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dueSoonTasks.map(task => {
            const course = courseMap.get(task.courseId);

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {course && (
                      <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${course.accentBg} ${course.textColor}`}>
                        {course.code}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{task.title}</h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">{task.estimatedMinutes}m est</span>
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
