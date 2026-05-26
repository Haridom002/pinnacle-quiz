import { Quiz } from '../types';

interface QuizDetailProps {
  quiz: Quiz;
  onPlay: () => void;
  onBack: () => void;
}

export default function QuizDetail({ quiz, onPlay, onBack }: QuizDetailProps) {
  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#16213e] to-[#0f3460] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm">🏔️</span>
            </div>
            <span className="text-white font-bold text-sm">PinnacleQuiz</span>
          </div>
        </div>
      </header>

      {/* Cover Banner */}
      <div className={`bg-gradient-to-br ${quiz.coverColor} py-16 px-4 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 text-6xl opacity-30">❓</div>
          <div className="absolute top-8 right-12 text-5xl opacity-30">⭐</div>
          <div className="absolute bottom-4 left-1/4 text-4xl opacity-30">🎯</div>
        </div>
        <div className="relative z-10">
          <span className="text-7xl mb-4 block">{quiz.icon}</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{quiz.title}</h1>
          <p className="text-white/80 text-base max-w-md mx-auto">{quiz.description}</p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="bg-black/20 text-white/90 text-sm font-semibold px-3 py-1.5 rounded-full">
              📘 {quiz.subject}
            </span>
            <span className="bg-black/20 text-white/90 text-sm font-semibold px-3 py-1.5 rounded-full">
              🎓 {quiz.grade}
            </span>
            <span className="bg-black/20 text-white/90 text-sm font-semibold px-3 py-1.5 rounded-full">
              🎮 {quiz.playCount} plays
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Quiz info */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '❓', label: 'Questions', value: quiz.questions.length },
                {
                  icon: '⏱️', label: 'Avg Time',
                  value: `${Math.round(quiz.questions.reduce((a, b) => a + b.timeLimit, 0) / quiz.questions.length)}s`,
                },
                { icon: '⭐', label: 'Max Points', value: (quiz.questions.length * 1000).toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <span className="text-3xl">{stat.icon}</span>
                  <p className="text-white font-black text-xl mt-1">{stat.value}</p>
                  <p className="text-white/50 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Questions list */}
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Questions Preview</h3>
              <div className="space-y-2">
                {quiz.questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm flex-shrink-0 bg-gradient-to-br ${quiz.coverColor}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{q.text}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {q.type === 'true-false' ? '✓ True/False' : '◉ Multiple Choice'} · ⏱️ {q.timeLimit}s · ⭐ {q.points.toLocaleString()} pts
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {q.answers.map((a) => (
                        <div
                          key={a.id}
                          className={`w-3 h-3 rounded-sm ${a.isCorrect ? 'ring-2 ring-white' : 'opacity-40'}`}
                          style={{ backgroundColor: a.color }}
                          title={a.text}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Play card */}
          <div className="md:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-4 text-center">Ready to Play?</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">1</span>
                  Enter your name & avatar
                </div>
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">2</span>
                  Answer questions fast for bonus points
                </div>
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">3</span>
                  Climb the live leaderboard
                </div>
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">4</span>
                  Win the podium! 🏆
                </div>
              </div>

              <button
                onClick={onPlay}
                className={`w-full py-4 rounded-xl font-black text-white text-lg bg-gradient-to-r ${quiz.coverColor} hover:scale-105 active:scale-95 transition-all shadow-xl`}
              >
                🚀 Start Game
              </button>

              <p className="text-white/30 text-xs text-center mt-3">
                Includes {quiz.questions.length} questions · {quiz.grade}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
