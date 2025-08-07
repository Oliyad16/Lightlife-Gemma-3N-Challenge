'use client';

import { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer, Weight, Plus, Calendar, BarChart3, X, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db, type HealthLog, type MedicationLog } from '@/lib/db/database';
import Link from 'next/link';

export default function HealthLogPage() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [healthScore, setHealthScore] = useState(85);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    heartRate: '',
    weight: '',
    temperature: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logs, medLogs] = await Promise.all([
          db.getUserHealthLogs(1, 30), // Last 30 entries
          db.getUserMedicationLogs(1, 30) // Last 30 entries
        ]);
        setHealthLogs(logs);
        setMedicationLogs(medLogs);
      } catch (error) {
        console.error('Failed to load health data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addHealthLog = async () => {
    try {
      const logData = {
        userId: 1,
        date: new Date(selectedDate),
        healthScore: healthScore,
        symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [],
        notes: notes,
        vitalSigns: {
          bloodPressure: vitalSigns.bloodPressure || undefined,
          heartRate: vitalSigns.heartRate ? Number(vitalSigns.heartRate) : undefined,
          weight: vitalSigns.weight ? Number(vitalSigns.weight) : undefined,
          temperature: vitalSigns.temperature ? Number(vitalSigns.temperature) : undefined
        }
      };

      const logId = await db.addHealthLog(logData);
      
      // Add to local state
      const newLog: HealthLog = {
        id: logId,
        ...logData,
        createdAt: new Date()
      };
      
      setHealthLogs([newLog, ...healthLogs]);
      setShowAddForm(false);
      
      // Reset form
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setHealthScore(85);
      setSymptoms('');
      setNotes('');
      setVitalSigns({
        bloodPressure: '',
        heartRate: '',
        weight: '',
        temperature: ''
      });
    } catch (error) {
      console.error('Failed to add health log:', error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  const calculateAverageHealthScore = () => {
    if (healthLogs.length === 0) return 0;
    const total = healthLogs.reduce((sum, log) => sum + log.healthScore, 0);
    return Math.round(total / healthLogs.length);
  };

  const getMedicationAdherence = () => {
    // Calculate adherence based on medication logs
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = medicationLogs.filter(log => log.takenAt >= lastWeek);
    return recentLogs.length > 0 ? Math.round((recentLogs.length / 7) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 to-primary/5 px-4 py-6 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="p-2 hover:bg-white/20 rounded-full">
              <X size={24} className="text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex-1">
              Health Log
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Track your health metrics and progress
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${getHealthScoreColor(calculateAverageHealthScore())}`}>
              {calculateAverageHealthScore()}
            </div>
            <div className="text-sm text-muted-foreground">Avg Health Score</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {getMedicationAdherence()}%
            </div>
            <div className="text-sm text-muted-foreground">Adherence</div>
          </Card>
        </div>

        {/* Add Health Log Button */}
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          size="lg"
          fullWidth
          className="touch-feedback"
        >
          <Plus size={20} className="mr-2" />
          Add Health Entry
        </Button>

        {/* Add Health Log Form */}
        {showAddForm && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">New Health Entry</h3>
            
            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Health Score */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Health Score: {healthScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={vitalSigns.bloodPressure}
                  onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={vitalSigns.heartRate}
                  onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  placeholder="150"
                  value={vitalSigns.weight}
                  onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={vitalSigns.temperature}
                  onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Symptoms (comma separated)
              </label>
              <input
                type="text"
                placeholder="headache, fatigue, nausea"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                placeholder="How are you feeling today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={addHealthLog}
                variant="primary"
                size="md"
                className="flex-1 touch-feedback"
              >
                <CheckCircle size={16} className="mr-2" />
                Save Entry
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                size="md"
                className="touch-feedback"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Health Logs List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Entries ({healthLogs.length})
          </h2>

          {healthLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                No health entries yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your health to see your progress over time
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                className="touch-feedback"
              >
                <Plus size={16} className="mr-2" />
                Add First Entry
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {healthLogs.slice(0, 10).map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {new Date(log.date).toLocaleDateString()}
                        </h3>
                        <Badge 
                          variant={log.healthScore >= 80 ? "success" : log.healthScore >= 60 ? "warning" : "destructive"}
                          size="sm"
                        >
                          {getHealthScoreLabel(log.healthScore)}
                        </Badge>
                      </div>
                      
                      <div className={`text-lg font-bold mb-2 ${getHealthScoreColor(log.healthScore)}`}>
                        Health Score: {log.healthScore}
                      </div>
                      
                      {log.symptoms && log.symptoms.length > 0 && (
                        <div className="text-sm text-muted-foreground mb-2">
                          Symptoms: {log.symptoms.join(', ')}
                        </div>
                      )}
                      
                      {log.notes && (
                        <div className="text-sm text-muted-foreground mb-2">
                          Notes: {log.notes}
                        </div>
                      )}
                      
                      {/* Vital Signs */}
                      {log.vitalSigns && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {log.vitalSigns.bloodPressure && (
                            <div className="flex items-center gap-1">
                              <Activity size={12} />
                              <span>BP: {log.vitalSigns.bloodPressure}</span>
                            </div>
                          )}
                          {log.vitalSigns.heartRate && (
                            <div className="flex items-center gap-1">
                              <Heart size={12} />
                              <span>HR: {log.vitalSigns.heartRate} bpm</span>
                            </div>
                          )}
                          {log.vitalSigns.weight && (
                            <div className="flex items-center gap-1">
                              <Weight size={12} />
                              <span>Weight: {log.vitalSigns.weight} lbs</span>
                            </div>
                          )}
                          {log.vitalSigns.temperature && (
                            <div className="flex items-center gap-1">
                              <Thermometer size={12} />
                              <span>Temp: {log.vitalSigns.temperature}°F</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/medications">
              <Button variant="outline" size="md" fullWidth className="touch-feedback">
                <BarChart3 size={16} className="mr-2" />
                View Meds
              </Button>
            </Link>
            <Link href="/reminders">
              <Button variant="outline" size="md" fullWidth className="touch-feedback">
                <Calendar size={16} className="mr-2" />
                Set Reminders
              </Button>
            </Link>
          </div>
        </Card>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
} 