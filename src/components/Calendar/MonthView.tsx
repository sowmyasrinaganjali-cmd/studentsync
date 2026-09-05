import React from 'react';
import { Course, Task } from '../../types';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  courses: Course[];
  onSelectDate: (date: Date) => void;
  onAddTaskOnDate: (dateStr: string) => void;
  selectedDate: Date;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  tasks,
  courses,
  onSelectDate,
  onAddTaskOnDate,
  selectedDate,
}) => {
  const courseMap = new Map<string, Course>();
  courses.forEach(c => courseMap.set(c.id, c));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month and total days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { dayNumber: number; isCurrentMonth: boolean; dateObj: Date; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, d);
    days.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateObj,
      dateStr: dateObj.toISOString().slice(0, 10),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      dateObj,
      dateStr: dateObj.toISOString().slice(0, 10),
    });
  }

  // Next month leading days to fill 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const dateObj = new Date(year, month + 1, i);
    days.push({
      dayNumber: i,
      isCurrentMonth: false,
      dateObj,
      dateStr: dateObj.toISOString().slice(0, 10),
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedStr = selectedDate.toISOString().slice(0, 10);

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach(t => {
    const dateKey = t.dueDate.slice(0, 10);
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, []);
    }
    tasksByDate.get(dateKey)!.push(t);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-2.5">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {days.map((d, index) => {
          const dayTasks = tasksByDate.get(d.dateStr) || [];
          const isToday = d.dateStr === todayStr;
          const isSelected = d.dateStr === selectedStr;

          return (
            <div
              key={index}
              onClick={() => onSelectDate(d.dateObj)}
              className={`min-h-[105px] p-1.5 sm:p-2 transition-colors cursor-pointer flex flex-col group relative ${
                !d.isCurrentMonth
                  ? 'bg-slate-50/40 text-slate-400'
                  : isSelected
                    ? 'bg-indigo-50/30'
                    : 'bg-white hover:bg-slate-50/70'
              }`}
            >
              {/* Day header with date and quick add button */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isSelected
                        ? 'bg-slate-800 text-white'
                        : d.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                  }`}
                >
                  {d.dayNumber}
                </span>

                {/* Hover Add Task Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTaskOnDate(`${d.dateStr}T17:00`);
                  }}
                  title="Add task on this date"
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List for Day */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => {
                  const course = courseMap.get(task.courseId);
                  const isCompleted = task.status === 'completed';
                  const isExam = task.type === 'exam';

                  return (
                    <div
                      key={task.id}
                      title={`${task.title} (${course?.code || ''}) - ${task.status}`}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate border flex items-center gap-1 ${
                        isCompleted
                          ? 'line-through text-slate-400 bg-slate-100 border-slate-200 opacity-60'
                          : isExam
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : course
                              ? `${course.accentBg} ${course.textColor} ${course.borderColor}`
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isExam ? 'bg-rose-500' : isCompleted ? 'bg-slate-400' : 'bg-indigo-500'
                      }`} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <div className="text-[10px] font-bold text-slate-500 px-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
