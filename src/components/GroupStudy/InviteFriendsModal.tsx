import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Copy, 
  Check, 
  Link2, 
  Trash2, 
  Mail, 
  Users, 
  Share2,
  Sparkles
} from 'lucide-react';
import { StudyGroup } from '../../types';
import { useApp } from '../../context/AppContext';
import { MemberAvatar } from './MemberAvatar';

interface InviteFriendsModalProps {
  group: StudyGroup;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  group,
  isOpen,
  onClose,
}) => {
  const { inviteFriendToGroup, removeFriendFromGroup } = useApp();

  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const roomCode = group.roomCode || group.id.replace('group-', '').toUpperCase();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://studyhub.app';
  const inviteUrl = `${origin}?room=${encodeURIComponent(roomCode)}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) {
      setError('Please enter a friend or classmate name');
      return;
    }

    inviteFriendToGroup(group.id, friendName.trim(), friendEmail.trim() || undefined);
    setFriendName('');
    setFriendEmail('');
    setError('');
  };

  // Friends invited (excluding host / current user)
  const members = Array.isArray(group?.members) ? group.members : [];
  const invitedFriends = members.filter(m => !m.isCurrentUser && !(m.name || '').includes('(You)'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Invite Friends to Study Room
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {group.name} ({group.courseCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Share: Room Code & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Room Code Card */}
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                Room Invite Code
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-black text-indigo-700 tracking-wider">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Shareable Link Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shareable Room Link
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]">
                  {inviteUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Direct Invite Form */}
          <form onSubmit={handleAddFriend} className="space-y-3 pt-1">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Friend / Classmate Directly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  value={friendName}
                  onChange={e => {
                    setFriendName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Friend's Name (e.g. Priya Sharma)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={friendEmail}
                  onChange={e => setFriendEmail(e.target.value)}
                  placeholder="Email (Optional, e.g. priya@edu.com)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite to Room</span>
              </button>
            </div>
          </form>

          {/* Invited Members List */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Friends in this Room ({members.length})</span>
              <span className="text-[11px] text-indigo-600 font-medium">
                You + {invitedFriends.length} invited
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {/* Host (You) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MemberAvatar name="You (Host)" color={group.color} size="sm" status="online" showStatus />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>You</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                        Host / Room Owner
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Room Creator
                    </div>
                  </div>
                </div>
              </div>

              {/* Invited Friends */}
              {invitedFriends.map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MemberAvatar name={friend.name} color={friend.color} size="sm" status={friend.status} showStatus />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {friend.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {friend.email || 'Joined via Room Invite'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Invited
                    </span>
                    <button
                      onClick={() => removeFriendFromGroup(group.id, friend.id)}
                      title="Remove from room"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {invitedFriends.length === 0 && (
                <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No friends added yet. Share your room code <strong className="text-indigo-600">{roomCode}</strong> or invite classmates above to study together!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
