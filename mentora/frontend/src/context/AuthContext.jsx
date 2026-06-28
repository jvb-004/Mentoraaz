import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { const { user } = await api.me(); setUser(user); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const { user } = await api.login({ email, password });
    setUser(user); return user;
  };
  const signup = async (payload) => {
    const { user } = await api.signup(payload);
    setUser(user); return user;
  };
  const logout = async () => { await api.logout(); setUser(null); };
  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }));

  return (
    <Ctx.Provider value={{ user, loading, login, signup, logout, refresh, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
