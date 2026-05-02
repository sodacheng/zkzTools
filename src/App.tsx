import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { LoginPage } from './pages/LoginPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { MeasurementPage } from './pages/MeasurementPage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAppStore();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <NewProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/measurement/:projectId"
          element={
            <ProtectedRoute>
              <MeasurementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
