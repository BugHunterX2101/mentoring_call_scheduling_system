import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { apiClient } from '../../lib/api/client';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/requirements', { replace: true });
      else if (user.role === 'mentor') navigate('/mentor/dashboard', { replace: true });
      else navigate('/user/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiClient.fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="bg-surface-container-lowest border border-border-subtle rounded-lg shadow-sm p-8 max-w-md w-full">
        <h1 className="text-headline-lg text-primary text-center mb-2">Mentorque</h1>
        <p className="text-body-md text-text-muted text-center mb-8">Sign in to your account</p>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded mb-4 text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm text-text-muted mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border-subtle rounded p-2 focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-body-sm text-text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border-subtle rounded p-2 focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-2 rounded-md font-medium mt-4 hover:bg-opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-4 border-t border-border-subtle text-body-sm text-text-muted">
          <div className="text-center mb-4">
            <p>Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up here</Link></p>
          </div>
          <p><strong>Demo Accounts:</strong></p>
          <ul className="list-disc pl-4 mt-2">
            <li>Admin: admin@mentorque.com</li>
            <li>Mentor: mentor1@example.com</li>
            <li>User: user1@example.com</li>
            <li>Password: password123 (adminpassword for admin)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
