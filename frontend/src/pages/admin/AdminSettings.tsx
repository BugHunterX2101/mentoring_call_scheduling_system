import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Settings, Bell, Shield, Database, Save } from 'lucide-react';

export function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoMatch: true,
    matchingSensitivity: 'medium',
    emailNotifications: true,
    weeklyReport: true,
    timezone: 'UTC'
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully.");
    }, 800);
  };

  return (
    <DashboardLayout title="Platform Settings" searchPlaceholder="Search settings...">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-primary">Configuration</h2>
            <p className="text-sm text-text-muted mt-1">Manage global platform behavior and AI matching rules.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Section: AI Matching */}
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Settings size={16} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-primary">AI Matching Engine</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-primary">Auto-Matching</h4>
                  <p className="text-xs text-text-muted mt-1">Automatically assign mentors if compatibility score is &gt; 90%.</p>
                </div>
                <div 
                  onClick={() => setSettings(s => ({ ...s, autoMatch: !s.autoMatch }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.autoMatch ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.autoMatch ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
              
              <div className="border-t border-border-subtle pt-6">
                <h4 className="text-sm font-bold text-primary mb-3">Matching Sensitivity</h4>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sensitivity" 
                        checked={settings.matchingSensitivity === level}
                        onChange={() => setSettings(s => ({ ...s, matchingSensitivity: level }))}
                        className="accent-primary"
                      />
                      <span className="text-sm text-text-muted capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notifications */}
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <Bell size={16} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-primary">System Notifications</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-primary">Email Alerts</h4>
                  <p className="text-xs text-text-muted mt-1">Send email to admins when new requirements are submitted.</p>
                </div>
                <div 
                  onClick={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.emailNotifications ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                <div>
                  <h4 className="text-sm font-bold text-primary">Weekly Analytics Report</h4>
                  <p className="text-xs text-text-muted mt-1">Receive a weekly breakdown of platform usage.</p>
                </div>
                <div 
                  onClick={() => setSettings(s => ({ ...s, weeklyReport: !s.weeklyReport }))}
                  className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.weeklyReport ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.weeklyReport ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: System & Data */}
          <div className="bg-white border border-border-subtle rounded-lg p-6 shadow-sm mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Database size={16} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-primary">System Data</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">Default Timezone</label>
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                  className="w-full max-w-xs px-3 py-2 bg-surface border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-primary"
                >
                  <option value="UTC">UTC (Default)</option>
                  <option value="America/New_York">EST (America/New York)</option>
                  <option value="America/Los_Angeles">PST (America/Los Angeles)</option>
                  <option value="Europe/London">GMT (Europe/London)</option>
                </select>
              </div>
              
              <div className="border-t border-border-subtle pt-6 flex gap-4">
                <button 
                  onClick={() => alert("Database backup initiated.")}
                  className="px-4 py-2 border border-border-subtle rounded text-sm font-bold text-primary hover:bg-surface-container-low transition-colors"
                >
                  Backup Database
                </button>
                <button 
                  onClick={() => alert("Cache cleared successfully.")}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Clear System Cache
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
