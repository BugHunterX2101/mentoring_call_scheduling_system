import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TagPill } from '../../components/ui/TagPill';

export function MatchingWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    apiClient.fetch(`/requirements/${id}`)
      .then(data => setRequirement(data))
      .catch(console.error)
      .finally(() => setLoadingReq(false));
  }, [id]);

  const runMatch = async () => {
    setLoadingMatch(true);
    try {
      const result = await apiClient.fetch(`/recommendations/${id}`, { method: 'POST' });
      setMatches(result.matches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMatch(false);
    }
  };

  const confirmBooking = async (mentorId: string) => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const start = new Date(today);
    start.setHours(10, 0, 0, 0);
    const end = new Date(today);
    end.setHours(11, 0, 0, 0);

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
      alert('Booking confirmed!');
      navigate('/admin/requirements');
    } catch (e) {
      console.error(e);
      alert('Error booking');
    }
  };

  if (loadingReq) return <DashboardLayout><p>Loading...</p></DashboardLayout>;
  if (!requirement) return <DashboardLayout><p>Requirement not found</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-body-sm text-text-muted hover:text-primary mb-2">← Back to Queue</button>
        <h2 className="text-headline-md text-primary">Matching Workspace</h2>
      </div>

      <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-headline-sm text-primary mb-1">Request from {requirement.user_name}</h3>
            <div className="flex gap-2">
              <span className="text-label-caps text-text-muted bg-surface py-1 px-2 rounded border border-border-subtle">
                {requirement.call_type.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={requirement.status} />
            </div>
          </div>
          <button 
            onClick={runMatch} 
            disabled={loadingMatch}
            className="bg-primary text-on-primary px-4 py-2 rounded font-medium hover:bg-opacity-90 disabled:opacity-50"
          >
            {loadingMatch ? 'Running AI Match...' : 'Find Matches'}
          </button>
        </div>
        <p className="text-body-md text-text-muted mb-4">{requirement.description}</p>
        <div className="flex gap-2">
          {(requirement.user_tags || []).map((t: string) => <TagPill key={t} tag={t} />)}
        </div>
      </div>

      {matches.length > 0 && (
        <div>
          <h3 className="text-headline-sm text-primary mb-4">AI Recommended Mentors</h3>
          <div className="space-y-4">
            {matches.map(m => (
              <div key={m.id} className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{m.name}</h4>
                    <span className="bg-matched-blue/10 text-matched-blue px-2 py-1 rounded text-label-caps font-bold">
                      {m.fit_score}% FIT
                    </span>
                    <span className="text-body-sm text-text-muted">★ {m.rating_avg} ({m.rating_count} reviews)</span>
                  </div>
                  <div className="bg-matched-blue/5 border border-matched-blue/20 p-3 rounded mb-3">
                    <p className="text-body-sm text-text-muted"><strong>AI Rationale:</strong> {m.rationale}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(m.tags || []).map((t: string) => <TagPill key={t} tag={t} />)}
                  </div>
                  <p className="text-body-sm text-text-muted line-clamp-2">{m.description}</p>
                </div>
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  <button 
                    onClick={() => confirmBooking(m.id)}
                    className="w-full bg-tertiary text-on-tertiary py-2 rounded font-medium hover:bg-opacity-90"
                  >
                    Confirm Booking
                  </button>
                  <p className="text-label-caps text-center text-text-muted mt-2">Will book for tomorrow 10am</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
