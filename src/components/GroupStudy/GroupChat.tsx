import React, { useState } from 'react';
import { Send, HelpCircle, MessageSquare } from 'lucide-react';
import { StudyGroup } from '../../types';
import { useApp } from '../../context/AppContext';

interface GroupChatProps {
  group: StudyGroup;
}

export const GroupChat: React.FC<GroupChatProps> = ({ group }) => {
  const { sendChatMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);

  const members = Array.isArray(group.members) ? group.members : [];
  const chatMessages = Array.isArray(group.chatMessages) ? group.chatMessages : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(group.id, inputText.trim(), isQuestion);
    setInputText('');
    setIsQuestion(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
      {/* Chat header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {group.name} Discussion & Q&A
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          {members.length} members in squad
        </span>
      </div>

      {/* Messages feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {chatMessages.map(msg => {
          const isUser = msg.senderName.includes('(You)');

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-7 h-7 rounded-full shrink-0 mt-0.5 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs bg-indigo-600">
                {msg.senderName.replace('(You)', '').replace('(Host)', '').trim().slice(0, 2).toUpperCase() || 'ME'}
              </div>

              <div className={`max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
                  <span className="font-semibold text-slate-600">{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.isQuestion && (
                    <span className="bg-amber-100 text-amber-800 font-bold px-1.5 rounded-sm">
                      Question
                    </span>
                  )}
                </div>

                <div
                  className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : msg.isQuestion
                        ? 'bg-amber-50 text-slate-900 border border-amber-200 rounded-tl-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isQuestion}
              onChange={e => setIsQuestion(e.target.checked)}
              className="rounded-xs border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
            />
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Mark as question for study group</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={isQuestion ? 'Ask your homework / concept question...' : 'Message study squad...'}
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
