import React from 'react';
import { AppView, UserStats, User } from '../types';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  stats: UserStats;
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, stats, user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onChangeView(AppView.DASHBOARD)}>
            <div className="text-3xl">🦉</div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">数学探索</h1>
          </div>
          
          <div className="flex items-center space-x-3">
             {/* Stats Pill */}
            <div className="hidden md:flex items-center space-x-4 bg-indigo-800 rounded-full px-4 py-1.5">
                <div className="flex items-center space-x-1">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="font-bold">{stats.stars}</span>
                </div>
                <div className="h-4 w-px bg-indigo-500"></div>
                <div className="flex items-center space-x-1">
                <span className="text-sky-300 text-lg">⚡</span>
                <span className="font-bold">{stats.streak}</span>
                </div>
            </div>

            {/* User Profile */}
            {user && (
                <div className="flex items-center space-x-2 pl-2">
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-xs font-bold text-indigo-200">{user.nickname}</span>
                        {/* Mobile stats showing compact */}
                        <div className="flex md:hidden space-x-2 text-xs font-bold">
                            <span className="text-yellow-400">⭐ {stats.stars}</span>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-2xl border-2 border-indigo-400 cursor-pointer">
                            {user.avatar}
                        </div>
                        {/* Dropdown for logout */}
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block border border-slate-100 animate-fade-in">
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-4 py-3 text-rose-600 font-bold hover:bg-rose-50 text-sm"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav (Mobile Friendly) */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full md:hidden pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around p-3 text-xs font-bold text-slate-500">
          <button 
            onClick={() => onChangeView(AppView.DASHBOARD)}
            className={`flex flex-col items-center space-y-1 ${currentView === AppView.DASHBOARD ? 'text-indigo-600' : ''}`}
          >
            <span className="text-xl">🏠</span>
            <span>首页</span>
          </button>
           <button 
            onClick={() => onChangeView(AppView.TUTOR)}
            className={`flex flex-col items-center space-y-1 ${currentView === AppView.TUTOR ? 'text-indigo-600' : ''}`}
          >
            <span className="text-xl">🎓</span>
            <span>辅导</span>
          </button>
          <button 
            onClick={() => onChangeView(AppView.PHOTO_SOLVER)}
            className={`flex flex-col items-center space-y-1 ${currentView === AppView.PHOTO_SOLVER ? 'text-indigo-600' : ''}`}
          >
            <span className="text-xl">📷</span>
            <span>拍照</span>
          </button>
           <button 
            onClick={() => onChangeView(AppView.NOTEBOOK)}
            className={`flex flex-col items-center space-y-1 ${currentView === AppView.NOTEBOOK ? 'text-indigo-600' : ''}`}
          >
            <span className="text-xl">📖</span>
            <span>错题</span>
          </button>
        </div>
      </nav>
      
      {/* Desktop Nav Spacer */}
      <div className="h-16 md:h-0"></div>
    </div>
  );
};