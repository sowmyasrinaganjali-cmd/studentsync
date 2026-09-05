import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Flame, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  FileText,
  KeyRound,
  UserPlus,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GroupDetailView } from './GroupDetailView';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';
import { InviteFriendsModal } from './InviteFriendsModal';
import { MemberAvatar } from './MemberAvatar';

export const GroupStudyHub: React.FC = () => {
  const { 
    studyGroups, 
    activeGroup, 
    setActiveGroupId, 
    activeModal,
    setActiveModal,
    inviteModalGroupId,
    setInviteModalGroupId
  } = useApp();

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const inviteTargetGroup = studyGroups.find(g => g.id === inviteModalGroupId) || null;

  if (activeGroup) {
    return (
      <>
        <GroupDetailView
          group={activeGroup}
          onBack={() => setActiveGroupId(null)}
        />
        {inviteTargetGroup && (
          <InviteFriendsModal
            group={inviteTargetGroup}
            isOpen={!!inviteModalGroupId}
            onClose={() => setInviteModalGroupId(null)}
          />
        )}
      </>
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
            Group Study Rooms & Friends
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create focused study rooms for your classes or invite your friends and classmates using room codes. Sync focus with shared Pomodoro timers, collaborate on homework milestones, and share notes without fake profiles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveModal('join-group')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold rounded-xl border border-white/20 shadow-xs transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-violet-300" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => setActiveModal('create-group')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 active:bg-violet-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Study Room</span>
          </button>
        </div>
      </div>

      {/* Squads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {studyGroups.map(group => {
          const members = Array.isArray(group.members) ? group.members : [];
          const sharedTasks = Array.isArray(group.sharedTasks) ? group.sharedTasks : [];
          const flashcards = Array.isArray(group.flashcards) ? group.flashcards : [];
          const notes = Array.isArray(group.notes) ? group.notes : [];
          const isTimerRunning = Boolean(group.pomodoroState?.isRunning);
          const activeMembersCount = members.filter(m => m.status === 'studying' || m.status === 'online').length;
          const roomCode = group.roomCode || `${(group.courseCode || 'STUDY').replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()}-101`;
          const isCopied = copiedCodeId === group.id;

          return (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {group.courseCode}
                    </span>
                    <button
                      onClick={(e) => handleCopyCode(e, roomCode, group.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Click to copy room code"
                    >
                      <span>{roomCode}</span>
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>

                  {isTimerRunning ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                      <Flame className="w-3 h-3 text-rose-600" />
                      Live Focus Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {activeMembersCount} {activeMembersCount === 1 ? 'student' : 'students'}
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
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Study Target</div>
                  <div className="font-semibold text-slate-800 line-clamp-1">
                    🎯 {group.pomodoroState?.currentTopic || 'Study Session'}
                  </div>
                </div>

                {/* Squad resources overview */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-100 mb-4">
                  <div>
                    <div className="font-bold text-slate-900">{sharedTasks.length}</div>
                    <div className="text-[10px] text-slate-400">Tasks</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{flashcards.length}</div>
                    <div className="text-[10px] text-slate-400">Cards</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{notes.length}</div>
                    <div className="text-[10px] text-slate-400">Notes</div>
                  </div>
                </div>
              </div>

              {/* Members preview & Enter room button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {members.slice(0, 4).map(member => (
                      <div key={member.id} className="ring-2 ring-white rounded-full">
                        <MemberAvatar member={member} size="sm" />
                      </div>
                    ))}
                    {members.length > 4 && (
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                        +{members.length - 4}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setInviteModalGroupId(group.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Invite friends to this room"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
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
      <JoinGroupModal 
        isOpen={activeModal === 'join-group'} 
        onClose={() => setActiveModal(null)} 
      />
      {inviteTargetGroup && (
        <InviteFriendsModal
          group={inviteTargetGroup}
          isOpen={!!inviteModalGroupId}
          onClose={() => setInviteModalGroupId(null)}
        />
      )}
    </div>
  );
};
