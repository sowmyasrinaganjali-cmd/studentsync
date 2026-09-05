import React, { useState } from 'react';
import { X, KeyRound, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose }) => {
  const { studyGroups, joinGroupByCode } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a room invite code');
      return;
    }

    const success = joinGroupByCode(cleanCode);
    if (success) {
      setCode('');
      setError('');
      onClose();
    } else {
      setError(`No study room found with code "${cleanCode}". Check the code with your friend.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Join Friend's Room</h2>
              <p className="text-xs text-slate-500">Enter room invite code to study together</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Room Invite Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              placeholder="e.g. ALGO-301"
              className="w-full px-3.5 py-2.5 text-center font-mono font-black tracking-widest text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 uppercase"
            />
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1.5">
                {error}
              </p>
            )}
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900">
            💡 <strong>Tip:</strong> Ask your friend for their 6-character room code from their Study Room header.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Join Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
