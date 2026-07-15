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
        <div className="flex-[3] bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary">Set Availability</h3>
              <p className="text-sm text-text-muted mt-1">Define your recurring weekly time slots for mentoring.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={clearAll} className="px-4 py-2 border border-outline-variant text-secondary text-sm font-medium rounded hover:bg-surface-container-low transition-colors">
                Clear All
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          
          <TimeGrid 
            slots={slots} 
            editable={true} 
            onSlotsChange={setSlots} 
            startHour={9} 
            endHour={16} 
          />
        </div>

        {/* Right Sidebar: Confirmed Calls */}
        <div className="flex-1 bg-surface-container-lowest border border-border-subtle rounded-lg p-6 shadow-sm">
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
                  <div key={book.id} className="border border-border-subtle p-4 rounded-lg bg-white relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${book.user_name}&background=random`} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className="text-sm font-bold text-primary">{book.user_name}</h4>
                          <p className="text-xs font-mono text-text-muted">UX Design Mentee</p>
                        </div>
                      </div>
                      <TagPill label="BOOKED" color="green" />
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-text-muted mb-3 border-t border-b border-border-subtle py-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Video size={14} />
                      <span>Google Meet Session</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
