import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, KeyRound, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CreateGroupModal: React.FC = () => {
  const { activeModal, setActiveModal, courses, createStudyGroup } = useApp();
  const isOpen = activeModal === 'create-group';

  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [description, setDescription] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [color, setColor] = useState('indigo');
  const [initialFriends, setInitialFriends] = useState('');

  // Auto-suggest room code when course changes
  useEffect(() => {
    if (isOpen) {
      const course = courses.find(c => c.id === courseId) || courses[0];
      const prefix = course ? course.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4) : 'ROOM';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setRoomCode(`${prefix}-${randomNum}`);
    }
  }, [isOpen, courseId, courses]);

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const course = courses.find(c => c.id === courseId) || courses[0];
    const friendsList = initialFriends
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    createStudyGroup({
      name: name.trim(),
      courseCode: course?.code || 'GEN',
      courseId: courseId || courses[0]?.id || '',
      description: description.trim() || 'Collaborative study squad for homework, exams, and projects.',
      color,
      roomCode: (roomCode.trim() || `${course?.code || 'ROOM'}-${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
      initialFriendNames: friendsList,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Study Room</h2>
              <p className="text-xs text-slate-500">Create a room and invite your friends to study together</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Study Room Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. CS 301 Midterm Prep Room"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Associated Subject
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
                Room Invite Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS301-492"
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Study Goal / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are you tackling together? (e.g. Problem sets, coding drills, exam review)..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Invite Friends Now (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={initialFriends}
                onChange={e => setInitialFriends(e.target.value)}
                placeholder="Comma-separated names (e.g. Sarah, Priya, Rohan)"
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
              <UserPlus className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              You can also invite more classmates later with the shareable link or room code.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-3">
              {['indigo', 'violet', 'cyan', 'emerald', 'amber', 'rose'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    c === 'indigo' ? 'bg-indigo-500' :
                    c === 'violet' ? 'bg-violet-500' :
                    c === 'cyan' ? 'bg-cyan-500' :
                    c === 'emerald' ? 'bg-emerald-500' :
                    c === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                  } ${color === c ? 'ring-4 ring-offset-2 ring-indigo-300 scale-110' : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Create Room & Open
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
