import React from 'react';
import { 
  Users, 
  Plus, 
  Flame, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GroupDetailView } from './GroupDetailView';
import { CreateGroupModal } from './CreateGroupModal';

export const GroupStudyHub: React.FC = () => {
  const { 
    studyGroups, 
    activeGroup, 
    setActiveGroupId, 
    setActiveModal 
  } = useApp();

  if (activeGroup) {
    return (
      <GroupDetailView
        group={activeGroup}
        onBack={() => setActiveGroupId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-violet-200 border border-white/10">
            <Users className="w-3.5 h-3.5 text-violet-300" />
            <span>Peer Collaboration Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Group Study Squads & Virtual Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Form study squads for your classes, sync focus with shared Pomodoro timers, collaborate on homework milestones, review shared flashcards, and share notes.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('create-group')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 active:bg-violet-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Study Squad</span>
        </button>
      </div>

      {/* Squads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {studyGroups.map(group => {
          const isTimerRunning = group.pomodoroState.isRunning;
          const activeMembersCount = group.members.filter(m => m.status === 'studying' || m.status === 'online').length;

          return (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {group.courseCode}
                  </span>

                  {isTimerRunning ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                      <Flame className="w-3 h-3 text-rose-600" />
                      Live Focus Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {activeMembersCount} online
                    </span>
                  )}
                </div>

                {/* Squad Title & Description */}
                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4 leading-relaxed">
                  {group.description}
                </p>

                {/* Active Focus Target snippet */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Study Goal</div>
                  <div className="font-semibold text-slate-800 line-clamp-1">
                    🎯 {group.pomodoroState.currentTopic}
                  </div>
                </div>

                {/* Squad resources overview */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-100 mb-4">
                  <div>
                    <div className="font-bold text-slate-900">{group.sharedTasks.length}</div>
                    <div className="text-[10px] text-slate-400">Tasks</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{group.flashcards.length}</div>
                    <div className="text-[10px] text-slate-400">Cards</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{group.notes.length}</div>
                    <div className="text-[10px] text-slate-400">Notes</div>
                  </div>
                </div>
              </div>

              {/* Members preview & Enter room button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {group.members.slice(0, 4).map(member => (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.name}
                      title={member.name}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                  {group.members.length > 4 && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                      +{group.members.length - 4}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setActiveGroupId(group.id)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Enter Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateGroupModal />
    </div>
  );
};
