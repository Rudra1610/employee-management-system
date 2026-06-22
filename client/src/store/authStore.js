import { create } from 'zustand';


const API_URL = 'https://ems-backend-44yg.onrender.com/api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,

  
  login: async (username, password) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

    
      localStorage.setItem('token', data.token);

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ authError: error.message, isLoading: false });
      return false;
    }
  },

  // 2. Live Database Registration Connection
  registerEmployee: async (userData) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ authError: error.message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, authError: null });
  },
}));