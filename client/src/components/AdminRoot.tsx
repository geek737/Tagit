import { useEffect } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import GlobalLoader from '@/components/ui/GlobalLoader';

export default function AdminRoot() {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader isLoading={true} text="Loading..." fullScreen />;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Redirect to="/login" />;
}
