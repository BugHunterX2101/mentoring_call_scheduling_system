import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { TimeGrid, TimeSlot } from '../../components/ui/TimeGrid';
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
    // For simplicity in this demo, just book for tomorrow at 'hour'
    const today = new Date();
    today.setDate(today.getDate() + 1);
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
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Call Type</span>
            <TagPill label={requirement.call_type.replace(/_/g, ' ').toUpperCase()} color="blue" />
          </div>
          
          <div className="mb-6">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Mentee Context</span>
            <p className="text-sm text-primary leading-relaxed">
              {requirement.description}
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
        <div className="flex-[1.3] bg-surface-container-lowest border border-border-subtle rounded-lg flex flex-col h-full overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-white">
            <h3 className="font-bold text-primary">Ranked Matches</h3>
            <span className="text-xs text-text-muted">{matches.length} matches found</span>
          </div>
          
          <div className="flex-1 overflow-auto bg-surface p-4 space-y-4">
            {matches.map(m => (
              <div 
                key={m.id} 
                onClick={() => handleSelectMentor(m)}
                className={`bg-white border rounded-lg p-5 cursor-pointer transition-colors ${selectedMentor?.id === m.id ? 'border-primary ring-1 ring-primary' : 'border-border-subtle hover:border-outline-variant'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${m.name}&background=random`} alt={m.name} className="w-10 h-10 rounded-md object-cover" />
                    <div>
                      <h4 className="font-bold text-primary">{m.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{m.description || 'Senior Engineer'}</p>
                    </div>
                  </div>
                  <TagPill label={`${m.fit_score}% FIT`} color="green" />
                </div>
                
                <div className="bg-surface p-3 rounded text-sm mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Rationale</span>
                  </div>
                  <p className="text-text-muted text-xs leading-relaxed">{m.rationale}</p>
                </div>
                
                <button 
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                     e.stopPropagation();
                     // Default book first slot
                     if (overlapSlots.length > 0) {
                        const s = overlapSlots[0];
                        confirmBooking(m.id, s.day_of_week, parseInt(s.start_time.split(':')[0]));
                     } else {
                        alert("No mutual overlap to book automatically.");
                     }
                  }}
                >
                  <Calendar size={16} />
                  Schedule Session
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Overlap Analysis */}
        <div className="flex-[1.5] bg-white border border-border-subtle rounded-lg p-6 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-primary">Overlap Analysis</h3>
            {selectedMentor && <span className="text-xs font-medium text-text-muted">Comparing with {selectedMentor.name.split(' ')[0]}</span>}
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
              <span className="text-xs text-text-muted">Mentee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span className="text-xs text-text-muted">Mentor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-dashed border-blue-400 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgogIDxwYXRoIGQ9Ik0tMiAxMEwxMCAyWk0xMCAxNEwyIC0yWiIgc3Ryb2tlPSIjYmZjYmZkIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+')]"></div>
              <span className="text-xs font-bold text-primary">Mutual Overlap</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto pb-4">
             {loadingOverlap ? (
               <div className="h-full flex items-center justify-center text-text-muted">Analyzing calendars...</div>
             ) : (
               <TimeGrid 
                 slots={overlapSlots}
                 editable={false}
                 startHour={9}
                 endHour={17}
               />
             )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
