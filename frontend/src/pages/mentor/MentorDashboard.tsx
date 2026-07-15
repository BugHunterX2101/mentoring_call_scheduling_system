import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function MentorDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    apiClient.fetch('/bookings/me').then(data => setBookings(data.bookings)).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <h2 className="text-headline-md mb-6 text-primary">Mentor Dashboard</h2>
      
      <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-lg">
        <h3 className="text-headline-sm mb-4">Confirmed Calls</h3>
        {bookings.length === 0 ? (
          <p className="text-text-muted text-body-md">No confirmed calls yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map(book => (
              <div key={book.id} className="border border-border-subtle p-4 rounded bg-background flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-primary">Call with {book.user_name}</h4>
                  <p className="text-body-sm text-text-muted">
                    {new Date(book.start_time).toLocaleString()} - {new Date(book.end_time).toLocaleTimeString()}
                  </p>
                </div>
                <StatusBadge status={book.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
