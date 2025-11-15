import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Settings,
  Image,
  FileText,
  Menu,
  Palette,
  Users,
  Briefcase,
  LogOut
} from 'lucide-react';
import logoTagtik from '@/assets/logo-tagtik.png';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/content', icon: FileText, label: 'Content' },
  { path: '/admin/appearance', icon: Palette, label: 'Appearance' },
  { path: '/admin/media', icon: Image, label: 'Media' },
  { path: '/admin/menu', icon: Menu, label: 'Menu' },
  { path: '/admin/projects', icon: Briefcase, label: 'Projects' },
  { path: '/admin/team', icon: Users, label: 'Team' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <img src={logoTagtik} alt="Tagit" className="h-8" />
            <span className="ml-2 text-sm font-semibold text-gray-500">Admin</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="pl-64">
        <div className="h-16 border-b border-gray-200 bg-white px-8 flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
