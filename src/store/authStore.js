import { create } from 'zustand';

const loadUser = () => {
  try {
    const raw = localStorage.getItem('wf_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  user: loadUser(),
  token: localStorage.getItem('wf_token') || null,
  isAuthenticated: !!localStorage.getItem('wf_token'),

  setAuth: (user, token) => {
    localStorage.setItem('wf_token', token);
    localStorage.setItem('wf_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('wf_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  isManager: () => get().user?.role === 'Manager',
  isTechnician: () => get().user?.role === 'Technician',
}));

export default useAuthStore;
