import React from 'react';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Users, 
  Bell, 
  Plus, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Search,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportTasksToIcs } from '../utils/calendarExport';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    soundEnabled,
    setSoundEnabled,
    upcomingRemindersCount,
    setShowReminderDrawer,
    setActiveModal,
    tasks,
    courses,
    stats,
  } = useApp();

  const handleExportSchedule = () => {
    exportTasksToIcs(tasks, courses, 'academic-schedule.ics');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">StudySync</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Student Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">Tasks, Calendar & Group Study</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="tab-tasks-btn"
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tasks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Tasks & Deadlines</span>
              {stats.pending > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              id="tab-calendar-btn"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span>Academic Calendar</span>
            </button>

            <button
              id="tab-groups-btn"
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'groups'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-violet-600" />
              <span>Group Study Hub</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              id="tab-reminders-btn"
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'reminders'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Reminders</span>
              {upcomingRemindersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {upcomingRemindersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes, courses..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              id="toggle-sound-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* iCal export & import actions */}
            <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-2">
              <button
                id="export-calendar-btn"
                onClick={handleExportSchedule}
                title="Export schedule to .ics (Google Calendar / Outlook / Apple)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export .ics</span>
              </button>

              <button
                id="import-calendar-btn"
                onClick={() => setActiveModal('import-ics')}
                title="Import course syllabus or calendar (.ics)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import</span>
              </button>
            </div>

            {/* Reminder Bell Quick Trigger */}
            <button
              id="reminder-bell-btn"
              onClick={() => setShowReminderDrawer(true)}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="View active reminders"
            >
              <Bell className="w-5 h-5" />
              {upcomingRemindersCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {upcomingRemindersCount}
                </span>
              )}
            </button>

            {/* New Task Button */}
            <button
              id="add-task-top-btn"
              onClick={() => {
                setActiveModal('create-task');
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'calendar' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'groups' ? 'bg-violet-50 text-violet-700' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Study Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'reminders' ? 'bg-amber-50 text-amber-700' : 'text-slate-600'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Reminders</span>
          </button>
        </div>
      </div>
    </header>
  );
};
