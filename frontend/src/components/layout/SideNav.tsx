import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { LayoutDashboard, Users, Calendar, LogOut } from 'lucide-react';

export function SideNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="w-64 bg-surface-container-lowest border-r border-border-subtle h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-headline-sm text-primary font-heading">
          Mentorque <span className="text-body-sm text-text-muted block mt-1">{user.role === 'admin' ? 'Admin Console' : user.role === 'mentor' ? 'Mentor Console' : 'Mentee Console'}</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {user.role === 'user' && (
          <NavLink 
            to="/user/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-body-md ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <LayoutDashboard size={18} />
            My Dashboard
          </NavLink>
        )}
        
        {user.role === 'mentor' && (
          <NavLink 
            to="/mentor/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-body-md ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <LayoutDashboard size={18} />
            Mentor Dashboard
          </NavLink>
        )}

        {user.role === 'admin' && (
          <>
            <NavLink 
              to="/admin/requirements"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-body-md ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <LayoutDashboard size={18} />
              Requirements Queue
            </NavLink>
            <NavLink 
              to="/admin/mentors"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-body-md ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <Users size={18} />
              Mentor Directory
            </NavLink>
            <NavLink 
              to="/admin/bookings"
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-body-md ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <Calendar size={18} />
              All Bookings
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex-1 overflow-hidden">
            <p className="text-body-sm font-medium truncate">{user.name}</p>
            <p className="text-label-caps text-text-muted truncate">{user.email}</p>
          </div>
          <button onClick={logout} className="text-text-muted hover:text-error transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
