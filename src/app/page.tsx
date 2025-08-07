'use client';

import { useState } from 'react';
import { HealthScoreRing } from '@/components/ui/health-score-ring';
import { useMedications } from '@/contexts/MedicationContext';
import Link from 'next/link';

export default function HomePage() {
  const { medications, loading } = useMedications();
  const [userName] = useState('Sarah'); 
  const [streakCount] = useState(7);
  const [medicationTaken, setMedicationTaken] = useState<{[key: string]: boolean}>({});

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-2xl font-medium" style={{ color: '#4F4F4F' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Header Section */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-5"
        style={{
          height: '80px',
          background: 'linear-gradient(to right, #FBD24D, #F59E0B)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Left Side - Streak */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-3xl font-bold" style={{ color: '#4F4F4F' }}>{streakCount}</div>
            <div className="text-sm" style={{ color: '#8F8F8F' }}>Day Streak</div>
          </div>
        </div>

        {/* Center - Greeting */}
        <div className="text-2xl font-semibold" style={{ color: '#4F4F4F' }}>
          {greeting()}, {userName}! 👋
        </div>

        {/* Right Side - Profile Photo */}
        <div 
          className="rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#4F4F4F',
            border: '3px solid #FBD24D',
          }}
        >
          {userName.charAt(0)}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '96px', paddingBottom: '96px', padding: '96px 16px' }}>
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Today's Health Card */}
          <div 
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, #FBD24D 0%, #F59E0B 100%)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#4F4F4F' }}>Today&apos;s Health</h2>
                <p className="text-base" style={{ color: '#8F8F8F' }}>
                  {medications.filter(m => m.isActive).length} medications active
                </p>
              </div>
              <div className="flex items-center justify-center">
                <HealthScoreRing score={89} size="lg" />
              </div>
            </div>

            {/* Three Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#4F4F4F' }}>
                  {medications.filter(m => m.isActive).length}
                </div>
                <div className="text-base" style={{ color: '#8F8F8F' }}>Medications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#4F4F4F' }}>
                  {Object.values(medicationTaken).filter(taken => taken).length}
                </div>
                <div className="text-base" style={{ color: '#8F8F8F' }}>Taken Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#4F4F4F' }}>{streakCount}</div>
                <div className="text-base" style={{ color: '#8F8F8F' }}>Day Streak</div>
              </div>
            </div>
          </div>

          {/* Badge Preview */}
          <div 
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ 
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E5E5E5'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span className="text-base font-medium" style={{ color: '#4F4F4F' }}>1 badge to unlock today!</span>
            </div>
            <Link href="/badges" className="text-base hover:text-primary transition-colors" style={{ color: '#8F8F8F' }}>
              View All &gt;
            </Link>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/ai-insights">
              <div 
                className="rounded-2xl p-6 text-center bg-white hover:shadow-lg transition-shadow duration-200"
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E5E5'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#FBD24D' }}
                >
                  <span className="text-3xl">🧠</span>
                </div>
                <p className="text-base font-medium" style={{ color: '#4F4F4F' }}>AI Insights</p>
              </div>
            </Link>
            <Link href="/scan">
              <div 
                className="rounded-2xl p-6 text-center bg-white hover:shadow-lg transition-shadow duration-200"
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E5E5'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#FBD24D' }}
                >
                  <span className="text-3xl">💊</span>
                </div>
                <p className="text-base font-medium" style={{ color: '#4F4F4F' }}>Add Medication</p>
              </div>
            </Link>

            <Link href="/reminders">
              <div 
                className="rounded-2xl p-6 text-center bg-white hover:shadow-lg transition-shadow duration-200"
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E5E5'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#FBD24D' }}
                >
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="text-base font-medium" style={{ color: '#4F4F4F' }}>Set Reminder</p>
              </div>
            </Link>

            <Link href="/health-log">
              <div 
                className="rounded-2xl p-6 text-center bg-white hover:shadow-lg transition-shadow duration-200"
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E5E5'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#FBD24D' }}
                >
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-base font-medium" style={{ color: '#4F4F4F' }}>Health Log</p>
              </div>
            </Link>

            <Link href="/scan">
              <div 
                className="rounded-2xl p-6 text-center bg-white hover:shadow-lg transition-shadow duration-200"
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E5E5'
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#FBD24D' }}
                >
                  <span className="text-3xl">📷</span>
                </div>
                <p className="text-base font-medium" style={{ color: '#4F4F4F' }}>Scan Medicine</p>
              </div>
            </Link>
          </div>

          {/* Today's Medications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium" style={{ color: '#4F4F4F' }}>📋 Today&apos;s Medications</h3>
                          <Link href="/medications" className="text-base hover:text-primary transition-colors" style={{ color: '#8F8F8F' }}>
              View All &gt;
            </Link>
            </div>

            <div className="space-y-3">
              {medications.filter(m => m.isActive).length === 0 ? (
                <div 
                  className="rounded-2xl p-6 bg-white text-center"
                  style={{ 
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div className="text-4xl mb-2">💊</div>
                  <div className="text-xl font-medium mb-2" style={{ color: '#4F4F4F' }}>No medications yet</div>
                  <div className="text-base mb-4" style={{ color: '#8F8F8F' }}>Add your first medication to start tracking</div>
                  <Link href="/scan">
                    <button 
                      className="px-6 py-2 rounded-full text-sm font-medium hover:bg-yellow-500 transition-colors"
                      style={{ backgroundColor: '#FBD24D', color: '#4F4F4F' }}
                    >
                      Add Medication
                    </button>
                  </Link>
                </div>
              ) : (
                medications.filter(m => m.isActive).slice(0, 3).map((medication) => (
                  <div 
                    key={medication.id}
                    className="rounded-2xl p-4 bg-white flex items-center gap-4"
                    style={{ 
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      borderLeft: '4px solid #FBD24D'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      className="w-6 h-6"
                      style={{ accentColor: '#FBD24D' }}
                      checked={medicationTaken[medication.name] || false}
                      onChange={(e) => {
                        setMedicationTaken(prev => ({
                          ...prev,
                          [medication.name]: e.target.checked
                        }));
                        if (e.target.checked) {
                          console.log(`${medication.name} taken at:`, new Date().toLocaleTimeString());
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-xl font-medium" style={{ color: '#4F4F4F' }}>{medication.name}</div>
                      <div className="text-base" style={{ color: '#8F8F8F' }}>
                        {medication.dosage} • {medication.frequency}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/reminders">
                        <button 
                          className="px-3 py-1 rounded-full text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                          style={{ backgroundColor: '#FFA500' }}
                        >
                          🔔 Reminder
                        </button>
                      </Link>
                      <Link href="/medications">
                        <button 
                          className="px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-500 transition-colors"
                          style={{ backgroundColor: '#FBD24D', color: '#4F4F4F' }}
                        >
                          ⚡ Quick Add
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Challenge */}
          <div 
            className="rounded-2xl p-4 bg-white"
            style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <span className="text-base font-medium" style={{ color: '#4F4F4F' }}>
                Today&apos;s Goal: Take all medications on time
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E5E5E5' }}>
                <div 
                  className="h-2 rounded-full" 
                  style={{ width: '80%', backgroundColor: '#FBD24D' }}
                ></div>
              </div>
              <span className="text-base font-medium" style={{ color: '#4F4F4F' }}>80%</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href="/scan">
        <button 
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-pulse hover:scale-110 transition-transform"
          style={{ 
            backgroundColor: '#FBD24D',
            boxShadow: '0 4px 12px rgba(251, 210, 77, 0.4)',
            zIndex: 40
          }}
        >
          +
        </button>
      </Link>

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white flex items-center justify-around py-4"
        style={{ 
          height: '80px',
          borderTop: '1px solid #E5E5E5',
          zIndex: 50
        }}
      >
        <Link href="/" className="flex flex-col items-center hover:scale-105 transition-transform">
          <div 
            className="w-12 h-8 rounded-lg flex items-center justify-center mb-1"
            style={{ backgroundColor: '#FBD24D' }}
          >
            <span className="text-xl" style={{ color: '#FBD24D' }}>🏠</span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#FBD24D' }}>HOME</span>
        </Link>

        <Link href="/scan" className="flex flex-col items-center hover:scale-105 transition-transform">
          <span className="text-2xl mb-1" style={{ color: '#8F8F8F' }}>📷</span>
          <span className="text-xs" style={{ color: '#8F8F8F' }}>Scan</span>
        </Link>

        <Link href="/medications" className="flex flex-col items-center hover:scale-105 transition-transform">
          <span className="text-2xl mb-1" style={{ color: '#8F8F8F' }}>💊</span>
          <span className="text-xs" style={{ color: '#8F8F8F' }}>Medicine</span>
        </Link>

        <Link href="/account" className="flex flex-col items-center hover:scale-105 transition-transform">
          <span className="text-2xl mb-1" style={{ color: '#8F8F8F' }}>👤</span>
          <span className="text-xs" style={{ color: '#8F8F8F' }}>Profile</span>
        </Link>
      </nav>
    </div>
  );
}