import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  CheckSquare, 
  Bell, 
  ChevronDown, 
  ChevronUp,
  Download,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Task, Course, TaskStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { exportSingleTaskIcs, generateGoogleCalendarUrl } from '../../utils/calendarExport';

interface TaskCardProps {
  task: Task;
  course?: Course;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, course }) => {
  const { 
    toggleTaskStatus, 
    setTaskStatus,
    toggleSubtask, 
    addSubtaskToTask,
    deleteSubtaskFromTask,
    deleteTask, 
    setEditingTask, 
    setActiveModal, 
    snoozeTaskReminder 
  } = useApp();

  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [newStepText, setNewStepText] = useState('');

  const isCompleted = task.status === 'completed';

  // Compute time difference
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isOverdue = !isCompleted && diffHours < 0;
  const isImminent = !isCompleted && diffHours >= 0 && diffHours <= 24;

  const getUrgencyBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Completed
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Overdue
        </span>
      );
    }
    if (isImminent) {
      const hoursLeft = Math.max(1, Math.round(diffHours));
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" />
          Due in {hoursLeft}h
        </span>
      );
    }
    const daysLeft = Math.ceil(diffHours / 24);
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        In {daysLeft} days
      </span>
    );
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getTypeBadgeStyle = () => {
    switch (task.type) {
      case 'project':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-semibold';
      case 'assignment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exam':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-semibold';
      case 'quiz':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'reading':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lab':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'todo':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const completedSubtasksCount = subtasks.filter(s => s.completed).length;
  const totalSubtasksCount = subtasks.length;
  const subtaskProgress = totalSubtasksCount > 0 ? (completedSubtasksCount / totalSubtasksCount) * 100 : 0;

  const handleEdit = () => {
    setEditingTask(task);
    setActiveModal('edit-task');
    setMenuOpen(false);
  };

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateGoogleCalendarUrl(task, course);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleIcsExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportSingleTaskIcs(task, course);
  };

  const handleAddInlineStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    addSubtaskToTask(task.id, newStepText);
    setNewStepText('');
  };

  return (
    <div 
      className={`group relative bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        isCompleted 
          ? 'border-slate-200 bg-slate-50/50 opacity-80' 
          : isOverdue 
            ? 'border-rose-300 bg-rose-50/20' 
            : isImminent 
              ? 'border-amber-300 bg-amber-50/10' 
              : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Completion Toggle */}
          <button
            id={`toggle-task-${task.id}`}
            onClick={() => toggleTaskStatus(task.id)}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
            title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5 group-hover:stroke-indigo-600" />
            )}
          </button>

          {/* Main Task Content */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Course Tag */}
              {course && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${course.accentBg} ${course.textColor} border ${course.borderColor}`}>
                  {course.code}
                </span>
              )}

              {/* Task Type */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border capitalize ${getTypeBadgeStyle()}`}>
                {task.type}
              </span>

              {/* Priority */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border capitalize ${getPriorityStyle()}`}>
                {task.priority}
              </span>

              {/* Status Switcher Chip */}
              <select
                value={task.status}
                onChange={e => setTaskStatus(task.id, e.target.value as TaskStatus)}
                className={`text-[11px] font-semibold rounded-md px-1.5 py-0.5 border cursor-pointer focus:outline-hidden transition-colors ${
                  task.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : task.status === 'in_progress'
                      ? 'bg-sky-50 text-sky-700 border-sky-200 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Done</option>
              </select>

              {/* Urgency / Due Time relative */}
              {getUrgencyBadge()}
            </div>

            {/* Title */}
            <h3 className={`text-base font-bold text-slate-900 leading-snug break-words ${isCompleted ? 'line-through text-slate-500 font-medium' : ''}`}>
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Due Date & Estimated Duration */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })} at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {task.estimatedMinutes > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est: {task.estimatedMinutes >= 60 ? `${Math.floor(task.estimatedMinutes / 60)}h ${task.estimatedMinutes % 60 ? `${task.estimatedMinutes % 60}m` : ''}` : `${task.estimatedMinutes}m`}</span>
                </div>
              )}

              {task.reminderOffsetMinutes && !isCompleted && (
                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md text-[11px] font-medium">
                  <Bell className="w-3 h-3" />
                  <span>Alert {task.reminderOffsetMinutes >= 1440 ? `${task.reminderOffsetMinutes / 1440}d` : `${task.reminderOffsetMinutes / 60}h`} before</span>
                </div>
              )}
            </div>

            {/* Subtasks / Checklist */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>To-Do Checklist ({completedSubtasksCount}/{totalSubtasksCount})</span>
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {totalSubtasksCount > 0 && (
                  <span className="text-[11px] font-semibold text-slate-600">{Math.round(subtaskProgress)}%</span>
                )}
              </div>
              
              {totalSubtasksCount > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${subtaskProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              )}

              {/* Expanded Subtask items & Quick Add */}
              {expanded && (
                <div className="mt-2.5 space-y-2 pl-1 border-l-2 border-indigo-100">
                  {subtasks.map(st => (
                    <div 
                      key={st.id} 
                      className="flex items-center justify-between gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded-sm"
                    >
                      <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleSubtask(task.id, st.id)}
                          className="rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className={`break-words ${st.completed ? 'line-through text-slate-400' : ''}`}>
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteSubtaskFromTask(task.id, st.id)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 rounded-sm transition-colors cursor-pointer shrink-0"
                        title="Delete this step"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Inline quick add step form */}
                  <form onSubmit={handleAddInlineStep} className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newStepText}
                      onChange={e => setNewStepText(e.target.value)}
                      placeholder="+ Add to-do step..."
                      className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:bg-white focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Right corner) */}
          <div className="relative shrink-0 flex items-center gap-1">
            {/* Google Calendar Link */}
            <button
              onClick={handleGoogleCalendar}
              title="Add this task to Google Calendar"
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Single Task ICS Download */}
            <button
              onClick={handleIcsExport}
              title="Download .ics event file"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Card Menu dropdown toggle */}
            <div className="relative">
              <button
                id={`task-menu-${task.id}`}
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Task</span>
                    </button>

                    <button
                      onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                        <span>Snooze</span>
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showSnoozeMenu && (
                      <div className="bg-slate-50 border-y border-slate-100 py-1">
                        <button
                          onClick={() => {
                            snoozeTaskReminder(task.id, 60);
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-1 text-left text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                        >
                          + 1 Hour
                        </button>
                        <button
                          onClick={() => {
                            snoozeTaskReminder(task.id, 1440);
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-1 text-left text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                        >
                          + 1 Day
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        handleGoogleCalendar(e);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Google Calendar</span>
                    </button>

                    <button
                      onClick={(e) => {
                        handleIcsExport(e);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download .ics</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        deleteTask(task.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Task</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

