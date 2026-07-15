import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { TagPill } from '../../components/ui/TagPill';

export function MentorDirectory() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.fetch('/mentors')
      .then(data => setMentors(data.mentors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-headline-md text-primary mb-6">Mentor Directory</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map(m => (
            <div key={m.id} className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-headline-sm text-primary">{m.name}</h3>
                <span className="text-body-sm text-text-muted">★ {m.rating_avg} ({m.rating_count} reviews)</span>
              </div>
              <p className="text-body-sm text-text-muted mb-4">{m.email}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(m.tags || []).map((t: string) => <TagPill key={t} tag={t} />)}
              </div>
              <p className="text-body-sm text-text-muted line-clamp-3">{m.description}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
