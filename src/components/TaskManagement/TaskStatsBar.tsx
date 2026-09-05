import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  LayoutList, 
  Kanban,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TaskStatsBarProps {
  viewMode: 'list' | 'board';
  setViewMode: (mode: 'list' | 'board') => void;
}

export const TaskStatsBar: React.FC<TaskStatsBarProps> = ({ viewMode, setViewMode }) => {
  const { stats, selectedStatusFilter, setSelectedStatusFilter } = useApp();

  return (
    <div className="space-y-4 mb-6">
      {/* Top Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-none">{stats.pending}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Pending Tasks</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-none">{stats.urgent}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Urgent / High</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xl font-extrabold text-slate-900 leading-none">{stats.completionRate}%</span>
              <span className="text-[11px] font-medium text-slate-400">{stats.completed}/{stats.total}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">Completed</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-none">{stats.totalEstimatedHours}h</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Study Time Est.</div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Status Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'todo', label: 'To-Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View mode toggle (List vs Board) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="List view"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'board'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Board view"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
