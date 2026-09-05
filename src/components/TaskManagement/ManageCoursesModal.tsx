import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  BookOpen, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { COURSE_COLOR_PALETTES } from '../../utils/courseThemes';

export const ManageCoursesModal: React.FC = () => {
  const { 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    activeModal, 
    setActiveModal,
    tasks 
  } = useApp();

  const isOpen = activeModal === 'manage-courses' || activeModal === 'add-course';

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ code?: string; name?: string }>({});

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveModal(null);
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(null);
    setConfirmDeleteId(null);
    setCode('');
    setName('');
    setColor('indigo');
    setInstructor('');
    setLocation('');
    setErrors({});
  };

  const startEdit = (course: Course) => {
    setIsEditing(course.id);
    setConfirmDeleteId(null);
    setCode(course.code);
    setName(course.name);
    setColor(course.color || 'indigo');
    setInstructor(course.instructor || '');
    setLocation(course.location || '');
    setErrors({});
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { code?: string; name?: string } = {};
    if (!code.trim()) newErrors.code = 'Subject code is required (e.g. BIO 101)';
    if (!name.trim()) newErrors.name = 'Subject name is required (e.g. Molecular Biology)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      const existing = courses.find(c => c.id === isEditing);
      if (existing) {
        updateCourse({
          ...existing,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          color,
          instructor: instructor.trim() || undefined,
          location: location.trim() || undefined,
        });
      }
    } else {
      addCourse({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        color,
        instructor: instructor.trim() || undefined,
        location: location.trim() || undefined,
      });
    }

    resetForm();
  };

  const handleConfirmDelete = (courseId: string) => {
    deleteCourse(courseId);
    setConfirmDeleteId(null);
    if (isEditing === courseId) {
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Manage Subjects & Courses
              </h2>
              <p className="text-xs text-slate-500">
                Customize your classes, codes, and color labels for this semester
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

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Add / Edit Form Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isEditing ? 'Edit Subject Details' : 'Add New Subject / Course'}</span>
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => {
                      setCode(e.target.value);
                      if (errors.code) setErrors({ ...errors, code: undefined });
                    }}
                    placeholder="e.g. BIO 101"
                    className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:border-indigo-500 ${
                      errors.code ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                  {errors.code && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{errors.code}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject / Course Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="e.g. Molecular & Cellular Biology"
                    className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-hidden focus:border-indigo-500 ${
                      errors.name ? 'border-rose-300' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Color Theme Tag
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(COURSE_COLOR_PALETTES).map(([key, palette]) => {
                    const isSelected = color === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setColor(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? `${palette.badgeBg} ${palette.textColor} ${palette.borderColor} ring-2 ring-indigo-500 font-bold`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${palette.dotBg}`} />
                        <span>{palette.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Instructor & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Instructor / Professor (Optional)
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={e => setInstructor(e.target.value)}
                    placeholder="e.g. Prof. Alvarez"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Classroom / Room (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Science Complex 302"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Add Subject to Schedule'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Subjects List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Enrolled Subjects ({courses.length})</span>
              <span>Tasks Assigned</span>
            </div>

            <div className="space-y-2">
              {courses.map(course => {
                const assignedCount = tasks.filter(t => t.courseId === course.id).length;
                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${course.accentBg} ${course.textColor} border ${course.borderColor} shrink-0`}>
                        {course.code}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {course.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {course.instructor && <span>{course.instructor}</span>}
                          {course.instructor && course.location && <span>•</span>}
                          {course.location && <span>{course.location}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {assignedCount} {assignedCount === 1 ? 'task' : 'tasks'}
                      </span>

                      <div className="flex items-center gap-1">
                        {confirmDeleteId === course.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                            <span className="text-[11px] font-medium text-rose-700">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDelete(course.id)}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(course)}
                              title="Edit Subject"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(course.id)}
                              title="Delete Subject"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {courses.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                  No subjects enrolled yet. Add your courses above to categorize your assignments!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
