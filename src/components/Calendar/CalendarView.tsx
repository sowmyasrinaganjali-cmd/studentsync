import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Download, 
  Upload, 
  Plus, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { AgendaView } from './AgendaView';
import { exportTasksToIcs, generateGoogleCalendarUrl } from '../../utils/calendarExport';

export const CalendarView: React.FC = () => {
  const { 
    tasks, 
    courses, 
    toggleTaskStatus, 
    setActiveModal, 
    setEditingTask 
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 5)); // Sep 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 5));
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'agenda'>('month');

  const courseMap = new Map();
  courses.forEach(c => courseMap.set(c.id, c));

  // Upcoming major exams
  const upcomingExams = tasks
    .filter(t => t.type === 'exam' && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (calendarMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (calendarMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleAddTaskOnDate = (dateStr: string) => {
    setEditingTask({
      id: '',
      title: '',
      description: '',
      courseId: courses[0]?.id || '',
      type: 'assignment',
      priority: 'medium',
      dueDate: dateStr,
      estimatedMinutes: 60,
      status: 'todo',
      subtasks: [],
      reminderOffsetMinutes: 60,
      tags: [],
      createdAt: new Date().toISOString(),
    });
    setActiveModal('create-task');
  };

  // Selected date's tasks
  const selectedDateStr = selectedDate.toISOString().slice(0, 10);
  const selectedDateTasks = tasks.filter(t => t.dueDate.startsWith(selectedDateStr));

  return (
    <div className="space-y-6">
      {/* Calendar Header with navigation & integration buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Month/Year Title & Controls */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-slate-500">
              {tasks.length} scheduled student events & deadlines
            </p>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode & Calendar Sync buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'agenda' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Sync & Export actions */}
          <button
            onClick={() => exportTasksToIcs(tasks, courses, 'my-study-calendar.ics')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Download full schedule as .ics for Google Calendar or Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Calendar</span>
          </button>

          <button
            onClick={() => setActiveModal('import-ics')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Import course syllabus or calendar file (.ics)"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Syllabus</span>
          </button>
        </div>
      </div>

      {/* Main Calendar + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calendar Core (3 cols) */}
        <div className="lg:col-span-3">
          {calendarMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              tasks={tasks}
              courses={courses}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onAddTaskOnDate={handleAddTaskOnDate}
            />
          )}

          {calendarMode === 'week' && (
            <WeekView
              currentDate={currentDate}
              tasks={tasks}
              courses={courses}
              onAddTaskOnDate={handleAddTaskOnDate}
            />
          )}

          {calendarMode === 'agenda' && (
            <AgendaView
              tasks={tasks}
              courses={courses}
              onToggleTask={toggleTaskStatus}
            />
          )}
        </div>

        {/* Sidebar (1 col): Selected Day Inspector & Exam Countdown */}
        <div className="space-y-5">
          
          {/* Selected Date Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daily Inspector
                </h3>
                <div className="text-sm font-black text-slate-900">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <button
                onClick={() => handleAddTaskOnDate(`${selectedDateStr}T17:00`)}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Add task on this day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List for day */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {selectedDateTasks.map(task => {
                const course = courseMap.get(task.courseId);
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      isCompleted ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      {course && (
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${course.accentBg} ${course.textColor}`}>
                          {course.code}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`font-semibold text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {isCompleted ? 'Mark Pending' : 'Mark Done'}
                      </button>
                      <a
                        href={generateGoogleCalendarUrl(task, course)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <span>Google Cal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}

              {selectedDateTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No deadlines scheduled on this date.
                </div>
              )}
            </div>
          </div>

          {/* Major Exam Countdown Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Exam Countdown
                </h3>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {upcomingExams.length} Upcoming
              </span>
            </div>

            {upcomingExams.length > 0 ? (
              upcomingExams.slice(0, 2).map(exam => {
                const examDate = new Date(exam.dueDate);
                const diffDays = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const course = courseMap.get(exam.courseId);

                return (
                  <div key={exam.id} className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300">{course?.code || 'Exam'}</span>
                      <span className="font-extrabold text-amber-300">
                        {diffDays <= 0 ? 'Today!' : `${diffDays} days away`}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white line-clamp-1">{exam.title}</div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{examDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-300 py-3 text-center">
                No imminent exams. Great time to catch up on assignments!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
