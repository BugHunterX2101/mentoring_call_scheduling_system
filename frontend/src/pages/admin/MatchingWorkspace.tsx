import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { TimeGrid, type TimeSlot } from '../../components/ui/TimeGrid';
import { Sparkles, Calendar, Search } from 'lucide-react';

export function MatchingWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingReq, setLoadingReq] = useState(true);
  
  // State for overlap analysis
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [overlapSlots, setOverlapSlots] = useState<TimeSlot[]>([]);
  const [loadingOverlap, setLoadingOverlap] = useState(false);

  useEffect(() => {
    // Fetch requirement and automatically run matches
    apiClient.fetch(`/requirements/${id}`)
      .then(data => {
        setRequirement(data);
        return apiClient.fetch(`/recommendations/${id}`, { method: 'POST' });
      })
      .then(result => {
        setMatches(result.matches);
        if (result.matches.length > 0) {
          handleSelectMentor(result.matches[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingReq(false));
  }, [id]);

  const handleSelectMentor = async (mentor: any) => {
    setSelectedMentor(mentor);
    setLoadingOverlap(true);
    try {
      const res = await apiClient.fetch(`/availability/overlap?userId=${requirement?.user_id || ''}&mentorId=${mentor.id}`);
      if (res.overlap) {
        setOverlapSlots(res.overlap.map((s: any) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          type: 'overlap'
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOverlap(false);
    }
  };

  const confirmBooking = async (mentorId: string, day: number, hour: number) => {
    // Determine the next date that matches 'day_of_week' = day
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntil = (day - currentDay + 7) % 7;
    const addDays = daysUntil === 0 ? 7 : daysUntil; // always in the future
    today.setDate(today.getDate() + addDays);
    
    const start = new Date(today);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(today);
    end.setHours(hour + 1, 0, 0, 0);

    try {
      await apiClient.fetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          requirementId: id,
          userId: requirement.user_id,
          mentorId,
          startTime: start.toISOString(),
          endTime: end.toISOString()
        })
      });
      navigate('/admin/requirements');
    } catch (e) {
      console.error(e);
      alert('Error booking');
    }
  };

  if (loadingReq) return <DashboardLayout><p className="p-8 text-text-muted">Loading workspace...</p></DashboardLayout>;
  if (!requirement) return <DashboardLayout><p className="p-8 text-text-muted">Requirement not found</p></DashboardLayout>;

  return (
    <DashboardLayout title="Match Workspace" searchPlaceholder="Search mentors, tags...">
      <div className="flex gap-6 items-start h-[calc(100vh-140px)]">
        
        {/* Left Column: Mentee Requirement Details */}
        <div className="flex-1 bg-white border border-border-subtle rounded-lg p-6 shadow-sm overflow-auto h-full">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
             <img src={`https://ui-avatars.com/api/?name=${requirement.user_name}&background=random`} alt={requirement.user_name} className="w-12 h-12 rounded-full" />
             <div>
               <h3 className="font-bold text-primary">{requirement.user_name}</h3>
               <p className="text-xs text-text-muted">{requirement.user_name.toLowerCase().replace(' ', '.')}@example.com</p>
             </div>
          </div>
          
          <div className="mb-6">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Request Subject</span>
            <h4 className="text-sm font-bold text-primary mb-4">Resume Revamp for Career Pivot</h4>
            
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Call Type</span>
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center">
                 <Calendar size={14} className="text-text-muted" />
               </div>
               <span className="text-sm font-bold text-primary">{requirement.call_type.replace(/_/g, ' ')} (45m)</span>
            </div>
          </div>
          
          <div className="mb-6">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Mentee Context</span>
            <p className="text-sm text-primary leading-relaxed italic">
              "{requirement.description}"
            </p>
          </div>
          
          <div className="mb-6">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Preferred Timeline</span>
            <p className="text-sm font-bold text-blue-600">Next 7 Days</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 relative mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Admin Note</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Ensure mentor has recent FAANG experience. Mentee specifically requested someone who transitioned from IC to management within the last 2 years.
            </p>
          </div>
          
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Target Skills</span>
            <div className="flex flex-wrap gap-2">
              {(requirement.user_tags || []).map((t: string) => <TagPill key={t} label={t} color="gray" />)}
            </div>
          </div>
        </div>

        {/* Middle Column: Ranked Matches */}
        <div className="flex-[1.3] bg-white border border-border-subtle rounded-lg flex flex-col h-full overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-white">
            <h3 className="font-bold text-primary">Ranked Matches</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-widest">
              {matches.length} Matches
            </span>
          </div>
          
          <div className="flex-1 overflow-auto bg-surface-container-lowest p-4 space-y-4">
            {matches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <Search size={32} className="mb-4 text-border-subtle" />
                <h4 className="font-bold text-primary mb-1">No Matches Found</h4>
                <p className="text-xs">Try adjusting the requirement tags or checking mentor availability.</p>
              </div>
            ) : (
              matches.map(m => (
              <div 
                key={m.id} 
                onClick={() => handleSelectMentor(m)}
                className={`bg-white border rounded-lg p-5 cursor-pointer transition-all ${selectedMentor?.id === m.id ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-border-subtle hover:border-outline-variant hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${m.name}&background=random`} alt={m.name} className="w-10 h-10 rounded-md object-cover border border-border-subtle" />
                    <div>
                      <h4 className="font-bold text-primary">{m.name}</h4>
                      <p className="text-[10px] font-mono text-text-muted mt-0.5">{m.description || 'Senior Engineer'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600 tracking-wider">{m.fit_score}% FIT</span>
                </div>
                
                <div className="bg-surface-container-lowest border border-border-subtle p-3 rounded text-sm mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">AI Rationale</span>
                  </div>
                  <p className="text-text-muted text-[11px] leading-relaxed line-clamp-2">{m.rationale}</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                  <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-text-muted" />
                     <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">12 Slots</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-amber-400 text-sm">★</span>
                     <span className="text-[11px] font-bold text-primary">4.9 <span className="text-text-muted font-normal">(120)</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Overlap Analysis */}
        <div className="flex-[1.5] flex flex-col gap-6 h-full">
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-primary">Overlap Analysis</h3>
            </div>
            
            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Mentor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">User</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm border-2 border-dashed border-border-subtle bg-surface-container-low"></div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Overlap</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto pb-4">
               {loadingOverlap ? (
                 <div className="h-full flex items-center justify-center text-text-muted text-sm">Analyzing calendars...</div>
               ) : (
                 <div onClick={() => {
                   if (overlapSlots.length > 0) {
                      const s = overlapSlots[0];
                      confirmBooking(selectedMentor?.id, s.day_of_week, parseInt(s.start_time.split(':')[0]));
                   }
                 }}>
                   <TimeGrid 
                     slots={overlapSlots}
                     editable={false}
                     startHour={9}
                     endHour={15}
                   />
                 </div>
               )}
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-6 shadow-sm flex items-center justify-between">
             <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Final Booking Slot</span>
                <p className="text-sm font-bold text-primary">
                  {overlapSlots.length > 0 ? 'Selected Slot' : 'No slot selected'}
                </p>
             </div>
             <button 
                disabled={overlapSlots.length === 0 || !selectedMentor}
                className="bg-green-600 text-white px-6 py-3 rounded text-sm font-bold shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                   if (overlapSlots.length > 0 && selectedMentor) {
                      const s = overlapSlots[0];
                      confirmBooking(selectedMentor.id, s.day_of_week, parseInt(s.start_time.split(':')[0]));
                   }
                }}
             >
                Confirm Booking
             </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
