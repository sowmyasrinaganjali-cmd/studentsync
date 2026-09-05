import React from 'react';
import { Layers, Plus, Settings2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CourseFilter: React.FC = () => {
  const { 
    courses, 
    tasks, 
    selectedCourseFilter, 
    setSelectedCourseFilter,
    setActiveModal,
  } = useApp();

  const getCourseTaskCount = (courseId: string) => {
    return tasks.filter(t => t.courseId === courseId && t.status !== 'completed').length;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => setSelectedCourseFilter('all')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
          selectedCourseFilter === 'all'
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All Courses</span>
        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
          selectedCourseFilter === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          {tasks.filter(t => t.status !== 'completed').length}
        </span>
      </button>

      {courses.map(course => {
        const count = getCourseTaskCount(course.id);
        const isSelected = selectedCourseFilter === course.id;

        return (
          <button
            key={course.id}
            onClick={() => setSelectedCourseFilter(course.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              isSelected
                ? `${course.accentBg} ${course.textColor} ${course.borderColor} ring-2 ring-indigo-500/20 shadow-xs font-bold`
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              course.color === 'indigo' ? 'bg-indigo-500' :
              course.color === 'violet' ? 'bg-violet-500' :
              course.color === 'cyan' ? 'bg-cyan-500' :
              course.color === 'emerald' ? 'bg-emerald-500' :
              course.color === 'rose' ? 'bg-rose-500' :
              course.color === 'blue' ? 'bg-blue-500' :
              course.color === 'teal' ? 'bg-teal-500' :
              course.color === 'orange' ? 'bg-orange-500' :
              course.color === 'fuchsia' ? 'bg-fuchsia-500' : 'bg-amber-500'
            }`} />
            <span>{course.code}</span>
            {count > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-white/80 font-bold' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}

      <div className="flex items-center gap-1.5 shrink-0 ml-1 border-l border-slate-200 pl-2">
        <button
          onClick={() => setActiveModal('manage-courses')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 whitespace-nowrap transition-colors cursor-pointer"
          title="Add new subject or customize your course list"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>

        <button
          onClick={() => setActiveModal('manage-courses')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
          title="Manage and edit your subjects"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Manage</span>
        </button>
      </div>
    </div>
  );
};
