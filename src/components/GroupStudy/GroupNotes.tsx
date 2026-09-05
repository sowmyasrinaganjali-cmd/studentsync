import React, { useState } from 'react';
import { FileText, Plus, Clock, User, Tag, Trash2 } from 'lucide-react';
import { StudyGroup, StudyNote } from '../../types';
import { useApp } from '../../context/AppContext';

interface GroupNotesProps {
  group: StudyGroup;
}

export const GroupNotes: React.FC<GroupNotesProps> = ({ group }) => {
  const { addGroupNote } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(group.notes[0] || null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);

    addGroupNote(group.id, {
      title: newTitle.trim(),
      content: newContent.trim(),
      authorName: 'Alex Rivera (You)',
      tags: tagsArray.length > 0 ? tagsArray : ['study-guide'],
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAdding(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column: Notes list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Shared Study Notes</h3>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase">Create Shared Note</h4>
            <input
              type="text"
              required
              placeholder="Note Title (e.g. Dijkstra vs Bellman-Ford Summary)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
            <textarea
              rows={4}
              required
              placeholder="Write study notes, formulas, step-by-step algorithms, or cheat sheets..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Tags separated by comma (e.g. trees, midterm, formulas)"
              value={newTags}
              onChange={e => setNewTags(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {group.notes.map(note => {
            const isSelected = selectedNote?.id === note.id;

            return (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {note.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {note.authorName}
                  </span>
                  <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            );
          })}

          {group.notes.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No shared notes yet. Start a study guide!
            </div>
          )}
        </div>
      </div>

      {/* Right column: Active Note Content Reader */}
      <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
        {selectedNote ? (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {selectedNote.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedNote.title}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span>By {selectedNote.authorName}</span>
                <span>•</span>
                <span>Last updated {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs">
            <FileText className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Select a note from the list or create a new one for your group.</p>
          </div>
        )}
      </div>
    </div>
  );
};
