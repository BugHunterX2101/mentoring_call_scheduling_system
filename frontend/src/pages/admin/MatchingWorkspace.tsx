import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { TimeGrid, type TimeSlot } from '../../components/ui/TimeGrid';
import { Zap, Video, Calendar, Search, UserCircle } from 'lucide-react';

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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

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
    setSelectedTimeSlot(null);
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

  const confirmBooking = async () => {
    if (!selectedMentor || !selectedTimeSlot) return;
    
    const day = selectedTimeSlot.day_of_week;
    const hour = parseInt(selectedTimeSlot.start_time.split(':')[0]);
    
    // Determine the next date that matches 'day_of_week' = day
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = (day - currentDay + 7) % 7;
    if (daysUntil <= 0) daysUntil += 7;
    today.setDate(today.getDate() + daysUntil);
    
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
          mentorId: selectedMentor.id,
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

  const formatSelectedSlot = (slot: TimeSlot | null) => {
    if (!slot) return 'No slot selected';
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][slot.day_of_week];
    const startTime = slot.start_time.substring(0,5);
    return `${dayName} @ ${startTime}`;
  };

  if (loadingReq) return <DashboardLayout><p className="p-8 text-text-muted">Loading workspace...</p></DashboardLayout>;
  if (!requirement) return <DashboardLayout><p className="p-8 text-text-muted">Requirement not found</p></DashboardLayout>;

  return (
    <DashboardLayout title="Schedule Overview" searchPlaceholder="Search resources...">
      <div className="flex gap-6 items-start h-[calc(100vh-140px)]">
        
        {/* Left Column: Mentee Requirement Details */}
        <div className="flex-1 bg-white border border-border-subtle rounded-sm p-6 shadow-sm overflow-auto h-full">
          <div className="flex items-center gap-4 mb-4">
             <img src={`https://ui-avatars.com/api/?name=${requirement.user_name}&background=random`} alt={requirement.user_name} className="w-10 h-10 rounded-sm" />
             <h3 className="text-lg font-bold text-primary">{requirement.user_name}</h3>
          </div>
          
          <div className="flex flex-col gap-2 mb-8 pb-8 border-b border-border-subtle">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-surface-container-low text-[10px] font-bold text-text-muted uppercase tracking-widest rounded-sm">RESUME REVAMP</span>
              <span className="px-2 py-1 bg-surface-container-low text-[10px] font-bold text-text-muted uppercase tracking-widest rounded-sm">TECH INDUSTRY</span>
            </div>
          </div>
          
          <div className="mb-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Request Subject</span>
            <h4 className="text-sm text-primary mb-6">Resume Revamp for Career Pivot</h4>
            
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Call Type</span>
            <div className="flex items-center gap-2 mb-6">
               <Video size={16} className="text-primary" />
               <span className="text-sm text-primary">1-on-1 Video Session (45m)</span>
            </div>
          </div>
          
          <div className="mb-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Description</span>
            <p className="text-xs text-text-muted leading-relaxed">
              {requirement.description || "Looking to transition from Marketing Operations to Product Management. Needs a mentor with experience in top-tier tech firms who can review current resume and provide strategic structural feedback."}
            </p>
          </div>
          
          <div className="mb-6">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Preferred Timeline</span>
            <p className="text-sm text-blue-500">As soon as possible / Within 5 days</p>
          </div>
          
          <div className="border border-border-subtle rounded-sm p-4 relative mt-8">
            <div className="flex items-center gap-2 mb-2">
              <UserCircle size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Admin Note</span>
            </div>
            <p className="text-xs text-primary leading-relaxed italic">
              Focus on mentors who have successfully pivoted or managed pivoters.
            </p>
          </div>
        </div>

        {/* Middle Column: Ranked Matches */}
        <div className="flex-[1.3] bg-white border border-border-subtle rounded-sm flex flex-col h-full overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-subtle bg-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-primary mb-1">Ranked Matches</h3>
              <p className="text-xs text-text-muted">AI-assisted recommendations</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-primary uppercase tracking-widest">
              {matches.length} Matches
            </span>
          </div>
          
          <div className="flex-1 overflow-auto bg-white p-4 space-y-4">
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
                className={`bg-white border rounded-sm p-5 cursor-pointer transition-all ${selectedMentor?.id === m.id ? 'border-2 border-primary shadow-sm' : 'border-border-subtle hover:border-outline-variant hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${m.name}&background=random`} alt={m.name} className="w-10 h-10 rounded-sm object-cover" />
                    <div>
                      <h4 className="font-bold text-primary text-sm">{m.name}</h4>
                      <p className="text-[11px] text-text-muted mt-0.5">{m.description || 'Senior PM @ Google'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest ${m.fit_score >= 90 ? 'bg-green-100 text-green-700' : 'bg-surface-container-low text-text-muted'}`}>
                    {m.fit_score}% FIT
                  </span>
                </div>
                
                <div className="bg-[#F8FAFC] border border-border-subtle p-3 rounded-sm text-sm mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">AI Rationale</span>
                  </div>
                  <p className="text-primary text-[11px] leading-relaxed line-clamp-2">{m.rationale}</p>
                </div>
                
                <div className="flex items-center justify-start gap-6 pt-2">
                  <div className="flex items-center gap-1.5">
                     <Calendar size={12} className="text-text-muted" />
                     <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">12 Slots</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <span className="text-text-muted text-xs">☆</span>
                     <span className="text-[10px] font-bold text-text-muted tracking-widest">4.9 (120)</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        {/* Right Column: Overlap Analysis */}
        <div className="flex-[1.8] flex flex-col gap-6 h-full">
          <div className="bg-white border border-border-subtle rounded-sm p-6 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="font-bold text-primary mb-1">Overlap Analysis</h3>
                <p className="text-xs text-text-muted">{selectedMentor?.name} vs {requirement.user_name}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-primary"></div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Mentor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500"></div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">User</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-surface-container-low border border-border-subtle"></div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Overlap</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
               {loadingOverlap ? (
                 <div className="h-full flex items-center justify-center text-text-muted text-sm">Analyzing calendars...</div>
               ) : (
                 <TimeGrid 
                   slots={overlapSlots}
                   editable={false}
                   startHour={9}
                   endHour={15}
                   selectedSlot={selectedTimeSlot}
                   onSlotSelect={setSelectedTimeSlot}
                   displayDays={[1, 2, 3, 4, 5]} // Mon-Fri as per design
                 />
               )}
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-border-subtle rounded-sm p-6 shadow-sm flex items-center justify-between">
             <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Final Booking Slot</span>
                <p className="text-sm font-bold text-primary">
                  {formatSelectedSlot(selectedTimeSlot)}
                </p>
             </div>
             <button 
                disabled={!selectedTimeSlot}
                className="bg-[#059669] text-white px-6 py-3 rounded-sm text-sm font-bold shadow-sm hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={confirmBooking}
             >
                <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
                Confirm Booking
             </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
