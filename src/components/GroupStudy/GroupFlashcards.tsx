import React, { useState } from 'react';
import { 
  CreditCard, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  Shuffle, 
  Lightbulb, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, StudyGroup } from '../../types';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface GroupFlashcardsProps {
  group: StudyGroup;
}

export const GroupFlashcards: React.FC<GroupFlashcardsProps> = ({ group }) => {
  const { addFlashcard } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newHint, setNewHint] = useState('');

  const cards = group.flashcards;
  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, cards.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % Math.max(1, cards.length));
  };

  const handleGotIt = () => {
    sounds.playTaskComplete();
    setKnownCount(prev => prev + 1);
    if (currentIndex === cards.length - 1) {
      confetti({
        particleCount: 50,
        spread: 60,
      });
    }
    handleNext();
  };

  const handleNeedsReview = () => {
    setNeedsReviewCount(prev => prev + 1);
    handleNext();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    addFlashcard(group.id, {
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      hint: newHint.trim() || undefined,
    });

    setNewQuestion('');
    setNewAnswer('');
    setNewHint('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {group.courseCode} Group Flashcard Deck
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {cards.length} review cards • Test your recall together
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mastery tally */}
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg">
            <span className="text-emerald-700">✓ {knownCount}</span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700">✕ {needsReviewCount}</span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Add Card Form Modal */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-800">Add New Review Card</h4>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Question / Prompt *</label>
            <textarea
              required
              rows={2}
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="e.g. What is the time complexity of QuickSelect average vs worst case?"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Answer *</label>
            <textarea
              required
              rows={2}
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              placeholder="e.g. O(N) average case, O(N^2) worst case when poorly partitioned."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Hint (Optional)</label>
            <input
              type="text"
              value={newHint}
              onChange={e => setNewHint(e.target.value)}
              placeholder="e.g. Master theorem case or pivot choices"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg"
            >
              Add Card
            </button>
          </div>
        </form>
      )}

      {/* Main Flashcard Display */}
      {currentCard ? (
        <div className="space-y-4">
          {/* Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[260px] p-8 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between select-none shadow-sm hover:shadow-md relative overflow-hidden ${
              isFlipped
                ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700'
                : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold uppercase tracking-wider ${isFlipped ? 'text-indigo-300' : 'text-slate-400'}`}>
                {isFlipped ? 'Answer' : 'Question'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isFlipped ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                Card {currentIndex + 1} of {cards.length}
              </span>
            </div>

            {/* Middle Question / Answer */}
            <div className="my-auto py-6 text-center">
              <p className={`font-bold leading-relaxed transition-all ${
                isFlipped ? 'text-lg sm:text-xl text-indigo-50' : 'text-lg sm:text-xl text-slate-900'
              }`}>
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>

              {/* Hint */}
              {!isFlipped && currentCard.hint && showHint && (
                <div className="mt-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 inline-flex items-center gap-1.5 animate-fade-in">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Hint: {currentCard.hint}</span>
                </div>
              )}
            </div>

            {/* Bottom prompt to flip */}
            <div className="flex items-center justify-between text-xs pt-2">
              {!isFlipped && currentCard.hint && !showHint ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Show Hint</span>
                </button>
              ) : <div />}

              <span className={`text-[11px] font-medium flex items-center gap-1 ${isFlipped ? 'text-slate-400' : 'text-slate-400'}`}>
                <RotateCw className="w-3 h-3" />
                <span>Click to flip card</span>
              </span>
            </div>
          </div>

          {/* Navigation & Score Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleNeedsReview}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Need Review</span>
              </button>

              <button
                onClick={handleGotIt}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Got It!</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
          No flashcards in this deck yet. Click "Add Card" to create the first one!
        </div>
      )}
    </div>
  );
};
