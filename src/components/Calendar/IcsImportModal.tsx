import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseIcsContent } from '../../utils/calendarExport';

export const IcsImportModal: React.FC = () => {
  const { activeModal, setActiveModal, courses, importTasks } = useApp();
  const isOpen = activeModal === 'import-ics';

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [icsText, setIcsText] = useState('');
  const [fileName, setFileName] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveModal(null);
    setIcsText('');
    setFileName('');
    setSuccessCount(null);
    setErrorMsg('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setIcsText(content);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!icsText.trim()) {
      setErrorMsg('Please upload an .ics file or paste iCalendar text.');
      return;
    }

    try {
      const parsedTasks = parseIcsContent(icsText, selectedCourseId || courses[0]?.id || 'general');
      if (parsedTasks.length === 0) {
        setErrorMsg('No valid VEVENT items found in this iCalendar file.');
        return;
      }

      const imported = importTasks(parsedTasks);
      setSuccessCount(imported);
      setTimeout(() => {
        handleClose();
      }, 1600);
    } catch (err) {
      setErrorMsg('Error parsing calendar file format.');
    }
  };

  // Sample sample syllabus test ics
  const handleLoadSample = () => {
    const sample = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sample University//Canvas Syllabus//EN
BEGIN:VEVENT
SUMMARY:CS 301 Assignment 5: Dynamic Programming
DESCRIPTION:Solve knapsack and edit distance problems. Submit on Gradescope.
DTSTART:20260912T140000Z
DTEND:20260912T235900Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:MATH 220 Review Quiz 4
DESCRIPTION:15-minute timed quiz on vector projections.
DTSTART:20260915T100000Z
DTEND:20260915T110000Z
END:VEVENT
END:VCALENDAR`;
    setIcsText(sample);
    setFileName('sample_syllabus.ics');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Import Calendar / Syllabus (.ics)</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Import assignment deadlines and course events from Canvas, Blackboard, Moodle, or Google Calendar using a standard <code>.ics</code> file.
          </p>

          {/* Target course */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Imported Tasks To Course
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
            <input
              type="file"
              accept=".ics,text/calendar"
              onChange={handleFileUpload}
              className="hidden"
              id="ics-file-input"
            />
            <label htmlFor="ics-file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Click to select .ics file'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Drag and drop or browse from your computer
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Or paste raw iCal text below</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px]"
            >
              Load Sample Syllabus
            </button>
          </div>

          <textarea
            rows={4}
            value={icsText}
            onChange={e => setIcsText(e.target.value)}
            placeholder="BEGIN:VCALENDAR ... END:VCALENDAR"
            className="w-full font-mono text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
          />

          {errorMsg && (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="text-xs text-emerald-700 flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Successfully imported {successCount} tasks into your schedule!</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              id="confirm-import-btn"
              type="button"
              onClick={handleImport}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Import Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
