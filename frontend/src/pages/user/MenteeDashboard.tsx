import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TagPill } from '../../components/ui/TagPill';

export function MenteeDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [callType, setCallType] = useState('resume_revamp');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [bookingsData, reqsData] = await Promise.all([
        apiClient.fetch('/bookings/me'),
        apiClient.fetch('/requirements/me')
      ]);
      setBookings(bookingsData.bookings || []);
      setRequirements(reqsData.requirements || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await apiClient.fetch('/requirements', {
        method: 'POST',
        body: JSON.stringify({ callType, description, tags: tagArray })
      });
      alert('Requirement submitted!');
      setDescription('');
      setTags('');
      fetchData(); // Auto-refresh UI
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-headline-md mb-6 text-primary">My Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg self-start">
          <h3 className="text-headline-sm mb-4">Request a Call</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-sm text-text-muted mb-1">Call Type</label>
              <select 
                value={callType} onChange={e => setCallType(e.target.value)}
                className="w-full border border-border-subtle rounded p-2 focus:border-primary"
              >
                <option value="resume_revamp">Resume Revamp</option>
                <option value="job_market_guidance">Job Market Guidance</option>
                <option value="mock_interview">Mock Interview</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-text-muted mb-1">Description</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                className="w-full border border-border-subtle rounded p-2 h-24 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-body-sm text-text-muted mb-1">Tags (comma separated)</label>
              <input 
                value={tags} onChange={e => setTags(e.target.value)} placeholder="Tech, Big company"
                className="w-full border border-border-subtle rounded p-2 focus:border-primary"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary py-2 rounded-md font-medium hover:bg-opacity-90">
              Submit Request
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {/* Confirmed Bookings */}
          <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg">
            <h3 className="text-headline-sm mb-4">My Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-text-muted text-body-md">No confirmed bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map(req => (
                  <div key={req.id} className="border border-border-subtle p-4 rounded bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-primary">Call with {req.mentor_name}</h4>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-body-sm text-text-muted">
                      {new Date(req.start_time).toLocaleString()} - {new Date(req.end_time).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Requirements */}
          <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg">
            <h3 className="text-headline-sm mb-4">My Requests</h3>
            {requirements.length === 0 ? (
              <p className="text-text-muted text-body-md">No active requests.</p>
            ) : (
              <div className="space-y-4">
                {requirements.map(req => (
                  <div key={req.id} className="border border-border-subtle p-4 rounded bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-label-caps text-text-muted bg-surface py-1 px-2 rounded border border-border-subtle">
                        {req.call_type.replace(/_/g, ' ')}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-body-md mt-2 line-clamp-2">{req.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
