import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TimeGrid, type TimeSlot } from '../../components/ui/TimeGrid';
import { Calendar, Video, Phone } from 'lucide-react';
import { TagPill } from '../../components/ui/TagPill';

export function MentorDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Added State for Button Interactivity
  const [weekOffset, setWeekOffset] = useState(0);

  // Date Calculation
  const getWeekDates = (offset: number) => {
    const start = new Date(2024, 6, 14); // Baseline July 14, 2024
    start.setDate(start.getDate() + (offset * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, availData] = await Promise.all([
        apiClient.fetch('/bookings/me'),
        apiClient.fetch('/availability/me')
      ]);
      setBookings(bookingsData.bookings);
      
      // Parse availability slots
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
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.fetch('/availability/me', {
        method: 'PUT',
        body: JSON.stringify({ slots: slots.map(s => ({ ...s, timezone: 'UTC', is_recurring: true })) })
      });
      alert('Availability saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

  const clearAll = () => setSlots([]);

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
            <div className="flex items-center gap-3">
              <button onClick={clearAll} className="px-4 py-2 border border-border-subtle text-text-muted hover:text-primary text-sm font-bold rounded shadow-sm hover:bg-surface-container-low transition-colors">
                Clear All
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
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
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex-[1.2] flex flex-col gap-6">
          
          {/* Confirmed Calls */}
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-1">Confirmed Calls</h3>
            <p className="text-sm text-text-muted mb-6">Upcoming confirmed mentor-mentee sessions.</p>
            
            {bookings.length === 0 ? (
              <p className="text-sm text-text-muted">No confirmed calls yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map(book => {
                  const date = new Date(book.start_time);
                  const endDate = new Date(book.end_time);
                  return (
                    <div key={book.id} className="border border-border-subtle p-5 rounded-lg bg-white shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${book.user_name}&background=random`} alt="" className="w-10 h-10 rounded-full border border-border-subtle" />
                          <div>
                            <h4 className="text-sm font-bold text-primary">{book.user_name}</h4>
                            <p className="text-xs font-mono text-text-muted mt-0.5">UX Design Mentee</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-widest">
                          Booked
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-4 border-t border-b border-border-subtle py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-text-muted" />
                          <span className="font-medium">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-border-subtle pl-4">
                          <span className="font-medium">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                        <Video size={14} />
                        <span>Google Meet Session</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Match Performance */}
          <div className="bg-primary text-white rounded-lg p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="flex justify-between items-start relative z-10">
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Match Performance</span>
               <div className="flex gap-4">
                 <a href="#" className="text-[10px] font-bold text-white/80 hover:text-white">Privacy</a>
                 <a href="#" className="text-[10px] font-bold text-white/80 hover:text-white">Support</a>
               </div>
             </div>
             
             <div className="mt-12 relative z-10">
               <h2 className="text-5xl font-bold mb-2">94%</h2>
               <p className="text-xs text-white/80">Compatibility rating this month</p>
             </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
