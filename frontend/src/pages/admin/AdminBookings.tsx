import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    apiClient.fetch('/bookings/all')
      .then(data => setBookings(data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const currentBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <DashboardLayout title="Bookings" searchPlaceholder="Search bookings...">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-primary">All Bookings</h2>
          <p className="text-sm text-text-muted mt-1">View and manage all active and historical mentor sessions.</p>
        </div>
        <button 
          onClick={() => alert("Downloading CSV...")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle text-primary text-sm font-bold rounded shadow-sm hover:bg-surface-container-low transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-border-subtle rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Mentee</th>
                <th className="py-3 px-6">Mentor</th>
                <th className="py-3 px-6">Time (UTC)</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted text-sm">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted text-sm">No bookings found.</td>
                </tr>
              ) : (
                currentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-border-subtle last:border-b-0 hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-text-muted">
                      #{b.id.substring(0,6)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${b.user_name}&background=random`} alt={b.user_name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-bold text-primary">{b.user_name}</div>
                          <div className="text-xs text-text-muted">{b.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${b.mentor_name}&background=random`} alt={b.mentor_name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-bold text-primary">{b.mentor_name}</div>
                          <div className="text-xs text-text-muted">{b.mentor_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-primary font-medium">
                      {formatDate(b.start_time)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => alert(`View details for booking ${b.id}`)}
                        className="text-xs font-bold text-text-muted hover:text-primary underline transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && bookings.length > 0 && (
          <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between bg-surface-container-low/50">
            <span className="text-sm text-text-muted">
              Showing {Math.min(bookings.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(bookings.length, currentPage * itemsPerPage)} of {bookings.length} bookings
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-border-subtle bg-white rounded text-text-muted hover:bg-surface disabled:opacity-50 shadow-sm"
              ><ChevronLeft size={14} /></button>
              
              <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded font-medium text-sm shadow-sm">{currentPage}</button>
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-transparent text-primary hover:bg-surface rounded font-medium text-sm"
                >{currentPage + 1}</button>
              )}
              
              <button 
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 flex items-center justify-center border border-border-subtle bg-white rounded text-text-muted hover:bg-surface disabled:opacity-50 shadow-sm"
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
