import React from 'react';
import { UserStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatsViewProps {
  stats: UserStats;
  onBack: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, onBack }) => {
  // Format data for Recharts
  // Take last 7 entries or pad if empty
  const data = stats.recentScores.slice(-7);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <button 
          onClick={onBack}
          className="mr-4 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-xl font-bold flex items-center transition-all shadow-sm hover:shadow-md"
        >
          <span className="mr-1">⬅</span> 返回
        </button>
        <h2 className="text-2xl font-bold text-slate-800">学习进度</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-4xl mb-2">🏆</span>
          <span className="text-slate-500 text-sm font-bold uppercase">总经验值</span>
          <span className="text-3xl font-black text-indigo-600">{stats.xp}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <span className="text-4xl mb-2">✅</span>
          <span className="text-slate-500 text-sm font-bold uppercase">正确率</span>
          <span className="text-3xl font-black text-green-600">
             {stats.questionsAnswered > 0 
                ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) 
                : 0}%
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 h-80">
        <h3 className="font-bold text-slate-700 mb-4">活跃记录 (获得经验)</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 12}} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar 
                dataKey="score" 
                radius={[8, 8, 8, 8]}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#4f46e5' : '#c7d2fe'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            还没有学习记录！快去开始挑战吧。
          </div>
        )}
      </div>
    </div>
  );
};