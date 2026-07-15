import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { TimeGrid, type TimeSlot } from '../../components/ui/TimeGrid';
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export function MenteeDashboard() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [callType, setCallType] = useState('Resume Revamp');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [reqsData, availData] = await Promise.all([
        apiClient.fetch('/requirements/me'),
        apiClient.fetch('/availability/me')
      ]);
      setRequirements(reqsData.requirements || []);
      
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

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      await apiClient.fetch('/availability/me', {
        method: 'PUT',
        body: JSON.stringify({ slots: slots.map(s => ({ ...s, timezone: 'UTC', is_recurring: true })) })
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await apiClient.fetch('/requirements', {
        method: 'POST',
        body: JSON.stringify({ callType, description, tags: tagArray })
      });
      setDescription('');
      setTags('');
      fetchData(); // Auto-refresh UI
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout title="Schedule Overview" searchPlaceholder="Search sessions...">
      <div className="flex gap-8 items-start">
        
        {/* Left Column */}
        <div className="flex-[2.5] flex flex-col gap-8">
          
          {/* My Availability */}
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-primary">My Availability</h3>
                <p className="text-sm text-text-muted mt-1">Select slots to indicate when you are free for mentoring sessions.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="p-1 border border-border-subtle rounded hover:bg-surface-container-low"><ChevronLeft size={16} /></button>
                  <span className="text-sm font-semibold text-primary px-2">July 14 — 20, 2024</span>
                  <button className="p-1 border border-border-subtle rounded hover:bg-surface-container-low"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
            
            <TimeGrid 
              slots={slots} 
              editable={true} 
              onSlotsChange={setSlots} 
              startHour={9} 
              endHour={15} 
            />
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSaveAvailability} 
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>

          {/* My Requests */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-lg shadow-sm">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">My Requests</h3>
              <button className="text-sm text-blue-600 font-medium hover:underline">View All History</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-surface border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Requested Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Mentor</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-text-muted">No requests found.</td>
                    </tr>
                  ) : (
                    requirements.map(req => (
                      <tr key={req.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-container-low">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                              <FileText size={16} />
                            </div>
                            <span className="font-semibold text-primary">{req.call_type.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">{new Date(req.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-6 py-4">
                          <TagPill label={req.status} color={req.status === 'pending' ? 'amber' : 'green'} />
                        </td>
                        <td className="px-6 py-4 text-text-muted italic">Matching in progress...</td>
                        <td className="px-6 py-4 text-right">
                           <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center hover:bg-primary/90 ml-auto">
                             <Plus size={16} />
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="flex-[1.2] flex flex-col gap-6">
          
          {/* Submit New Requirement */}
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-1">Submit New Requirement</h3>
            <p className="text-sm text-text-muted mb-6">Describe what you need help with to get matched.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Call Type</label>
                <select 
                  value={callType} onChange={e => setCallType(e.target.value)}
                  className="w-full border border-border-subtle rounded-md p-2.5 text-sm text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Resume Revamp">Resume Revamp</option>
                  <option value="Career Pivot">Career Pivot</option>
                  <option value="System Architecture">System Architecture</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Tell us more about your goals..."
                  className="w-full border border-border-subtle rounded-md p-3 h-28 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">Preferred Skills (Tags)</label>
                <div className="flex gap-2 mb-2">
                  <TagPill label="Python x" color="gray" className="cursor-pointer hover:bg-surface-container-high" />
                  <TagPill label="FinTech x" color="gray" className="cursor-pointer hover:bg-surface-container-high" />
                </div>
                <button type="button" className="text-xs text-text-muted border border-dashed border-outline-variant px-3 py-1 rounded hover:bg-surface-container-low transition-colors">
                  + Add Tag
                </button>
              </div>
              
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-md text-sm font-bold hover:bg-primary/90 transition-colors mt-2">
                Post Request
              </button>
            </form>
          </div>

          {/* AI Match Helper */}
          <div className="bg-primary text-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-2">AI Match Helper</h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Based on your recent availability, we found 3 mentors in your timezone specializing in React Architecture.
            </p>
            <button className="bg-white text-primary text-sm font-bold px-4 py-2 rounded shadow hover:bg-surface transition-colors">
              View Matches
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
