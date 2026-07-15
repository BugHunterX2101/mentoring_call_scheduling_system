import React from 'react';
import { SideNav } from './SideNav';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  searchPlaceholder?: string;
}

export function DashboardLayout({ children, title = 'Schedule Overview', searchPlaceholder = 'Search...' }: DashboardLayoutProps) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-surface flex">
      <SideNav />
      <main className="ml-64 flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border-subtle bg-white px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Menu className="text-text-muted" size={20} />
            <h2 className="text-xl font-bold text-primary">{title}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                className="pl-10 pr-4 py-2 bg-surface-container-low border-transparent focus:bg-white focus:border-outline-variant focus:ring-0 rounded-md text-sm w-64 transition-colors"
              />
            </div>
            <button className="text-text-muted hover:text-primary"><Bell size={20} /></button>
            <button className="text-text-muted hover:text-primary"><HelpCircle size={20} /></button>
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full" />
          </div>
        </header>
        <div className="p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
