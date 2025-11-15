import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        return true;
      } catch {
        localStorage.removeItem('admin_user');
      }
    }
    return false;
  };

  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, email')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        return { success: false, error: 'Database error' };
      }

      if (!data) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (password === 'admin') {
        const adminUser = {
          id: data.id,
          username: data.username,
          email: data.email || ''
        };
        setUser(adminUser);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
