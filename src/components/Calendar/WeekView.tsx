import React from 'react';
import { Course, Task } from '../../types';
import { Clock, Plus, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';

interface WeekViewProps {
  currentDate: Date;
  tasks: Task[];
  courses: Course[];
  onAddTaskOnDate: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  tasks,
  courses,
  onAddTaskOnDate,
}) => {
  const courseMap = new Map<string, Course>();
  courses.forEach(c => courseMap.set(c.id, c));

  // Compute start of week (Sunday)
  const curr = new Date(currentDate);
  const dayOfWeek = curr.getDay();
  const startOfWeek = new Date(curr);
  startOfWeek.setDate(curr.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      dateObj: d,
      dateStr: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[460px]">
        {weekDays.map(day => {
          const dayTasks = tasks.filter(t => t.dueDate.startsWith(day.dateStr));

          return (
            <div key={day.dateStr} className="flex flex-col bg-white">
              {/* Day column header */}
              <div className={`p-3 text-center border-b border-slate-100 ${day.isToday ? 'bg-indigo-50/60' : 'bg-slate-50/50'}`}>
                <div className="text-xs font-semibold text-slate-500">{day.dayName}</div>
                <div
                  className={`w-7 h-7 mx-auto mt-1 flex items-center justify-center rounded-full text-sm font-bold ${
                    day.isToday ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-800'
                  }`}
                >
                  {day.dayNumber}
                </div>
              </div>

              {/* Day task list */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[500px]">
                {dayTasks.map(task => {
                  const course = courseMap.get(task.courseId);
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-2 rounded-xl border text-xs transition-all shadow-2xs group ${
                        isCompleted
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through opacity-70'
                          : task.type === 'exam'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : course
                              ? `${course.accentBg} ${course.borderColor} text-slate-800`
                              : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase text-slate-600">
                          {course?.code || task.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-900 leading-tight mb-2">
                        {task.title}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/40">
                        <span>{task.estimatedMinutes}m est</span>
                        <a
                          href={generateGoogleCalendarUrl(task, course)}
                          target="_blank"
                          rel="noreferrer"
                          title="Add to Google Calendar"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}

                {dayTasks.length === 0 && (
                  <div className="h-28 flex items-center justify-center text-center p-2 text-slate-300 text-xs">
                    No deadlines
                  </div>
                )}

                <button
                  onClick={() => onAddTaskOnDate(`${day.dateStr}T15:00`)}
                  className="w-full py-1.5 border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-slate-400 hover:text-indigo-600 text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
