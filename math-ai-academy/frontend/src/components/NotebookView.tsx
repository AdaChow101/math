import React from 'react';
import { Question } from '../types';

interface NotebookViewProps {
  wrongQuestions: Question[];
  onRemoveQuestion: (questionId: string) => void;
  onBack: () => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({ wrongQuestions, onRemoveQuestion, onBack }) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center mb-2 sticky top-0 bg-sky-50 z-10 py-2">
        <button 
          onClick={onBack}
          className="mr-4 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-xl font-bold flex items-center transition-all shadow-sm hover:shadow-md"
        >
          <span className="mr-1">⬅</span> 返回
        </button>
        <h2 className="text-2xl font-bold text-slate-800">📖 错题本</h2>
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">太棒了！</h3>
          <p className="text-slate-500 text-center max-w-xs">目前没有错题哦。保持这个状态，继续加油！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wrongQuestions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-rose-400 animate-fade-in relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">
                            {q.topic || '数学'}
                        </span>
                        <span className="text-xs text-slate-400">
                            {q.wrongDate}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.text}</h3>
                 </div>
                 <button 
                    onClick={() => onRemoveQuestion(q.id)}
                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-bold transition-colors flex items-center shrink-0 ml-2"
                 >
                    <span>✨ 我学会了</span>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 mb-1">你的答案</span>
                    <span className="text-rose-600 font-bold line-through decoration-2">{q.userAnswer}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 mb-1">正确答案</span>
                    <span className="text-green-600 font-bold text-lg">{q.correctAnswer}</span>
                </div>
              </div>

              {q.explanation && (
                <div className="bg-indigo-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-indigo-500 text-sm">💡</span>
                        <span className="text-xs font-bold text-indigo-800 uppercase">解析</span>
                    </div>
                    <p className="text-indigo-900 text-sm leading-relaxed">
                        {q.explanation}
                    </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};