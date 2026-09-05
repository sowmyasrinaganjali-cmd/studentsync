import React, { useState } from 'react';
import { AlertCircle, Clock, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReminderBanner: React.FC = () => {
  const { tasks, courses, toggleTaskStatus, snoozeTaskReminder, setActiveTab } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const now = new Date().getTime();
  const courseMap = new Map();
  courses.forEach(c => courseMap.set(c.id, c));

  // Find most urgent pending task
  const mostUrgent = tasks
    .filter(t => t.status !== 'completed')
    .map(t => {
      const due = new Date(t.dueDate).getTime();
      const diffHours = (due - now) / (1000 * 60 * 60);
      return { task: t, diffHours, isOverdue: diffHours < 0 };
    })
    .filter(item => item.isOverdue || item.diffHours <= 6)
    .sort((a, b) => a.diffHours - b.diffHours)[0];

  if (!mostUrgent) return null;

  const { task, diffHours, isOverdue } = mostUrgent;
  const course = courseMap.get(task.courseId);

  return (
    <div
      className={`border-b transition-all ${
        isOverdue
          ? 'bg-rose-500 text-white border-rose-600'
          : 'bg-amber-500 text-slate-900 border-amber-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-full bg-white/20 shrink-0">
            {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          </span>
          <div className="truncate">
            <span className="font-bold uppercase tracking-wider mr-1.5">
              {isOverdue ? 'Overdue Deadline:' : 'Urgent Reminder:'}
            </span>
            <span className="font-bold underline">{task.title}</span>
            {course && <span className="ml-1 opacity-90">({course.code})</span>}
            <span className="ml-2 font-medium opacity-90 hidden sm:inline">
              {isOverdue
                ? `Due was at ${new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : `Due in ${Math.max(1, Math.round(diffHours * 60))} minutes`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className="px-2.5 py-1 bg-white text-slate-900 rounded-lg font-bold text-[11px] hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark Complete</span>
          </button>

          <button
            onClick={() => snoozeTaskReminder(task.id, 60)}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
          >
            Snooze 1h
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors opacity-80 hover:opacity-100"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
