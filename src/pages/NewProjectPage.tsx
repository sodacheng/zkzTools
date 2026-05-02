import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useAppStore();
  
  const [projectName, setProjectName] = useState('');
  const [level, setLevel] = useState<'third' | 'fourth'>('third');
  const [error, setError] = useState('');
  
  // Auto-filled values
  const createdAt = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const unit = 'admin'; // Current logged in user
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!projectName.trim()) {
      setError('请输入工程名称');
      return;
    }
    
    const project = createProject(projectName.trim(), level);
    navigate(`/measurement/${project.id}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/projects')}
            className="mr-4 p-2 -ml-2 rounded-lg hover:bg-blue-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">新建工程</h1>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Project Name */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label htmlFor="projectName" className="block text-lg font-medium text-gray-700 mb-2">
            工程名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-4 py-4 border border-gray-300 text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入工程名称"
          />
        </div>
        
        {/* Measurement Time (Auto-filled) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            测量时间
          </label>
          <input
            type="text"
            value={createdAt}
            readOnly
            className="w-full px-4 py-4 border border-gray-300 text-xl rounded-lg bg-gray-100 text-gray-500"
          />
        </div>
        
        {/* Unit (Auto-filled) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            测量单位
          </label>
          <input
            type="text"
            value={unit}
            readOnly
            className="w-full px-4 py-4 border border-gray-300 text-xl rounded-lg bg-gray-100 text-gray-500"
          />
        </div>
        
        {/* Level Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            水准等级
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500">
              <input
                type="radio"
                name="level"
                value="third"
                checked={level === 'third'}
                onChange={() => setLevel('third')}
                className="h-6 w-6 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-xl font-medium text-gray-900">三等水准</span>
            </label>
            <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500">
              <input
                type="radio"
                name="level"
                value="fourth"
                checked={level === 'fourth'}
                onChange={() => setLevel('fourth')}
                className="h-6 w-6 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-xl font-medium text-gray-900">四等水准</span>
            </label>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 mt-6"
        >
          开始测量
        </button>
      </form>
    </div>
  );
};
