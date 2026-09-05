import React from 'react';
import { Course, Task } from '../../types';
import { Clock, Calendar as CalendarIcon, ExternalLink, Download, CheckCircle2, Circle } from 'lucide-react';
import { generateGoogleCalendarUrl, exportSingleTaskIcs } from '../../utils/calendarExport';

interface AgendaViewProps {
  tasks: Task[];
  courses: Course[];
  onToggleTask: (taskId: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ tasks, courses, onToggleTask }) => {
  const courseMap = new Map<string, Course>();
  courses.forEach(c => courseMap.set(c.id, c));

  // Sort upcoming
  const sorted = [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Group by date string (e.g. "Monday, Sep 7, 2026")
  const grouped = new Map<string, Task[]>();
  sorted.forEach(t => {
    const d = new Date(t.dueDate);
    const dateLabel = d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!grouped.has(dateLabel)) {
      grouped.set(dateLabel, []);
    }
    grouped.get(dateLabel)!.push(t);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
      {Array.from(grouped.entries()).map(([dateLabel, dayTasks]) => {
        const isToday = new Date(dayTasks[0].dueDate).toDateString() === new Date().toDateString();

        return (
          <div key={dateLabel} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">{dateLabel}</h3>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  Today
                </span>
              )}
            </div>

            <div className="space-y-2">
              {dayTasks.map(task => {
                const course = courseMap.get(task.courseId);
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {course && (
                            <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${course.accentBg} ${course.textColor} border ${course.borderColor}`}>
                              {course.code}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-semibold text-slate-500">
                            {task.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className={`text-xs sm:text-sm font-semibold text-slate-800 truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {task.estimatedMinutes}m est
                      </span>
                      <a
                        href={generateGoogleCalendarUrl(task, course)}
                        target="_blank"
                        rel="noreferrer"
                        title="Add to Google Calendar"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => exportSingleTaskIcs(task, course)}
                        title="Download .ics event"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No scheduled items in your academic calendar.
        </div>
      )}
    </div>
  );
};
