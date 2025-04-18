import { ReactNode } from 'react';
import { useLocation, useRoute } from 'wouter';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isAdminRoute] = useRoute('/admin*');
  
  // If user is not an admin, redirect to home
  if (!user || user.role !== 'admin') {
    if (isAdminRoute) {
      setLocation('/');
    }
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-error">Access Denied</h1>
          <p className="mb-6">You do not have permission to access the admin area.</p>
          <Button onClick={() => setLocation('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
