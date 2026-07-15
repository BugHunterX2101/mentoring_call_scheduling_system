import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { apiClient } from '../../lib/api/client';
import { LayoutDashboard, Users, Calendar, Settings, Plus, List } from 'lucide-react';

export function SideNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="w-64 bg-surface-container-lowest border-r border-border-subtle h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-3xl text-primary font-bold font-sans tracking-tight">
          Mentorque
        </h1>
        <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">
          {user.role === 'admin' ? 'Admin Console' : user.role === 'mentor' ? 'Mentor Console' : 'Mentee Console'}
        </p>
      </div>
      
      <nav className="flex-1 space-y-1 mt-4">
        {user.role === 'user' && (
          <NavLink 
            to="/user/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
          >
            <LayoutDashboard size={18} />
            My Dashboard
          </NavLink>
        )}
        
        {user.role === 'mentor' && (
          <NavLink 
            to="/mentor/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
          >
            <LayoutDashboard size={18} />
            Mentor Dashboard
          </NavLink>
        )}

        {user.role === 'admin' && (
          <>
            <NavLink 
              to="/admin/dashboard"
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink 
              to="/admin/requirements"
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
            >
              <List size={18} />
              Requirements
            </NavLink>
            <NavLink 
              to="/admin/mentors"
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
            >
              <Users size={18} />
              Mentors
            </NavLink>
            <NavLink 
              to="/admin/bookings"
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
            >
              <Calendar size={18} />
              Bookings
            </NavLink>
            <NavLink 
              to="/admin/settings"
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active-border border-l-4 border-nav-active-border' : 'text-text-muted hover:bg-surface-container-low hover:text-primary border-l-4 border-transparent'}`}
            >
              <Settings size={18} />
              Settings
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-6 mt-auto">
        {user.role !== 'mentor' && (
          <button 
            onClick={async () => {
              if (user.role === 'admin') {
                try {
                  const res = await apiClient.fetch('/requirements?status=pending');
                  if (res.requirements && res.requirements.length > 0) {
                    navigate(`/admin/requirements/${res.requirements[0].id}/match`);
                  } else {
                    navigate('/admin/requirements'); // fallback
                  }
                } catch(e) {
                  navigate('/admin/requirements');
                }
              }
              else if (user.role === 'user') {
                navigate('/user/dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded hover:bg-primary/90 transition-colors text-sm font-medium mb-6 shadow-sm"
          >
            <Plus size={16} />
            {user.role === 'admin' ? 'Start Match Session' : 'New Match Session'}
          </button>
        )}
        <div className="flex items-center gap-3">
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-primary truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">{user.role}</p>
          </div>
          <button onClick={logout} className="text-text-muted hover:text-error transition-colors ml-auto text-xs font-medium" title="Logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
