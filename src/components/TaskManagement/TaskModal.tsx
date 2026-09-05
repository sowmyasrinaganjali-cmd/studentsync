import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  BookOpen, 
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
  ListTodo,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, Task, TaskStatus, TaskType } from '../../types';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';
import { COURSE_COLOR_PALETTES } from '../../utils/courseThemes';

export const TaskModal: React.FC = () => {
  const { 
    courses, 
    addCourse,
    addTask, 
    updateTask, 
    activeModal, 
    setActiveModal, 
    editingTask, 
    setEditingTask 
  } = useApp();

  const isOpen = activeModal === 'create-task' || activeModal === 'edit-task';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState<TaskType>('assignment');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState(60);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  // Inline Quick Add Course State
  const [showQuickAddCourse, setShowQuickAddCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('indigo');
  const [courseError, setCourseError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCourseId(editingTask.courseId);
      setType(editingTask.type);
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
      setEstimatedMinutes(editingTask.estimatedMinutes || 60);
      setReminderOffsetMinutes(editingTask.reminderOffsetMinutes || 60);
      setSubtasks(editingTask.subtasks || []);
    } else {
      // Default: tomorrow 18:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      const formattedDefault = tomorrow.toISOString().slice(0, 16);

      setTitle('');
      setDescription('');
      setCourseId(courses[0]?.id || '');
      setType('assignment');
      setStatus('todo');
      setPriority('medium');
      setDueDate(formattedDefault);
      setEstimatedMinutes(60);
      setReminderOffsetMinutes(60);
      setSubtasks([]);
    }
    setShowQuickAddCourse(false);
    setErrors({});
  }, [editingTask, courses, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveModal(null);
    setEditingTask(null);
    setShowQuickAddCourse(false);
  };

  const handleQuickCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) {
      setCourseError('Please enter both subject code and name');
      return;
    }

    const created = addCourse({
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      color: newCourseColor,
    });

    setCourseId(created.id);
    setNewCourseCode('');
    setNewCourseName('');
    setShowQuickAddCourse(false);
    setCourseError('');
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: 'sub-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  // Preset checklist templates
  const applyTemplate = (templateType: 'assignment' | 'project' | 'exam' | 'reading') => {
    let items: string[] = [];
    if (templateType === 'project') {
      items = [
        'Define project scope & objectives',
        'Literature review / research gather',
        'Draft architecture & initial outline',
        'Produce prototype / first draft',
        'Refine & incorporate peer feedback',
        'Final polish & deliverable submission',
      ];
    } else if (templateType === 'assignment') {
      items = [
        'Review problem statement & rubric',
        'Draft solution / initial answers',
        'Check edge cases and calculations',
        'Format and upload final file',
      ];
    } else if (templateType === 'exam') {
      items = [
        'Review core lecture notes & slides',
        'Create key concept flashcards',
        'Complete practice / past exam problems',
        'Clarify doubts during study group/office hours',
      ];
    } else if (templateType === 'reading') {
      items = [
        'Skim chapter headings & summaries',
        'Read assigned pages actively',
        'Take notes on key definitions & arguments',
      ];
    }

    const newItems = items.map(text => ({
      id: 'sub-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: text,
      completed: false,
    }));

    setSubtasks([...subtasks, ...newItems]);
  };

  // Due date shortcut helpers
  const setQuickDueDate = (preset: 'today' | 'tomorrow' | 'friday' | 'nextWeek') => {
    const d = new Date();
    if (preset === 'today') {
      d.setHours(23, 59, 0, 0);
    } else if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
    } else if (preset === 'friday') {
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(23, 59, 0, 0);
    } else if (preset === 'nextWeek') {
      d.setDate(d.getDate() + 7);
      d.setHours(18, 0, 0, 0);
    }
    setDueDate(d.toISOString().slice(0, 16));
    if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; dueDate?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedCourseId = courseId || courses[0]?.id || 'general';

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim(),
        courseId: resolvedCourseId,
        type,
        status,
        priority,
        dueDate,
        estimatedMinutes: Number(estimatedMinutes),
        reminderOffsetMinutes: Number(reminderOffsetMinutes),
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        courseId: resolvedCourseId,
        type,
        status,
        priority,
        dueDate,
        estimatedMinutes: Number(estimatedMinutes),
        subtasks,
        reminderOffsetMinutes: Number(reminderOffsetMinutes),
        tags: [type],
      });
    }

    handleClose();
  };

  const handleSaveAndSyncGoogle = (e: React.FormEvent) => {
    handleSubmit(e);
    const mockTask: Task = {
      id: 'preview',
      title: title.trim(),
      description: description.trim(),
      courseId: courseId || courses[0]?.id || 'general',
      type,
      priority,
      dueDate,
      estimatedMinutes,
      status,
      subtasks,
      reminderOffsetMinutes,
      tags: [],
      createdAt: new Date().toISOString(),
    };
    const course = courses.find(c => c.id === courseId);
    const url = generateGoogleCalendarUrl(mockTask, course);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Task & Assignment' : 'Create Task / Assignment / Project'}
              </h2>
              <p className="text-xs text-slate-500">
                Manually configure deadlines, course subject, and checklist milestones
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task or Assignment Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="e.g. Research Paper: Sustainable Urban Infrastructure"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.title ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Course & Type row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Course / Subject
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddCourse(!showQuickAddCourse)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showQuickAddCourse ? 'Hide' : '+ New Subject'}</span>
                </button>
              </div>

              <select
                id="task-course-select"
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                id="task-type-select"
                value={type}
                onChange={e => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 capitalize"
              >
                <option value="assignment">Assignment</option>
                <option value="project">Project / Paper</option>
                <option value="todo">To-Do / Task</option>
                <option value="homework">Homework</option>
                <option value="exam">Exam / Midterm</option>
                <option value="quiz">Quiz</option>
                <option value="reading">Reading</option>
                <option value="lab">Lab Report</option>
                <option value="presentation">Presentation</option>
                <option value="study">Study Session</option>
              </select>
            </div>
          </div>

          {/* Quick Add Course Inline Box (if toggled) */}
          {showQuickAddCourse && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Add New Subject Directly</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickAddCourse(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. BIO 101)"
                  value={newCourseCode}
                  onChange={e => setNewCourseCode(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Name (e.g. Molecular Biology)"
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['indigo', 'violet', 'cyan', 'emerald', 'amber', 'rose', 'blue', 'orange'].map(cKey => (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setNewCourseColor(cKey)}
                      className={`w-5 h-5 rounded-full border transition-all ${
                        COURSE_COLOR_PALETTES[cKey]?.dotBg || 'bg-indigo-500'
                      } ${newCourseColor === cKey ? 'ring-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleQuickCreateCourse}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
              {courseError && <p className="text-[10px] text-rose-600">{courseError}</p>}
            </div>
          )}

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 capitalize"
              >
                <option value="todo">To-Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 capitalize"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Due Date & Time *
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Quick:</span>
                <button
                  type="button"
                  onClick={() => setQuickDueDate('today')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                >
                  Tonight
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueDate('tomorrow')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueDate('friday')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                >
                  Friday
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueDate('nextWeek')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                >
                  +1 Week
                </button>
              </div>
            </div>

            <input
              id="task-duedate-input"
              type="datetime-local"
              value={dueDate}
              onChange={e => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
              }}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.dueDate ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Estimated duration & Reminder Alert offset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Study Time (mins)</span>
              </label>
              <input
                id="task-duration-input"
                type="number"
                min="5"
                step="15"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Reminder Alert</span>
              </label>
              <select
                id="task-reminder-offset-select"
                value={reminderOffsetMinutes}
                onChange={e => setReminderOffsetMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
              >
                <option value={15}>15 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
                <option value={1440}>1 day before</option>
                <option value={2880}>2 days before</option>
                <option value={0}>At due date/time</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Instructions & Notes
            </label>
            <textarea
              id="task-description-input"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Rubric requirements, chapters to read, questions to ask instructor..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Subtasks / To-Dos Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                <span>To-Do Checklist & Milestones ({subtasks.length})</span>
              </label>
              
              {/* Template shortcuts */}
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Templates:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('project')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                  title="Add project milestones"
                >
                  Project
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('assignment')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                  title="Add assignment steps"
                >
                  Assignment
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('exam')}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700"
                  title="Add exam prep checklist"
                >
                  Exam
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {subtasks.map(st => (
                <div 
                  key={st.id} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                    st.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className="text-slate-400 hover:text-indigo-600 shrink-0"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span className={`flex-1 break-words ${st.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a step (e.g. Write Introduction, Run Unit Tests)..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubtask()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveAndSyncGoogle}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Save task and open in Google Calendar"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Save & Sync to Google Calendar</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-task-btn"
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
