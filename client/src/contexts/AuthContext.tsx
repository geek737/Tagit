import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLoginErrorMessage } from '@/lib/errorHandler';

interface UserRole {
  id: string;
  name: string;
  display_name: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole | null;
  permissions: string[];
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isAdmin: () => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'admin_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.permissions) {
          setUser(parsedUser);
          return true;
        }
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return false;
  };

  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      if (!username || !password) {
        return {
          success: false,
          error: 'Veuillez entrer le nom d\'utilisateur et le mot de passe.'
        };
      }

      if (!navigator.onLine) {
        return {
          success: false,
          error: 'Pas de connexion internet. Verifiez votre reseau.'
        };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/auth-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error === 'Account is deactivated') {
          return {
            success: false,
            error: 'Ce compte a ete desactive. Contactez l\'administrateur.'
          };
        }
        return {
          success: false,
          error: 'Nom d\'utilisateur ou mot de passe incorrect.'
        };
      }

      const adminUser: AdminUser = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email || '',
        role: data.user.role,
        permissions: data.user.permissions || [],
      };

      setUser(adminUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true };

    } catch (err: any) {
      const friendlyError = getLoginErrorMessage(err, username);
      return { success: false, error: friendlyError };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role?.name === 'admin') return true;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.role?.name === 'admin') return true;
    return permissions.some(p => user.permissions.includes(p));
  };

  const isAdmin = (): boolean => {
    return user?.role?.name === 'admin';
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, error: 'Non authentifie' };
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/auth-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'change_password',
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error === 'Current password is incorrect') {
          return { success: false, error: 'Le mot de passe actuel est incorrect.' };
        }
        return { success: false, error: data.error || 'Echec du changement de mot de passe.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erreur lors du changement de mot de passe.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      checkAuth,
      hasPermission,
      hasAnyPermission,
      isAdmin,
      changePassword,
    }}>
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
