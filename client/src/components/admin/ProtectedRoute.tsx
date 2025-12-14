import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import GlobalLoader from '@/components/ui/GlobalLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader isLoading={true} text="Authentification..." fullScreen />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
