import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, getSavedCredentials, saveCredentials } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Load saved credentials
    const saved = getSavedCredentials();
    if (saved) {
      setUsername(saved.username);
      setPassword(saved.password);
      setRemember(true);
    }
  }, [getSavedCredentials]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }
    
    const success = login(username, password);
    if (success) {
      saveCredentials(username, password, remember);
      navigate('/projects');
    } else {
      setError('账号或密码错误（测试账号：admin/admin）');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            水准测量记录系统
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            三等 / 四等水准测量
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                账号
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-500 text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入账号"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-500 text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入密码"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-lg text-gray-700">
              保存账号密码
            </label>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-xl font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            登录
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            离线测试账号：admin / admin
          </p>
        </div>
      </div>
    </div>
  );
};
