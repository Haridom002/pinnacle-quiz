import { useState } from 'react';
import { Quiz, Question, Answer } from '../types';
import { SUBJECTS, GRADE_LEVELS, QUIZ_COVER_COLORS, ANSWER_COLORS, ANSWER_ICONS } from '../data/quizzes';

interface QuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onBack: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function makeEmptyQuestion(_index: number): Question {
  return {
    id: generateId(),
    text: '',
    type: 'multiple-choice',
    timeLimit: 20,
    points: 1000,
    explanation: '',
    answers: [
      { id: 'a', text: '', isCorrect: true, color: ANSWER_COLORS[0], icon: ANSWER_ICONS[0] },
      { id: 'b', text: '', isCorrect: false, color: ANSWER_COLORS[1], icon: ANSWER_ICONS[1] },
      { id: 'c', text: '', isCorrect: false, color: ANSWER_COLORS[2], icon: ANSWER_ICONS[2] },
      { id: 'd', text: '', isCorrect: false, color: ANSWER_COLORS[3], icon: ANSWER_ICONS[3] },
    ],
  };
}

export default function QuizBuilder({ onSave, onBack }: QuizBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('Grade 9');
  const [coverColor, setCoverColor] = useState(QUIZ_COVER_COLORS[0]);
  const [coverIcon, setCoverIcon] = useState('📚');
  const [questions, setQuestions] = useState<Question[]>([makeEmptyQuestion(0)]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const ICONS = ['📚', '📐', '🔬', '🌍', '💻', '🎭', '🎨', '🏛️', '⚗️', '🧬', '📊', '🎯'];

  const activeQuestion = questions[activeQuestionIndex];

  function updateQuestion(field: keyof Question, value: unknown) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === activeQuestionIndex ? { ...q, [field]: value } : q))
    );
  }

  function updateAnswer(answerId: string, field: keyof Answer, value: unknown) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === activeQuestionIndex
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId
                  ? { ...a, [field]: value }
                  : field === 'isCorrect' && value === true
                  ? { ...a, isCorrect: false }
                  : a
              ),
            }
          : q
      )
    );
  }

  function setQuestionType(type: Question['type']) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== activeQuestionIndex) return q;
        if (type === 'true-false') {
          return {
            ...q,
            type,
            answers: [
              { id: 'a', text: 'True', isCorrect: true, color: ANSWER_COLORS[0], icon: ANSWER_ICONS[0] },
              { id: 'b', text: 'False', isCorrect: false, color: ANSWER_COLORS[1], icon: ANSWER_ICONS[1] },
            ],
          };
        } else {
          return {
            ...q,
            type,
            answers: [
              { id: 'a', text: q.answers[0]?.text || '', isCorrect: true, color: ANSWER_COLORS[0], icon: ANSWER_ICONS[0] },
              { id: 'b', text: q.answers[1]?.text || '', isCorrect: false, color: ANSWER_COLORS[1], icon: ANSWER_ICONS[1] },
              { id: 'c', text: '', isCorrect: false, color: ANSWER_COLORS[2], icon: ANSWER_ICONS[2] },
              { id: 'd', text: '', isCorrect: false, color: ANSWER_COLORS[3], icon: ANSWER_ICONS[3] },
            ],
          };
        }
      })
    );
  }

  function addQuestion() {
    const newQ = makeEmptyQuestion(questions.length);
    setQuestions((qs) => [...qs, newQ]);
    setActiveQuestionIndex(questions.length);
  }

  function removeQuestion(index: number) {
    if (questions.length === 1) return;
    setQuestions((qs) => qs.filter((_, i) => i !== index));
    setActiveQuestionIndex(Math.max(0, index - 1));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Quiz title is required';
    if (!description.trim()) errs.description = 'Description is required';
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs[`q${i}-text`] = 'Question text is required';
      const hasCorrect = q.answers.some((a) => a.isCorrect);
      if (!hasCorrect) errs[`q${i}-correct`] = 'Select a correct answer';
      q.answers.forEach((a) => {
        if (!a.text.trim()) errs[`q${i}-a${a.id}`] = 'Answer text is required';
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const quiz: Quiz = {
      id: generateId(),
      title,
      description,
      subject,
      grade,
      coverColor,
      icon: coverIcon,
      questions,
      createdAt: new Date().toISOString().split('T')[0],
      playCount: 0,
    };
    setSaved(true);
    setTimeout(() => onSave(quiz), 800);
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#16213e] to-[#0f3460] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              ← Back
            </button>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white font-black text-base">✏️ Quiz Builder</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saved}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-5 py-2 rounded-full text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {saved ? '✓ Saved!' : '💾 Save Quiz'}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Quiz Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <span>📋</span> Quiz Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold block mb-1.5">Quiz Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grade 10 Physics"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="text-white/60 text-xs font-semibold block mb-1.5">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this quiz about?"
                    rows={2}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs font-semibold block mb-1.5">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold block mb-1.5">Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-white/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="text-white/60 text-xs font-semibold block mb-1.5">Quiz Icon</label>
                  <div className="grid grid-cols-6 gap-1">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setCoverIcon(icon)}
                        className={`h-9 rounded-lg text-xl flex items-center justify-center transition-all ${
                          coverIcon === icon
                            ? 'bg-purple-500 ring-2 ring-purple-300'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Color */}
                <div>
                  <label className="text-white/60 text-xs font-semibold block mb-1.5">Cover Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {QUIZ_COVER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCoverColor(color)}
                        className={`h-10 rounded-lg bg-gradient-to-r ${color} transition-all ${
                          coverColor === color ? 'ring-2 ring-white scale-95' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview card */}
                <div className={`bg-gradient-to-br ${coverColor} rounded-xl p-4 flex items-center gap-3`}>
                  <span className="text-4xl">{coverIcon}</span>
                  <div>
                    <p className="text-white font-black text-sm">{title || 'Quiz Title'}</p>
                    <p className="text-white/70 text-xs">{subject} · {grade}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions list */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span>❓</span> Questions ({questions.length})
                </h3>
                <button
                  onClick={addQuestion}
                  className="text-purple-400 hover:text-purple-300 text-xs font-bold flex items-center gap-1"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all ${
                      i === activeQuestionIndex
                        ? 'bg-purple-500/30 border border-purple-400/50'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                    onClick={() => setActiveQuestionIndex(i)}
                  >
                    <span className="text-white/40 text-xs font-bold w-4">{i + 1}</span>
                    <span className="text-white text-xs flex-1 truncate">
                      {q.text || 'New question...'}
                    </span>
                    {errors[`q${i}-text`] && <span className="text-red-400 text-xs">!</span>}
                    {questions.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                        className="text-white/30 hover:text-red-400 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Question Editor */}
          <div className="lg:col-span-2">
            {activeQuestion && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold text-base">
                    Question {activeQuestionIndex + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuestionType('multiple-choice')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeQuestion.type === 'multiple-choice'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      ◉ Multiple Choice
                    </button>
                    <button
                      onClick={() => setQuestionType('true-false')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeQuestion.type === 'true-false'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      ✓ True/False
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-5">
                  <label className="text-white/60 text-xs font-semibold block mb-1.5">Question *</label>
                  <textarea
                    value={activeQuestion.text}
                    onChange={(e) => updateQuestion('text', e.target.value)}
                    placeholder="Enter your question here..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                  {errors[`q${activeQuestionIndex}-text`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`q${activeQuestionIndex}-text`]}</p>
                  )}
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="text-white/60 text-xs font-semibold block mb-1.5">⏱️ Time Limit</label>
                    <select
                      value={activeQuestion.timeLimit}
                      onChange={(e) => updateQuestion('timeLimit', Number(e.target.value))}
                      className="w-full bg-[#1a1a2e] border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {[5, 10, 15, 20, 30, 45, 60].map((t) => (
                        <option key={t} value={t}>{t} seconds</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold block mb-1.5">⭐ Points</label>
                    <select
                      value={activeQuestion.points}
                      onChange={(e) => updateQuestion('points', Number(e.target.value))}
                      className="w-full bg-[#1a1a2e] border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {[500, 1000, 2000].map((p) => (
                        <option key={p} value={p}>{p.toLocaleString()} pts</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Answers */}
                <div className="mb-5">
                  <label className="text-white/60 text-xs font-semibold block mb-2">
                    Answers (click the circle to mark as correct)
                  </label>
                  {errors[`q${activeQuestionIndex}-correct`] && (
                    <p className="text-red-400 text-xs mb-2">{errors[`q${activeQuestionIndex}-correct`]}</p>
                  )}
                  <div className={`grid gap-2 ${activeQuestion.type === 'true-false' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {activeQuestion.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="rounded-xl p-3 flex items-center gap-2"
                        style={{ backgroundColor: answer.color + '33', borderWidth: 1.5, borderColor: answer.color + '88' }}
                      >
                        <span className="text-xl font-black w-6" style={{ color: answer.color }}>
                          {answer.icon}
                        </span>
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) =>
                            updateAnswer(answer.id, 'text', e.target.value)
                          }
                          placeholder={`Answer ${answer.id.toUpperCase()}...`}
                          disabled={activeQuestion.type === 'true-false'}
                          className="flex-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => updateAnswer(answer.id, 'isCorrect', true)}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                            answer.isCorrect
                              ? 'bg-green-400 border-green-400'
                              : 'border-white/30 hover:border-white/60'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="text-white/60 text-xs font-semibold block mb-1.5">
                    💡 Explanation (optional)
                  </label>
                  <input
                    type="text"
                    value={activeQuestion.explanation ?? ''}
                    onChange={(e) => updateQuestion('explanation', e.target.value)}
                    placeholder="Explain the correct answer..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
