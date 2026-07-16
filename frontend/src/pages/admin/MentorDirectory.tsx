import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export function MentorDirectory() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Mentors');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    apiClient.fetch('/mentors')
      .then(data => setMentors(data.mentors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setMentors(mentors.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m));
    try {
      await apiClient.fetch(`/mentors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus })
      });
    } catch (e) {
      console.error(e);
      setMentors(mentors.map(m => m.id === id ? { ...m, is_active: currentStatus } : m));
    }
  };

  const handleSaveEdit = async (id: string) => {
    const tagsArr = editTags.split(',').map(t => t.trim()).filter(Boolean);
    
    setMentors(mentors.map(m => m.id === id ? { ...m, description: editDesc, tags: tagsArr } : m));
    try {
      await apiClient.fetch(`/mentors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ description: editDesc, tags: tagsArr })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setQuickEditId(null);
    }
  };

  const filteredMentors = mentors.filter(m => {
    if (filter === 'Active Only') return m.is_active;
    if (filter === 'FAANG') return m.tags?.includes('FAANG');
    if (filter === 'Senior Tech') return m.tags?.includes('Engineering Leadership');
    return true;
  });

  const featuredMentor = filteredMentors.length > 0 ? filteredMentors[0] : null;
  const allOtherMentors = filteredMentors.length > 1 ? filteredMentors.slice(1) : [];
  
  // Pagination logic for otherMentors
  const totalPages = Math.ceil(allOtherMentors.length / itemsPerPage);
  const otherMentors = allOtherMentors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout title="Mentor Directory" searchPlaceholder="Search mentors, tags, skills...">
      {/* Quick Filters */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Quick Filters:</span>
          <div className="flex gap-2">
            {['All Mentors', 'Active Only', 'FAANG', 'Senior Tech'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-transparent border border-border-subtle text-primary hover:bg-surface-container-low'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{filteredMentors.length} Mentors Total</span>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle text-primary text-xs font-bold rounded shadow-sm hover:bg-surface-container-low"
          >
            <SlidersHorizontal size={14} />
            Advanced Filters
          </button>
        </div>
      </div>
      
      {showAdvancedFilters && (
         <div className="bg-white border border-border-subtle rounded-lg p-4 mb-6 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-4 text-sm text-text-muted">
           No advanced filters configured for this view yet.
           <button onClick={() => setShowAdvancedFilters(false)} className="ml-auto text-primary font-bold">Close</button>
         </div>
      )}

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
                          {featuredMentor.is_active ? <TagPill label="ACTIVE" color="green" /> : <TagPill label="INACTIVE" color="gray" />}
                        </h3>
                        <p className="text-sm text-text-muted mt-1">{featuredMentor.description || 'Senior Engineer'}</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div 
                      onClick={() => handleToggle(featuredMentor.id, featuredMentor.is_active)}
                      className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${featuredMentor.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${featuredMentor.is_active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">System Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {(featuredMentor.tags || ['General']).map((t: string) => (
                        <TagPill key={t} label={t} color="gray" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-surface border-l-4 border-blue-500 rounded-r p-4 mt-4 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Profile Rationale</span>
                  </div>
                  <p className="text-sm text-primary">
                    {featuredMentor.ai_rationale || "General mentor profile. Good technical fit for various standard requests."}
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
                 <div className="text-5xl font-bold mb-2">{featuredMentor?.network_health || 'N/A'}%</div>
                 <p className="text-sm text-text-muted">Based on overlapping demand metrics.</p>
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
                        <p className="text-xs text-text-muted mt-0.5 truncate max-w-[120px]">{m.description || 'Mentor'}</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div 
                      onClick={() => handleToggle(m.id, m.is_active)}
                      className={`w-8 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${m.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${m.is_active ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(m.tags || ['General']).slice(0,2).map((t: string) => <TagPill key={t} label={t} color="gray" />)}
                    {m.tags && m.tags.length > 2 && <span className="text-xs text-text-muted">+{m.tags.length - 2}</span>}
                  </div>
                  
                  {quickEditId === m.id ? (
                    <div className="mb-4">
                       <input 
                         type="text" 
                         value={editDesc} 
                         onChange={e => setEditDesc(e.target.value)} 
                         className="w-full text-xs p-1 mb-2 border rounded" 
                         placeholder="Description"
                       />
                       <input 
                         type="text" 
                         value={editTags} 
                         onChange={e => setEditTags(e.target.value)} 
                         className="w-full text-xs p-1 border rounded" 
                         placeholder="Tags (comma separated)"
                       />
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted italic mb-6 line-clamp-2">
                      {m.description ? `"${m.description}"` : "No description provided."}
                    </p>
                  )}
                </div>
                
                {quickEditId === m.id ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveEdit(m.id)}
                      className="flex-1 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                    >Save</button>
                    <button 
                      onClick={() => setQuickEditId(null)}
                      className="flex-1 py-2 border border-border-subtle rounded text-sm font-medium text-text-muted hover:bg-surface transition-colors"
                    >Cancel</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setQuickEditId(m.id);
                      setEditDesc(m.description || '');
                      setEditTags((m.tags || []).join(', '));
                    }}
                    className="w-full py-2 border border-border-subtle rounded text-sm font-medium text-primary hover:bg-surface transition-colors"
                  >
                    Quick Edit
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-text-muted">
              Showing {Math.min(filteredMentors.length, featuredMentor ? 1 + (currentPage - 1) * itemsPerPage : 0)} - {Math.min(filteredMentors.length, featuredMentor ? 1 + currentPage * itemsPerPage : 0)} of {filteredMentors.length} mentors
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface disabled:opacity-50"
              ><ChevronLeft size={14} /></button>
              
              <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded font-medium text-sm">{currentPage}</button>
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-transparent text-primary hover:bg-surface rounded font-medium text-sm"
                >{currentPage + 1}</button>
              )}
              
              <button 
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 flex items-center justify-center border border-border-subtle rounded text-text-muted hover:bg-surface disabled:opacity-50"
              ><ChevronRight size={14} /></button>
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
