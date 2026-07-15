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
      
      {/* AI Banner */}
      <div className="bg-primary text-white rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI-Powered Matching Available</h3>
            <p className="text-xs text-white/80">Batch process pending requirements for optimal calendar placement.</p>
          </div>
        </div>
        <button 
          onClick={handleBatchMatch}
          disabled={isMatching || selectedIds.size === 0}
          className="bg-white text-primary px-4 py-2 rounded text-sm font-bold shadow hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMatching ? 'Processing...' : 'Run Batch Match'}
        </button>
      </div>
      
      <div className="bg-white border border-border-subtle rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-4 p-4 border-b border-border-subtle bg-surface text-xs font-bold text-text-muted uppercase tracking-wider items-center">
           <div className="pl-2">
             <input 
               type="checkbox" 
               checked={requirements.length > 0 && selectedIds.size === requirements.length}
               onChange={toggleSelectAll}
               className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer" 
             />
           </div>
           <div>Mentee</div>
           <div>Type</div>
           <div>Submitted</div>
           <div>Status</div>
           <div className="text-right pr-2">Action</div>
        </div>

        {/* List Items */}
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading requirements...</div>
        ) : requirements.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No pending requirements found.</div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {requirements.map(req => (
              <div key={req.id} className={`grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-4 p-4 items-center transition-colors ${selectedIds.has(req.id) ? 'bg-blue-50/50' : 'hover:bg-surface-container-low'}`}>
                
                <div className="pl-2">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(req.id)}
                    onChange={() => toggleSelect(req.id)}
                    className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer" 
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <img src={`https://ui-avatars.com/api/?name=${req.user_name}&background=random`} alt={req.user_name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-bold text-primary">{req.user_name}</h4>
                    <p className="text-xs text-text-muted">{req.user_name.toLowerCase().replace(' ', '.')}@example.com</p>
                  </div>
                </div>
                
                <div>
                  <TagPill label={req.call_type.replace(/_/g, ' ').toUpperCase()} color="blue" />
                </div>
                
                <div className="text-sm text-text-muted">
                  {new Date(req.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                <div>
                  <TagPill label={req.status.toUpperCase()} color="amber" />
                </div>
                
                <div className="text-right pr-2">
                  <Link 
                    to={`/admin/requirements/${req.id}/match`}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Find Match
                    <ArrowRight size={16} />
                  </Link>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
