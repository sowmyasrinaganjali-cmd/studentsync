import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Coffee, 
  Flame, 
  Target, 
  Users, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { StudyGroup } from '../../types';
import { useApp } from '../../context/AppContext';

interface GroupLiveStudyRoomProps {
  group: StudyGroup;
}

export const GroupLiveStudyRoom: React.FC<GroupLiveStudyRoomProps> = ({ group }) => {
  const { updatePomodoro, resetPomodoro } = useApp();
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicInput, setTopicInput] = useState(group.pomodoroState.currentTopic);
  const [myFocusGoal, setMyFocusGoal] = useState('Implementing AVL tree rotations');

  const { isRunning, mode, secondsRemaining, currentTopic } = group.pomodoroState;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = mode === 'focus' ? 25 * 60 : mode === 'break' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalDuration - secondsRemaining) / totalDuration) * 100;

  const toggleTimer = () => {
    updatePomodoro(group.id, { isRunning: !isRunning });
  };

  const handleModeChange = (newMode: 'focus' | 'break' | 'long_break') => {
    resetPomodoro(group.id, newMode);
  };

  const handleSaveTopic = () => {
    if (topicInput.trim()) {
      updatePomodoro(group.id, { currentTopic: topicInput.trim() });
    }
    setIsEditingTopic(false);
  };

  return (
    <div className="space-y-6">
      {/* Timer & Focus Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left: Topic & Mode selector */}
          <div className="space-y-4 text-center md:text-left flex-1">
            {/* Mode selection buttons */}
            <div className="inline-flex items-center gap-1.5 p-1 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
              <button
                onClick={() => handleModeChange('focus')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'focus' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Focus Sprint (25m)</span>
              </button>

              <button
                onClick={() => handleModeChange('break')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'break' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Short Break (5m)</span>
              </button>

              <button
                onClick={() => handleModeChange('long_break')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'long_break' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Long Break (15m)</span>
              </button>
            </div>

            {/* Current Topic */}
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-indigo-300 mb-1">
                Active Group Focus Target
              </div>

              {isEditingTopic ? (
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white/20 border border-white/20 rounded-lg text-sm text-white focus:outline-hidden focus:border-indigo-400"
                  />
                  <button
                    onClick={handleSaveTopic}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentTopic}
                  </h3>
                  <button
                    onClick={() => setIsEditingTopic(true)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Change focus topic"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* User's individual goal status */}
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 max-w-md">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-indigo-300" />
                <span>Your Individual Session Objective</span>
              </div>
              <input
                type="text"
                value={myFocusGoal}
                onChange={e => setMyFocusGoal(e.target.value)}
                placeholder="What are you personally tackling in this sprint?"
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 border-none p-0 focus:outline-hidden focus:ring-0"
              />
            </div>
          </div>

          {/* Right: Circular Timer Display & Controls */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Progress Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-white/10"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={mode === 'focus' ? 'stroke-indigo-500' : mode === 'break' ? 'stroke-emerald-500' : 'stroke-violet-500'}
                  strokeWidth="6"
                  strokeDasharray={276.4}
                  strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black tracking-tighter font-mono">
                  {formattedTime}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                  {mode === 'focus' ? 'Focus Mode' : 'Rest Mode'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                id="toggle-pomodoro-btn"
                onClick={toggleTimer}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => resetPomodoro(group.id, mode)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Study Squad Participants Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">Study Squad Presence</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {group.members.filter(m => m.status === 'studying' || m.status === 'online').length} Active Now
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {group.members.map(member => {
            const isUser = member.name.includes('(You)');
            const currentFocusText = isUser ? myFocusGoal : member.currentFocus;

            return (
              <div
                key={member.id}
                className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                  member.status === 'studying'
                    ? 'bg-indigo-50/40 border-indigo-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'studying'
                        ? 'bg-indigo-600'
                        : member.status === 'online'
                          ? 'bg-emerald-500'
                          : 'bg-amber-400'
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {member.name}
                    </h4>
                    {member.role === 'lead' && (
                      <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1 rounded-sm">
                        Lead
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>{member.status}</span>
                  </div>

                  {currentFocusText && (
                    <div className="mt-2 text-[11px] text-slate-700 bg-white/80 p-1.5 rounded-md border border-slate-200/60 truncate" title={currentFocusText}>
                      🎯 {currentFocusText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
