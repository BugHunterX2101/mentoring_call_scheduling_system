import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../lib/auth/AuthContext';
import { RoleGuard } from './RoleGuard';

import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';


import { MenteeDashboard } from '../pages/user/MenteeDashboard';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { RequirementsQueue } from '../pages/admin/RequirementsQueue';
import { MatchingWorkspace } from '../pages/admin/MatchingWorkspace';
import { MentorDirectory } from '../pages/admin/MentorDirectory';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminBookings } from '../pages/admin/AdminBookings';
import { AdminSettings } from '../pages/admin/AdminSettings';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route 
            path="/user/dashboard" 
            element={
              <RoleGuard allowedRoles={['user']}>
                <MenteeDashboard />
              </RoleGuard>
            } 
          />
          
          <Route 
            path="/mentor/dashboard" 
            element={
              <RoleGuard allowedRoles={['mentor']}>
                <MentorDashboard />
              </RoleGuard>
            } 
          />
          
          <Route 
            path="/admin/requirements" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <RequirementsQueue />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/requirements/:id/match" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <MatchingWorkspace />
              </RoleGuard>
            } 
          />

          <Route 
            path="/admin/dashboard" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleGuard>
            } 
          />

          <Route 
            path="/admin/mentors" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <MentorDirectory />
              </RoleGuard>
            } 
          />

          <Route 
            path="/admin/bookings" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminBookings />
              </RoleGuard>
            } 
          />

          <Route 
            path="/admin/settings" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AdminSettings />
              </RoleGuard>
            } 
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Catch-all: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
