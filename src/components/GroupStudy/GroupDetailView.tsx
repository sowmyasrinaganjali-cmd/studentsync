import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Flame, 
  CheckSquare, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle,
  User
} from 'lucide-react';
import { StudyGroup } from '../../types';
import { useApp } from '../../context/AppContext';
import { GroupLiveStudyRoom } from './GroupLiveStudyRoom';
import { GroupNotes } from './GroupNotes';
import { GroupFlashcards } from './GroupFlashcards';
import { GroupChat } from './GroupChat';

interface GroupDetailViewProps {
  group: StudyGroup;
  onBack: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ group, onBack }) => {
  const { toggleGroupTaskStatus, addGroupTask } = useApp();

  const [activeTab, setActiveTab] = useState<'room' | 'tasks' | 'notes' | 'flashcards' | 'chat'>('room');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(group.members[0]?.id || '');
  const [taskDue, setTaskDue] = useState('2026-09-08T18:00');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addGroupTask(group.id, {
      title: taskTitle.trim(),
      assignedToMemberId: taskAssignee || undefined,
      dueDate: taskDue,
      priority: 'high',
      status: 'todo',
    });

    setTaskTitle('');
    setIsAddingTask(false);
  };

  const memberMap = new Map();
  group.members.forEach(m => memberMap.set(m.id, m));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Squad Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Study Groups</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {group.courseCode}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {group.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              {group.description}
            </p>
          </div>

          {/* Members avatars stack */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {group.members.map(member => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  title={`${member.name} (${member.role})`}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600">
              {group.members.length} members
            </span>
          </div>
        </div>

        {/* Squad Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-100 mt-5 pt-3 overflow-x-auto">
          {[
            { id: 'room', label: 'Virtual Study Room & Timer', icon: Flame },
            { id: 'tasks', label: `Group Tasks (${group.sharedTasks.length})`, icon: CheckSquare },
            { id: 'notes', label: `Shared Notes (${group.notes.length})`, icon: FileText },
            { id: 'flashcards', label: `Flashcard Deck (${group.flashcards.length})`, icon: CreditCard },
            { id: 'chat', label: 'Squad Q&A Chat', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'room' && <GroupLiveStudyRoom group={group} />}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Collaborative Project Milestones</h3>
              <p className="text-xs text-slate-500">Assign responsibilities across study squad members</p>
            </div>
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Group Task</span>
            </button>
          </div>

          {isAddingTask && (
            <form onSubmit={handleAddTask} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">New Group Task</h4>
              <input
                type="text"
                required
                placeholder="Task description (e.g. Write Section 2: Methodology)..."
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Assign to Member</label>
                  <select
                    value={taskAssignee}
                    onChange={e => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  >
                    {group.members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={taskDue}
                    onChange={e => setTaskDue(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {group.sharedTasks.map(task => {
              const assignee = task.assignedToMemberId ? memberMap.get(task.assignedToMemberId) : null;
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    isDone ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleGroupTaskStatus(group.id, task.id)}
                      className="text-slate-400 hover:text-indigo-600 shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        {assignee && (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <User className="w-3 h-3 text-slate-400" />
                            {assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    task.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}

            {group.sharedTasks.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No shared group tasks yet. Create one to assign project deliverables!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && <GroupNotes group={group} />}

      {activeTab === 'flashcards' && <GroupFlashcards group={group} />}

      {activeTab === 'chat' && <GroupChat group={group} />}
    </div>
  );
};
