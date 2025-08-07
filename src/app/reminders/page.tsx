'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Clock, Calendar, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db, type MedicationReminder, type Medication } from '@/lib/db/database';
import Link from 'next/link';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // All days by default

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userReminders, userMeds] = await Promise.all([
          db.getUserReminders(1),
          db.getUserMedications(1)
        ]);
        setReminders(userReminders);
        setMedications(userMeds);
      } catch (error) {
        console.error('Failed to load reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Schedule test notification
        setTimeout(() => {
          new Notification('LifeLight Reminder', {
            body: 'Test notification - your reminders are now active!',
            icon: '/icon-192x192.png'
          });
        }, 2000);
      }
    }
  };

  const addReminder = async () => {
    if (!selectedMedication) return;

    try {
      const reminderData = {
        medicationId: selectedMedication,
        userId: 1,
        time: selectedTime,
        days: selectedDays,
        isActive: true
      };

      const reminderId = await db.addMedicationReminder(reminderData);
      
      // Add to local state
      const newReminder: MedicationReminder = {
        id: reminderId,
        ...reminderData,
        createdAt: new Date()
      };
      
      setReminders([...reminders, newReminder]);
      setShowAddForm(false);
      setSelectedMedication(null);
      setSelectedTime('08:00');
      setSelectedDays([1, 2, 3, 4, 5, 6, 0]);

      // Request notification permission if not already granted
      await requestNotificationPermission();
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  const toggleReminder = async (reminderId: number, isActive: boolean) => {
    try {
      await db.updateReminder(reminderId, { isActive });
      setReminders(reminders.map(r => 
        r.id === reminderId ? { ...r, isActive } : r
      ));
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: number) => {
    try {
      // Note: Add delete method to database if needed
      setReminders(reminders.filter(r => r.id !== reminderId));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const getMedicationName = (medicationId: number) => {
    const medication = medications.find(m => m.id === medicationId);
    return medication?.name || 'Unknown Medication';
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
              Medication Reminders
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Never miss a dose with smart reminders
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {reminders.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Reminders</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {reminders.filter(r => r.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </Card>
        </div>

        {/* Add Reminder Button */}
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          size="lg"
          fullWidth
          className="touch-feedback"
        >
          <Plus size={20} className="mr-2" />
          Add New Reminder
        </Button>

        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">New Reminder</h3>
            
            {/* Medication Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Medication
              </label>
              <select
                value={selectedMedication || ''}
                onChange={(e) => setSelectedMedication(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select a medication</option>
                {medications.map(med => (
                  <option key={med.id} value={med.id}>
                    {med.name} - {med.dosage}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Days Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Days
              </label>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      if (selectedDays.includes(day)) {
                        setSelectedDays(selectedDays.filter(d => d !== day));
                      } else {
                        setSelectedDays([...selectedDays, day]);
                      }
                    }}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getDayName(day)}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={addReminder}
                variant="primary"
                size="md"
                className="flex-1 touch-feedback"
                disabled={!selectedMedication}
              >
                <CheckCircle size={16} className="mr-2" />
                Save Reminder
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

        {/* Reminders List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Your Reminders ({reminders.length})
          </h2>

          {reminders.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                No reminders set
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first reminder to never miss a dose
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                className="touch-feedback"
              >
                <Plus size={16} className="mr-2" />
                Add First Reminder
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {getMedicationName(reminder.medicationId)}
                        </h3>
                        {reminder.isActive ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">Inactive</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock size={14} />
                        <span>{reminder.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        <span>
                          {reminder.days.map(day => getDayName(day)).join(', ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="sm"
                        variant={reminder.isActive ? "outline" : "primary"}
                        onClick={() => toggleReminder(reminder.id!, !reminder.isActive)}
                        className="touch-feedback"
                      >
                        {reminder.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteReminder(reminder.id!)}
                        className="touch-feedback text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Enable Notifications
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Allow browser notifications to receive medication reminders even when the app is closed.
              </p>
              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                size="sm"
                className="touch-feedback border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Bell size={14} className="mr-2" />
                Enable Notifications
              </Button>
            </div>
          </div>
        </Card>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
} 