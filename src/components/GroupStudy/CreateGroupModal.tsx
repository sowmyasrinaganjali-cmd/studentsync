import React, { useState } from 'react';
import { X, Users, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CreateGroupModal: React.FC = () => {
  const { activeModal, setActiveModal, courses, createStudyGroup } = useApp();
  const isOpen = activeModal === 'create-group';

  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const course = courses.find(c => c.id === courseId);
    createStudyGroup({
      name: name.trim(),
      courseCode: course?.code || 'GEN',
      courseId: courseId || courses[0]?.id || '',
      description: description.trim() || 'Collaborative study squad for homework, exams, and projects.',
      color,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Create Study Squad</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Study Group Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. CS 301 Algorithm Masters"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Course
            </label>
            <select
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
              Mission / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this group focusing on? (e.g. Final exam review, lab assignments)..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-3">
              {['indigo', 'violet', 'cyan', 'emerald', 'amber'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    c === 'indigo' ? 'bg-indigo-500' :
                    c === 'violet' ? 'bg-violet-500' :
                    c === 'cyan' ? 'bg-cyan-500' :
                    c === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                  } ${color === c ? 'ring-4 ring-offset-2 ring-indigo-300 scale-110' : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Create Squad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
