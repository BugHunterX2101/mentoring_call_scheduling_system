import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../lib/auth/AuthContext';
import { RoleGuard } from './RoleGuard';

import { Login } from '../pages/auth/Login';

import { MenteeDashboard } from '../pages/user/MenteeDashboard';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { RequirementsQueue } from '../pages/admin/RequirementsQueue';
import { MatchingWorkspace } from '../pages/admin/MatchingWorkspace';
import { MentorDirectory } from '../pages/admin/MentorDirectory';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
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
            path="/admin/mentors" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <MentorDirectory />
              </RoleGuard>
            } 
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
