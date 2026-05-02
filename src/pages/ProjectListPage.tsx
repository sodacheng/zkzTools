import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

export const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, projects, setCurrentProject, logout } = useAppStore();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getLevelName = (level: 'third' | 'fourth') => {
    return level === 'third' ? '三等水准' : '四等水准';
  };
  
  const handleProjectClick = (project: typeof projects[0]) => {
    setCurrentProject(project);
    navigate(`/measurement/${project.id}`);
  };
  
  const handleNewProject = () => {
    navigate('/projects/new');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">工程列表</h1>
            <p className="text-sm text-blue-100 mt-1">欢迎，{currentUser?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-700 rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            退出
          </button>
        </div>
      </div>
      
      {/* Project List */}
      <div className="p-4 space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">暂无工程</p>
            <p className="text-gray-400 text-sm mt-2">点击下方按钮创建新工程</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 active:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400">等级：</span>
                      <span className="font-medium">{getLevelName(project.level)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400">时间：</span>
                      {formatDate(project.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400">单位：</span>
                      {project.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-400">测站数：</span>
                      {project.stations.length}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* New Project Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleNewProject}
          className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800"
        >
          新建工程
        </button>
      </div>
      
      {/* Bottom padding for fixed button */}
      <div className="h-24"></div>
    </div>
  );
};
