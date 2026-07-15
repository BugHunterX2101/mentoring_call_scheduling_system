import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export function MentorDirectory() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.fetch('/mentors')
      .then(data => setMentors(data.mentors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredMentor = mentors.length > 0 ? mentors[0] : null;
  const otherMentors = mentors.length > 1 ? mentors.slice(1) : [];

  return (
    <DashboardLayout title="Mentor Directory" searchPlaceholder="Search mentors, tags, skills...">
      {/* Quick Filters */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Quick Filters:</span>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-full">All Mentors</button>
            <button className="px-4 py-1.5 bg-white border border-border-subtle text-text-muted text-sm font-medium rounded-full hover:bg-surface">Active Only</button>
            <button className="px-4 py-1.5 bg-white border border-border-subtle text-text-muted text-sm font-medium rounded-full hover:bg-surface">FAANG</button>
            <button className="px-4 py-1.5 bg-white border border-border-subtle text-text-muted text-sm font-medium rounded-full hover:bg-surface">Senior Tech</button>
            <button className="px-4 py-1.5 bg-white border border-border-subtle text-text-muted text-sm font-medium rounded-full hover:bg-surface flex items-center gap-1">
              <span>+</span> More
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-text-muted">{mentors.length} Mentors Total</span>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-border-subtle text-primary text-sm font-medium rounded hover:bg-surface">
            <SlidersHorizontal size={14} />
            Advanced Filters
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading directory...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Row: Featured Mentor + Network Health */}
          <div className="flex gap-6">
            
            {/* Featured Mentor Card */}
            {featuredMentor && (
              <div className="flex-[2] bg-white border border-border-subtle rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <img src={`https://ui-avatars.com/api/?name=${featuredMentor.name}&background=random`} alt={featuredMentor.name} className="w-16 h-16 rounded-md object-cover" />
                      <div>
                        <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                          {featuredMentor.name}
                          <TagPill label="ACTIVE" color="green" />
                        </h3>
                        <p className="text-sm text-text-muted mt-1">{featuredMentor.description || 'Senior Engineer'} • 15+ years exp.</p>
                      </div>
                    </div>
                    {/* Toggle Switch Mock */}
                    <div className="w-10 h-6 bg-green-500 rounded-full flex items-center px-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">System Tags</span>
                    <div className="flex flex-wrap gap-2">
                      <TagPill label="FAANG" color="gray" />
                      <TagPill label="Engineering Leadership" color="gray" />
                      <TagPill label="Career Strategy" color="gray" />
                      <button className="text-xs text-text-muted border border-dashed border-outline-variant px-3 py-1 rounded hover:bg-surface-container-low transition-colors ml-auto">
                        + Edit Tags
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border-l-4 border-blue-500 rounded-r p-4 mt-4 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Profile Rationale</span>
                  </div>
                  <p className="text-sm text-primary">
                    High-availability systems specialist. Expert in transitioning ICs to Management. 
                    Prefers mentorships focused on technical depth and organizational scaling. Heavily weighted for senior-level matches.
                  </p>
                </div>
              </div>
            )}

            {/* Network Health Card */}
            <div className="flex-1 bg-primary text-white rounded-lg p-6 flex flex-col justify-between">
               <div>
                 <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Network Health</span>
                 <h3 className="text-xl font-bold">Matching Efficiency</h3>
               </div>
               <div className="mt-8">
                 <div className="text-5xl font-bold mb-2">94%</div>
                 <p className="text-sm text-text-muted">Avg. satisfaction score for directory-led matches this month.</p>
               </div>
            </div>
          </div>

          {/* Grid of Other Mentors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherMentors.map(m => (
              <div key={m.id} className="bg-white border border-border-subtle rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${m.name}&background=random`} alt={m.name} className="w-10 h-10 rounded-md object-cover" />
                      <div>
                        <h4 className="font-bold text-primary">{m.name}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{m.description || 'Mentor'}</p>
                      </div>
                    </div>
                    {/* Toggle Switch Mock */}
                    <div className="w-8 h-5 bg-green-500 rounded-full flex items-center px-0.5 cursor-pointer">
                      <div className="w-3.5 h-3.5 bg-white rounded-full ml-auto"></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(m.tags || ['General']).map((t: string) => <TagPill key={t} label={t} color="gray" />)}
                  </div>
                  
                  <p className="text-sm text-text-muted italic mb-6">
                    "Focused on high-fidelity prototyping and stakeholder management..."
                  </p>
                </div>
                
                <button className="w-full py-2 border border-border-subtle rounded text-sm font-medium text-primary hover:bg-surface transition-colors">
                  Quick Edit
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-text-muted">Showing 1-{mentors.length} of {mentors.length} mentors</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface"><ChevronLeft size={14} /></button>
              <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded font-medium text-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center border border-transparent text-primary hover:bg-surface rounded font-medium text-sm">2</button>
              <button className="w-8 h-8 flex items-center justify-center border border-transparent text-primary hover:bg-surface rounded font-medium text-sm">3</button>
              <span className="text-text-muted mx-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center border border-transparent text-primary hover:bg-surface rounded font-medium text-sm">11</button>
              <button className="w-8 h-8 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface"><ChevronRight size={14} /></button>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
