import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Inbox
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CourseFilter } from './CourseFilter';
import { TaskStatsBar } from './TaskStatsBar';
import { TaskCard } from './TaskCard';
import { Task } from '../../types';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    courses, 
    selectedCourseFilter, 
    selectedStatusFilter, 
    searchQuery, 
    setActiveModal 
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'course'>('dueDate');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Course filter
      if (selectedCourseFilter !== 'all' && task.courseId !== selectedCourseFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'all' && task.status !== selectedStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const course = courses.find(c => c.id === task.courseId);
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description.toLowerCase().includes(query);
        const matchCourse = course ? (course.name.toLowerCase().includes(query) || course.code.toLowerCase().includes(query)) : false;
        const matchTags = task.tags.some(t => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchCourse && !matchTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      }
      if (sortBy === 'course') {
        return a.courseId.localeCompare(b.courseId);
      }
      return 0;
    });
  }, [tasks, courses, selectedCourseFilter, selectedStatusFilter, searchQuery, sortBy]);

  const courseMap = useMemo(() => {
    const map = new Map();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  // Board columns
  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Top Banner / Course Selector */}
      <CourseFilter />

      {/* Stats and view controls */}
      <TaskStatsBar viewMode={viewMode} setViewMode={setViewMode} />

      {/* Sorting bar & Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <div className="font-semibold text-slate-700">
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'dueDate' | 'priority' | 'course')}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="dueDate">Due Date (Soonest)</option>
            <option value="priority">Priority (Urgent first)</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {searchQuery
              ? `No assignments or deadlines match "${searchQuery}". Try clearing filters.`
              : 'You have no tasks in this view. Add your next assignment or exam to stay on schedule!'}
          </p>
          <button
            onClick={() => setActiveModal('create-task')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              course={courseMap.get(task.courseId)} 
            />
          ))}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* To Do Column */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">To Do</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200">
                {todoTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {todoTasks.map(task => (
                <TaskCard key={task.id} task={task} course={courseMap.get(task.courseId)} />
              ))}
              {todoTasks.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No to-do tasks
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-indigo-700 border border-indigo-200">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(task => (
                <TaskCard key={task.id} task={task} course={courseMap.get(task.courseId)} />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-indigo-200/60 rounded-xl">
                  No tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-emerald-700 border border-emerald-200">
                {completedTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} course={courseMap.get(task.courseId)} />
              ))}
              {completedTasks.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-emerald-200/60 rounded-xl">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
