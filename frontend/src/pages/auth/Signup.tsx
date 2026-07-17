import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { apiClient } from '../../lib/api/client';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'mentor') navigate('/mentor/dashboard', { replace: true });
      else navigate('/user/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    try {
      const data = await apiClient.fetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password: password.trim(),
          role 
        }),
      });
      await login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="bg-surface-container-lowest border border-border-subtle rounded-lg shadow-sm p-8 max-w-md w-full">
        <h1 className="text-headline-lg text-primary text-center mb-2">Mentorque</h1>
        <p className="text-body-md text-text-muted text-center mb-8">Create your account</p>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded mb-4 text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm text-text-muted mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border-subtle rounded p-2 focus:outline-none focus:border-primary"
              required
            />
          </div>
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
          <div>
            <label className="block text-body-sm text-text-muted mb-1">I want to...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-border-subtle rounded p-2 focus:outline-none focus:border-primary"
            >
              <option value="user">Find a Mentor</option>
              <option value="mentor">Become a Mentor</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-2 rounded-md font-medium mt-4 hover:bg-opacity-90 transition-opacity"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-border-subtle text-center text-body-sm text-text-muted">
          <p>Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
}
