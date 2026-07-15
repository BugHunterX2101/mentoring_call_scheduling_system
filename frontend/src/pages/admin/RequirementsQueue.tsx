import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export function RequirementsQueue() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMatching, setIsMatching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);
  const itemsPerPage = 3;

  const fetchReqs = () => {
    setLoading(true);
    apiClient.fetch('/requirements?status=pending')
      .then(data => setRequirements(data.requirements))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReqs();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === requirements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requirements.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchMatch = async () => {
    if (selectedIds.size === 0) return alert('Select at least one requirement');
    setIsMatching(true);
    try {
      await apiClient.fetch('/requirements/batch-match', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      setSelectedIds(new Set());
      fetchReqs();
    } catch (e) {
      console.error(e);
      alert('Batch match failed');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <DashboardLayout title="Pending Requirements" searchPlaceholder="Search mentees, tags, dates...">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
         <div>
            <h2 className="text-xl font-bold text-primary">Pending Requirements</h2>
            <p className="text-sm text-text-muted mt-1">Review and match incoming mentee requests with suitable mentors.</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-surface-container-low text-primary border border-border-subtle uppercase tracking-widest">
               Total Pending 12
            </span>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border-subtle rounded text-sm font-bold text-primary hover:bg-surface-container-low transition-colors shadow-sm bg-white"
            >
               Filter
               <Sparkles size={14} className="text-text-muted" />
            </button>
         </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-border-subtle rounded-lg p-4 mb-6 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-bold text-primary">Active Filters:</span>
          <span className="text-xs bg-surface-container-low text-primary px-2 py-1 rounded">Status: Pending</span>
          <span className="text-xs bg-surface-container-low text-primary px-2 py-1 rounded">Sort: Newest First</span>
          <button onClick={() => setShowFilters(false)} className="text-xs text-text-muted hover:text-primary ml-auto">Clear Filters</button>
        </div>
      )}

      {/* AI Banner */}
      <div className="bg-primary text-white rounded-lg p-5 mb-6 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/10 p-2.5 rounded shadow-sm border border-white/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">AI-Powered Matching Available</h3>
            <p className="text-xs text-white/80 mt-0.5">Batch process pending requirements for optimal calendar placement.</p>
          </div>
        </div>
        <button 
          onClick={handleBatchMatch}
          disabled={isMatching || selectedIds.size === 0}
          className="bg-white text-primary px-5 py-2.5 rounded text-sm font-bold shadow hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
        >
          {isMatching ? 'Processing...' : 'Run Batch Match'}
        </button>
      </div>
      
      <div className="bg-transparent">
        {/* List Items */}
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading requirements...</div>
        ) : requirements.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No pending requirements found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {requirements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(req => (
              <React.Fragment key={req.id}>
                <div className={`bg-white border ${selectedIds.has(req.id) ? 'border-primary shadow-sm' : 'border-border-subtle'} rounded-lg p-5 flex items-center justify-between gap-6 transition-all`}>
                
                <div className="flex items-center gap-4 min-w-[250px]">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(req.id)}
                    onChange={() => toggleSelect(req.id)}
                    className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer" 
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-high rounded text-primary flex items-center justify-center font-bold text-sm border border-border-subtle">
                       {req.user_name.split(' ').map((n:string) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{req.user_name}</h4>
                      <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-0.5">Software Engineer</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-surface-container-low text-primary border border-border-subtle uppercase tracking-widest">
                       Resume Revamp
                     </span>
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-surface-container-low text-primary border border-border-subtle uppercase tracking-widest">
                       Tech
                     </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1 italic">"Seeking a senior mentor to review my resume for a career pivot into..."</p>
                </div>
                
                <div className="min-w-[150px]">
                  <div className="text-xs mb-1">
                    <span className="text-text-muted mr-2">Urgency:</span>
                    <span className="font-bold text-primary">Medium</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-text-muted mr-2">Language:</span>
                    <span className="font-bold text-primary">English, Portuguese</span>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2 min-w-[120px]">
                  <Link 
                    to={`/admin/requirements/${req.id}/match`}
                    className="w-full text-center bg-primary text-white px-4 py-2 rounded text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    Find Match
                  </Link>
                  <button 
                    onClick={(e) => {
                       e.preventDefault();
                       setExpandedReqId(expandedReqId === req.id ? null : req.id);
                    }}
                    className="text-[10px] font-bold text-text-muted hover:text-primary underline bg-transparent border-none p-0 cursor-pointer"
                  >
                     {expandedReqId === req.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
              
              {expandedReqId === req.id && (
                <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-5 mt-[-8px] mb-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                   <p className="font-bold text-primary mb-2 text-sm">Full Request Description:</p>
                   <p className="text-text-muted text-sm leading-relaxed">"{req.description}"</p>
                   {req.user_tags && req.user_tags.length > 0 && (
                     <div className="mt-4 flex items-center gap-2">
                       <span className="text-xs font-bold text-primary">Required Skills:</span>
                       <div className="flex gap-2">
                         {req.user_tags.map((t: string) => <TagPill key={t} label={t} color="gray" />)}
                       </div>
                     </div>
                   )}
                </div>
              )}
            </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-6">
         <span className="text-xs text-text-muted font-medium">
           Showing {Math.min(requirements.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(requirements.length, currentPage * itemsPerPage)} of {requirements.length} requests
         </span>
         <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface transition-colors disabled:opacity-50"
            >&lt;</button>
            <button className="w-8 h-8 rounded bg-primary text-white font-bold flex items-center justify-center shadow-sm">{currentPage}</button>
            {currentPage * itemsPerPage < requirements.length && (
               <button 
                 onClick={() => setCurrentPage(p => p + 1)}
                 className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface transition-colors font-medium"
               >
                 {currentPage + 1}
               </button>
            )}
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage * itemsPerPage >= requirements.length}
              className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface transition-colors disabled:opacity-50"
            >&gt;</button>
         </div>
      </div>
    </DashboardLayout>
  );
}
