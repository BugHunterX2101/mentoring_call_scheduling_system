import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { Users, FileText, CalendarCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    requirements: 0,
    mentors: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [reqsRes, mentorsRes, bookingsRes] = await Promise.all([
          apiClient.fetch('/requirements?status=pending').catch(() => ({ requirements: [] })),
          apiClient.fetch('/mentors').catch(() => ({ mentors: [] })),
          apiClient.fetch('/bookings/all').catch(() => ({ bookings: [] }))
        ]);

        const activeMentors = mentorsRes.mentors?.filter((m: any) => m.is_active) || [];

        setStats({
          requirements: reqsRes.requirements?.length || 0,
          mentors: activeMentors.length,
          bookings: bookingsRes.bookings?.length || 0
        });
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" searchPlaceholder="Search metrics...">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary">Platform Overview</h2>
        <p className="text-sm text-text-muted mt-1">Monitor the health and activity of the scheduling platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">
              {loading ? '-' : stats.requirements}
            </h3>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">Pending Requirements</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CalendarCheck size={20} className="text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">
              {loading ? '-' : stats.bookings}
            </h3>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">Total Bookings</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">
              {loading ? '-' : stats.mentors}
            </h3>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">Active Mentors</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link to="/admin/requirements" className="bg-white border border-border-subtle rounded-lg p-5 hover:bg-surface-container-low transition-colors group flex flex-col justify-between h-32 shadow-sm">
          <span className="text-sm font-bold text-primary">Manage Queue</span>
          <div className="flex justify-between items-end">
            <span className="text-xs text-text-muted">Review incoming requests</span>
            <ArrowRight size={16} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        
        <Link to="/admin/mentors" className="bg-white border border-border-subtle rounded-lg p-5 hover:bg-surface-container-low transition-colors group flex flex-col justify-between h-32 shadow-sm">
          <span className="text-sm font-bold text-primary">Mentor Directory</span>
          <div className="flex justify-between items-end">
            <span className="text-xs text-text-muted">Manage tags and availability</span>
            <ArrowRight size={16} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        
        <Link to="/admin/bookings" className="bg-white border border-border-subtle rounded-lg p-5 hover:bg-surface-container-low transition-colors group flex flex-col justify-between h-32 shadow-sm">
          <span className="text-sm font-bold text-primary">View Bookings</span>
          <div className="flex justify-between items-end">
            <span className="text-xs text-text-muted">All active sessions</span>
            <ArrowRight size={16} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        
        <Link to="/admin/settings" className="bg-white border border-border-subtle rounded-lg p-5 hover:bg-surface-container-low transition-colors group flex flex-col justify-between h-32 shadow-sm">
          <span className="text-sm font-bold text-primary">Platform Settings</span>
          <div className="flex justify-between items-end">
            <span className="text-xs text-text-muted">Algorithm & notifications</span>
            <ArrowRight size={16} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>

    </DashboardLayout>
  );
}
