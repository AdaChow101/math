
import React from 'react';
import { MathTopic, Difficulty, AppView } from '../types';

interface DashboardProps {
  onStartQuiz: (topic: MathTopic, difficulty: Difficulty, mode: 'CLASSIC' | 'STORY') => void;
  onNavigate: (view: AppView) => void;
  wrongQuestionsCount: number;
}

const topics = [
  { id: MathTopic.CALCULATION, icon: '🧮', label: '四则运算', color: 'bg-emerald-100 border-emerald-500 text-emerald-800' },
  { id: MathTopic.DECIMALS, icon: '0.5', label: '小数', color: 'bg-teal-100 border-teal-500 text-teal-800' },
  { id: MathTopic.FRACTIONS, icon: '🍰', label: '分数', color: 'bg-blue-100 border-blue-500 text-blue-800' },
  { id: MathTopic.RATIO, icon: '⚖️', label: '比与比例', color: 'bg-amber-100 border-amber-500 text-amber-800' },
  { id: MathTopic.EQUATIONS, icon: '✖️', label: '简易方程', color: 'bg-violet-100 border-violet-500 text-violet-800' },
  { id: MathTopic.GEOMETRY, icon: '📐', label: '图形几何', color: 'bg-orange-100 border-orange-500 text-orange-800' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, onNavigate, wrongQuestionsCount }) => {
  const [selectedTopic, setSelectedTopic] = React.useState<MathTopic | null>(null);
  const [difficulty, setDifficulty] = React.useState<Difficulty>(Difficulty.EASY);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      <div className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-indigo-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">欢迎来到数学探索学院! 🚀</h2>
        <p className="text-slate-500">准备好去赢取今天的星星了吗？</p>
        
        <div className="mt-6 flex flex-wrap gap-4">
           {/* Top Row: Tutor & Photo Solver */}
           <button 
             onClick={() => onNavigate(AppView.TUTOR)}
             className="flex-1 min-w-[140px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
           >
             <span className="text-3xl">🦉</span>
             <div className="text-left">
               <div className="font-bold text-lg">AI 辅导</div>
               <div className="text-indigo-100 text-xs">有问题问我</div>
             </div>
           </button>

           <button 
             onClick={() => onNavigate(AppView.PHOTO_SOLVER)}
             className="flex-1 min-w-[140px] bg-gradient-to-r from-sky-400 to-blue-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
           >
             <span className="text-3xl">📷</span>
             <div className="text-left">
               <div className="font-bold text-lg">拍照识题</div>
               <div className="text-sky-100 text-xs">拍一下就懂</div>
             </div>
           </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
           {/* Bottom Row: Notebook & Stats */}
           <button 
             onClick={() => onNavigate(AppView.NOTEBOOK)}
             className="flex-1 bg-white border-2 border-rose-100 text-rose-700 p-4 rounded-2xl hover:bg-rose-50 transition-colors flex items-center justify-center space-x-3 relative"
           >
             {wrongQuestionsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                  {wrongQuestionsCount}
                </span>
             )}
             <span className="text-3xl">📖</span>
             <div className="text-left">
               <div className="font-bold text-lg">错题本</div>
               <div className="text-slate-500 text-xs">复习错题</div>
             </div>
           </button>

           <button 
             onClick={() => onNavigate(AppView.STATS)}
             className="flex-1 bg-white border-2 border-indigo-100 text-indigo-700 p-4 rounded-2xl hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-3"
           >
             <span className="text-3xl">📊</span>
             <div className="text-left">
               <div className="font-bold text-lg">进度</div>
               <div className="text-slate-500 text-xs">学习统计</div>
             </div>
           </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-700 px-2">选择一个探索主题</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`p-6 rounded-2xl border-b-4 transition-all duration-200 flex flex-col items-center justify-center space-y-2
                ${selectedTopic === t.id 
                  ? 'ring-4 ring-indigo-400 scale-105 shadow-xl ' + t.color.replace('bg-', 'bg-white ')
                  : t.color + ' hover:brightness-95 hover:scale-105'
                }`}
            >
              <span className="text-4xl filter drop-shadow-sm">{t.icon}</span>
              <span className="font-bold text-lg">{t.id}</span>
              <span className="text-xs font-semibold opacity-70">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedTopic && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-bounce-short">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">开始: {selectedTopic}</h3>
              <button onClick={() => setSelectedTopic(null)} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">难度选择</label>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  {Object.values(Difficulty).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => onStartQuiz(selectedTopic, difficulty, 'CLASSIC')}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors border-b-4 border-indigo-200 hover:border-indigo-300"
                >
                  <span>⚡ 速算练习</span>
                  <span className="text-xs font-normal opacity-75">(仅数字)</span>
                </button>
                <button
                  onClick={() => onStartQuiz(selectedTopic, difficulty, 'STORY')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transform hover:-translate-y-1 transition-all flex items-center justify-center space-x-2 border-b-4 border-indigo-800"
                >
                  <span>📖 AI 应用题</span>
                  <span className="text-xs font-normal opacity-75">(趣味故事)</span>
                </button>
                 <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-full text-slate-400 hover:text-slate-600 py-2 font-bold text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
