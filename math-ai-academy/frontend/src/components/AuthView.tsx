import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AVATARS = ['👦', '👧', '🐼', '🐱', '🐶', '🦁', '🐯', '🐰', '🐸', '🦄'];

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[2]);
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!phone || !password || !nickname) {
      setError('请填写所有信息');
      return;
    }
    if (password.length < 4) {
      setError('密码至少需要4位');
      return;
    }

    const usersStr = localStorage.getItem('mq_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.phone === phone)) {
      setError('该手机号已注册');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      phone,
      password,
      nickname,
      avatar: selectedAvatar
    };

    users.push(newUser);
    localStorage.setItem('mq_users', JSON.stringify(users));
    onLogin(newUser);
  };

  const handleLogin = () => {
    if (!phone || !password) {
      setError('请输入手机号和密码');
      return;
    }

    const usersStr = localStorage.getItem('mq_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('手机号或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-b-4 border-indigo-100">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce-short">🦉</div>
          <h1 className="text-3xl font-black text-indigo-900">数学探索学院</h1>
          <p className="text-slate-500 mt-2">
            {isRegistering ? '创建一个新账号' : '欢迎回来，小探险家！'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1 ml-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-slate-700"
              placeholder="请输入手机号"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1 ml-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-slate-700"
              placeholder="请输入密码"
            />
          </div>

          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1 ml-1">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold text-slate-700"
                  placeholder="给自己起个名字"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">选择头像</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-2xl p-2 rounded-xl transition-all ${
                        selectedAvatar === avatar 
                          ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' 
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={isRegistering ? handleRegister : handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-indigo-200 transform hover:-translate-y-1 transition-all mt-4"
          >
            {isRegistering ? '立即注册' : '登录'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-indigo-500 font-bold hover:text-indigo-700"
          >
            {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>
    </div>
  );
};