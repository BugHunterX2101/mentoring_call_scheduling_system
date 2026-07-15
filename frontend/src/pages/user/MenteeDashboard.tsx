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

  // Added States for Button Interactivity
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);

  // Date Calculation
  const getWeekDates = (offset: number) => {
    const start = new Date(2024, 6, 14); // Baseline July 14, 2024 as per design
    start.setDate(start.getDate() + (offset * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', formatOpts)} — ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

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
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center hover:bg-surface-container-low transition-colors"
                >
                   <ChevronLeft size={16} className="text-primary" />
                </button>
                <span className="text-sm font-bold text-primary w-[140px] text-center">{getWeekDates(weekOffset)}</span>
                <button 
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center hover:bg-surface-container-low transition-colors"
                >
                   <ChevronRight size={16} className="text-primary" />
                </button>
              </div>
            </div>
            
            <TimeGrid 
              slots={slots} 
              editable={true} 
              onSlotsChange={setSlots} 
              startHour={9} 
              endHour={15} 
            />
            
            <div className="mt-6 flex justify-end pt-4 border-t border-border-subtle">
              <button 
                onClick={handleSaveAvailability} 
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Schedule'}
              </button>
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
                <label className="block text-xs font-bold text-primary mb-2">Preferred Skills (Tags)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                     <div key={t} onClick={() => removeTag(t)}>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-container-low text-primary cursor-pointer hover:bg-surface-container-high border border-border-subtle">
                          {t} <span className="ml-1 text-text-muted">✕</span>
                        </span>
                     </div>
                  ))}
                </div>
                <div className="flex items-center border border-border-subtle border-dashed rounded-full px-3 py-1.5 w-max hover:bg-surface-container-low transition-colors">
                  <span className="text-text-muted text-xs mr-1">+</span>
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add Tag"
                    className="text-xs text-primary outline-none bg-transparent w-20"
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-primary text-white py-3 rounded text-sm font-bold hover:bg-primary/90 transition-colors mt-2 shadow-sm">
                Post Request
              </button>
            </form>
          </div>

          {/* AI Match Helper */}
          {aiSummary && (
            <div className="bg-primary text-white rounded-lg p-6 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-3">AI Match Helper</h3>
                <p className="text-xs text-white/90 mb-6 leading-relaxed max-w-[90%]">
                  Based on your recent availability, we found {aiSummary.matchCount} mentors in your timezone specializing in your requested skills.
                </p>
                <button 
                  onClick={() => {
                     document.getElementById('my-requests-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white text-primary text-xs font-bold px-4 py-2.5 rounded shadow hover:bg-surface transition-colors"
                >
                  View Matches
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* My Requests (Full Width Bottom) */}
      <div id="my-requests-section" className="mt-8 bg-surface-container-lowest border border-border-subtle rounded-lg shadow-sm w-full">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">My Requests</h3>
          <button 
            onClick={() => alert("Full history view is in development.")}
            className="text-xs font-bold text-blue-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            View All History
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted bg-surface border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-normal">Type</th>
                <th className="px-6 py-4 font-normal">Requested Date</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Mentor</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-text-muted">No requests found.</td>
                </tr>
              ) : (
                requirements.map(req => (
                  <React.Fragment key={req.id}>
                    <tr className="border-b border-border-subtle last:border-0 hover:bg-surface-container-low">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText size={16} />
                          </div>
                          <span className="font-bold text-primary text-xs">{req.call_type.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted text-xs">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'pending' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-600 border border-amber-200">
                            Pending
                          </span>
                        ) : (
                          <TagPill label={req.status} color="green" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-xs">
                         {req.status === 'pending' ? 'Matching in progress...' : 'Matched'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => setExpandedReqId(expandedReqId === req.id ? null : req.id)}
                           className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center ml-auto hover:bg-primary/90 transition-colors shadow"
                         >
                            <Plus size={20} className={`transition-transform duration-200 ${expandedReqId === req.id ? 'rotate-45' : ''}`} />
                         </button>
                      </td>
                    </tr>
                    {expandedReqId === req.id && (
                      <tr className="bg-surface-container-lowest border-b border-border-subtle">
                         <td colSpan={5} className="px-6 py-4">
                            <div className="text-sm p-4 bg-surface rounded-lg border border-border-subtle">
                               <p className="font-bold text-primary mb-2">Request Context:</p>
                               <p className="text-text-muted italic mb-4">"{req.description}"</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-primary">Required Tags:</span>
                                  <div className="flex gap-2">
                                     {(req.user_tags || []).map((t: string) => <TagPill key={t} label={t} color="gray" />)}
                                     {(!req.user_tags || req.user_tags.length === 0) && <span className="text-xs text-text-muted">None specified</span>}
                                  </div>
                               </div>
                            </div>
                         </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
