import { create } from 'zustand';

interface AppState {
  selectedCenter: string;
  setSelectedCenter: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser: { id: string; name: string; role: string } | null;
  setCurrentUser: (user: { id: string; name: string; role: string } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCenter: '1',
  setSelectedCenter: (id) => set({ selectedCenter: id }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
