import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TimeGrid, type TimeSlot } from '../../components/ui/TimeGrid';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function MentorDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [performance, setPerformance] = useState({ score: 85, metric: 'Base compatibility rating' });

  const fetchData = useCallback(async () => {
    try {
      const [bookingsData, availData, perfData] = await Promise.all([
        apiClient.fetch('/bookings/me'),
        apiClient.fetch('/availability/me'),
        apiClient.fetch('/mentors/me/performance').catch(() => ({ score: 0, metric: 'No ratings yet' }))
      ]);
      
      setBookings(bookingsData.bookings || []);
      if (perfData && perfData.score !== undefined) {
        setPerformance(perfData);
      }
      
      if (availData.slots) {
        setSlots(availData.slots.map((s: any) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          type: 'available'
        })));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await apiClient.fetch('/availability/me', {
        method: 'PUT',
        body: JSON.stringify({ slots: slots.map(s => ({ ...s, timezone: 'UTC', is_recurring: true })) })
      });
      fetchData(); // Refresh UI
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const clearAll = () => setSlots([]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Cancel this booked session?')) return;
    try {
      await apiClient.fetch(`/bookings/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout title="Schedule Overview" searchPlaceholder="Search sessions...">
      <div className="flex gap-8 items-start">
        {/* Main Content: Set Availability */}
        <div className="flex-[2.5] bg-white border border-border-subtle rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-border-subtle">
            <div>
              <h3 className="text-lg font-bold text-primary">Set Availability</h3>
              <p className="text-sm text-text-muted mt-1">Define your recurring weekly time slots for mentoring.</p>
            </div>
          </div>
          
          <div className="p-6">
            <TimeGrid 
              slots={slots} 
              editable={true} 
              onSlotsChange={setSlots} 
              startHour={9} 
              endHour={16} 
            />
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <button onClick={clearAll} className="px-4 py-2 border border-border-subtle text-text-muted hover:text-primary text-sm font-bold rounded shadow-sm hover:bg-surface-container-low transition-colors">
                Clear All
              </button>
              <button 
                onClick={handleSave} 
                disabled={saveStatus === 'saving'}
                className={`px-4 py-2 text-white text-sm font-bold rounded shadow-sm transition-colors disabled:opacity-50 ${
                  saveStatus === 'success' ? 'bg-[#059669] hover:bg-[#047857]' : 
                  saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600' : 
                  'bg-primary hover:bg-primary/90'
                }`}
              >
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'success' ? '✓ Saved!' : 
                 saveStatus === 'error' ? 'Failed!' : 
                 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-[1.2] flex flex-col gap-6">
          {/* Match Performance */}
          <div className="bg-primary text-white rounded-lg p-6 shadow-sm flex flex-col justify-between relative overflow-hidden h-[180px]">
             <div className="flex justify-between items-start relative z-10">
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Match Performance</span>
               <div className="flex gap-4">
                 <a href="#" className="text-[10px] font-bold text-white/80 hover:text-white">Privacy</a>
                 <a href="#" className="text-[10px] font-bold text-white/80 hover:text-white">Support</a>
               </div>
             </div>
             
             <div className="mt-12 relative z-10">
               <h2 className="text-5xl font-bold mb-2">{performance.score}%</h2>
               <p className="text-xs text-white/80">{performance.metric}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Confirmed Calls Table (Full Width) */}
      <div className="mt-8 bg-surface-container-lowest border border-border-subtle rounded-lg shadow-sm w-full">
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-lg font-bold text-primary">Confirmed Calls</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted bg-surface border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-normal">Mentee</th>
                <th className="px-6 py-4 font-normal">Date (UTC)</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-text-muted">No confirmed calls found.</td>
                </tr>
              ) : (
                bookings.map(book => {
                  const date = new Date(book.start_time);
                  return (
                    <tr key={book.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-container-low">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={`https://ui-avatars.com/api/?name=${book.user_name}&background=random`} alt="" className="w-8 h-8 rounded-full border border-border-subtle" />
                           <div>
                             <h4 className="font-bold text-primary text-xs">{book.user_name}</h4>
                             <p className="text-[10px] font-mono text-text-muted mt-0.5">{book.user_tags && book.user_tags.length > 0 ? book.user_tags[0] : 'Mentee'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted text-xs">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                         <StatusBadge status={book.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => handleCancelBooking(book.id)}
                           className="px-3 py-1.5 rounded bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                         >
                           Cancel
                         </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
