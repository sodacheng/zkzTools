import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Project, Station } from '../types';

interface AppState {
  // Auth state
  currentUser: User | null;
  isLoggedIn: boolean;
  
  // Projects state
  projects: Project[];
  currentProject: Project | null;
  
  // Actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  saveCredentials: (username: string, password: string, remember: boolean) => void;
  getSavedCredentials: () => { username: string; password: string } | null;
  
  // Project actions
  createProject: (name: string, level: 'third' | 'fourth') => Project;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  updateProject: (project: Project) => void;
  
  // Station actions
  addStation: (station: Station) => void;
  updateStation: (station: Station) => void;
  deleteStation: (projectId: string, stationNo: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isLoggedIn: false,
      projects: [],
      currentProject: null,
      
      // Auth actions
      login: (username: string, password: string): boolean => {
        // Offline test account: admin/admin
        if (username === 'admin' && password === 'admin') {
          const user = { username, password };
          set({ currentUser: user, isLoggedIn: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ currentUser: null, isLoggedIn: false, currentProject: null });
      },
      
      saveCredentials: (username: string, password: string, remember: boolean) => {
        if (remember) {
          localStorage.setItem('savedCredentials', JSON.stringify({ username, password }));
        } else {
          localStorage.removeItem('savedCredentials');
        }
      },
      
      getSavedCredentials: () => {
        const saved = localStorage.getItem('savedCredentials');
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            return null;
          }
        }
        return null;
      },
      
      // Project actions
      createProject: (name: string, level: 'third' | 'fourth'): Project => {
        const { currentUser } = get();
        const project: Project = {
          id: Date.now().toString(),
          name,
          createdAt: new Date().toISOString(),
          unit: currentUser?.username || 'admin',
          level,
          stations: [],
        };
        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
        }));
        return project;
      },
      
      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },
      
      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },
      
      updateProject: (project: Project) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === project.id ? project : p)),
          currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
        }));
      },
      
      // Station actions
      addStation: (station: Station) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = {
            ...state.currentProject,
            stations: [...state.currentProject.stations, station],
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === state.currentProject!.id ? updatedProject : p
            ),
          };
        });
      },
      
      updateStation: (station: Station) => {
        set((state) => {
          if (!state.currentProject) return state;
          const updatedStations = state.currentProject.stations.map((s) =>
            s.stationNo === station.stationNo ? station : s
          );
          const updatedProject = {
            ...state.currentProject,
            stations: updatedStations,
          };
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === state.currentProject!.id ? updatedProject : p
            ),
          };
        });
      },
      
      deleteStation: (projectId: string, stationNo: number) => {
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (!project) return state;
          const updatedProject = {
            ...project,
            stations: project.stations.filter((s) => s.stationNo !== stationNo),
          };
          return {
            projects: state.projects.map((p) =>
              p.id === projectId ? updatedProject : p
            ),
            currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
          };
        });
      },
    }),
    {
      name: 'leveling-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
        projects: state.projects,
      }),
    }
  )
);
