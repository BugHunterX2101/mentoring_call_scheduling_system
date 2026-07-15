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
  
  // Dynamic Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // AI Summary State
  const [aiSummary, setAiSummary] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [reqsData, availData, aiData] = await Promise.all([
        apiClient.fetch('/requirements/me'),
        apiClient.fetch('/availability/me'),
        apiClient.fetch('/recommendations/summary')
      ]);
      setRequirements(reqsData.requirements || []);
      setAiSummary(aiData);
      
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
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.fetch('/requirements', {
        method: 'POST',
        body: JSON.stringify({ callType, description, tags })
      });
      setDescription('');
      setTags([]);
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
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-surface border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Requested Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-text-muted">No requests found.</td>
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
                        <td className="px-6 py-4 text-text-muted">{new Date(req.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <TagPill label={req.status} color={req.status === 'pending' ? 'amber' : 'green'} />
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
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                     <div key={t} onClick={() => removeTag(t)}>
                        <TagPill label={`${t} ✕`} color="gray" className="cursor-pointer hover:bg-surface-container-high" />
                     </div>
                  ))}
                </div>
                <input 
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter..."
                  className="w-full border border-border-subtle rounded-md p-2 text-sm text-primary outline-none"
                />
              </div>
              
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-md text-sm font-bold hover:bg-primary/90 transition-colors mt-2">
                Post Request
              </button>
            </form>
          </div>

          {/* AI Match Helper */}
          {aiSummary && (
            <div className="bg-primary text-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">AI Match Helper</h3>
              <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                {aiSummary.summary}
              </p>
              <div className="flex items-center justify-between mt-4 border-t border-white/20 pt-4">
                 <div>
                    <span className="block text-xs font-bold text-blue-200 uppercase tracking-wider">Matches</span>
                    <span className="text-xl font-bold">{aiSummary.matchCount}</span>
                 </div>
                 <div>
                    <span className="block text-xs font-bold text-blue-200 uppercase tracking-wider">Network</span>
                    <span className="text-xl font-bold">{aiSummary.totalMentors} Mentors</span>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
