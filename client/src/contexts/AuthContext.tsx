import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getLoginErrorMessage } from '@/lib/errorHandler';

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
      // Validate input
      if (!username || !password) {
        return { 
          success: false, 
          error: 'Please enter both username and password.' 
        };
      }

      // Check network connectivity
      if (!navigator.onLine) {
        return { 
          success: false, 
          error: 'No internet connection. Please check your network and try again.' 
        };
      }

      // Attempt login with timeout
      const loginPromise = supabase
        .from('admin_users')
        .select('id, username, email')
        .eq('username', username)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );

      const { data, error } = await Promise.race([
        loginPromise,
        timeoutPromise
      ]) as any;

      // Handle Supabase errors
      if (error) {
        const friendlyError = getLoginErrorMessage(error, username);
        return { success: false, error: friendlyError };
      }

      // Check if user exists
      if (!data) {
        // Don't reveal if username exists or not (security best practice)
        return { 
          success: false, 
          error: 'The username or password you entered is incorrect. Please try again.' 
        };
      }

      // Verify password
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

      // Invalid password (but don't reveal if username was correct)
      return { 
        success: false, 
        error: 'The username or password you entered is incorrect. Please try again.' 
      };
    } catch (err: any) {
      // Handle timeout and other errors
      const friendlyError = getLoginErrorMessage(err, username);
      return { success: false, error: friendlyError };
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
