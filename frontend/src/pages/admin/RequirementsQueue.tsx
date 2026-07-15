import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TagPill } from '../../components/ui/TagPill';
import { Link } from 'react-router-dom';

export function RequirementsQueue() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.fetch('/requirements?status=pending')
      .then(data => setRequirements(data.requirements))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-headline-md text-primary">Pending Requirements</h2>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : requirements.length === 0 ? (
        <div className="bg-surface-container-lowest border border-border-subtle p-8 rounded-lg text-center">
          <p className="text-text-muted text-body-md">No pending requirements found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requirements.map(req => (
            <div key={req.id} className="bg-surface-container-lowest border border-border-subtle p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-headline-sm text-primary">{req.user_name}</h3>
                  <StatusBadge status={req.status} />
                  <span className={`text-label-caps px-2 py-0.5 rounded ${req.urgency === 'high' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface'}`}>
                    {req.urgency}
                  </span>
                </div>
                <p className="text-body-md text-text-muted mb-3 line-clamp-2">{req.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-label-caps text-text-muted bg-surface py-1 px-2 rounded border border-border-subtle">
                    {req.call_type.replace(/_/g, ' ')}
                  </span>
                  {(req.user_tags || []).map((t: string) => <TagPill key={t} tag={t} />)}
                </div>
              </div>
              <div>
                <Link 
                  to={`/admin/requirements/${req.id}/match`}
                  className="inline-block bg-primary text-on-primary px-4 py-2 rounded font-medium hover:bg-opacity-90"
                >
                  Find Match
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
