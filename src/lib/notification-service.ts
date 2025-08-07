/**
 * Notification Service for LifeLight
 * Handles medication reminders and notifications
 */

import { db, type MedicationReminder, type Medication } from '@/lib/db/database';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private permission: NotificationPermission = 'default';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser');
        return;
      }

      // Request permission if not already granted
      if (Notification.permission === 'default') {
        this.permission = await Notification.requestPermission();
      } else {
        this.permission = Notification.permission;
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async sendNotification(data: NotificationData): Promise<void> {
    if (!this.isInitialized || this.permission !== 'granted') {
      console.warn('Notifications not available or permission not granted');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/icon-192x192.png',
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to relevant page based on data
        if (data.data?.action && typeof data.data.action === 'string') {
          window.location.href = data.data.action;
        }
      };

      // Auto-close after 10 seconds if not requiring interaction
      if (!data.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async sendMedicationReminder(reminder: MedicationReminder, medication: Medication): Promise<void> {
    const notificationData: NotificationData = {
      title: 'Medication Reminder',
      body: `Time to take ${medication.name} (${medication.dosage})`,
      icon: '/icon-192x192.png',
      tag: `medication-${reminder.id}`,
      requireInteraction: true,
      data: {
        action: '/medications',
        reminderId: reminder.id,
        medicationId: medication.id
      }
    };

    await this.sendNotification(notificationData);
  }

  async sendHealthReminder(): Promise<void> {
    const notificationData: NotificationData = {
      title: 'Health Check-in',
      body: 'How are you feeling today? Take a moment to log your health.',
      icon: '/icon-192x192.png',
      tag: 'health-reminder',
      data: {
        action: '/health-log'
      }
    };

    await this.sendNotification(notificationData);
  }

  async sendInteractionWarning(medication1: string, medication2: string): Promise<void> {
    const notificationData: NotificationData = {
      title: 'Drug Interaction Alert',
      body: `Potential interaction detected between ${medication1} and ${medication2}. Please consult your doctor.`,
      icon: '/icon-192x192.png',
      tag: 'interaction-warning',
      requireInteraction: true,
      data: {
        action: '/ai-insights'
      }
    };

    await this.sendNotification(notificationData);
  }

  async sendAchievementUnlocked(achievement: string): Promise<void> {
    const notificationData: NotificationData = {
      title: 'Achievement Unlocked! 🏆',
      body: `Congratulations! You've earned the "${achievement}" badge.`,
      icon: '/icon-192x192.png',
      tag: 'achievement',
      data: {
        action: '/badges'
      }
    };

    await this.sendNotification(notificationData);
  }

  async scheduleReminders(): Promise<void> {
    try {
      const userId = 1; // Get from auth context
      const reminders = await db.getUserReminders(userId);
      
      for (const reminder of reminders) {
        if (!reminder.isActive) continue;

        // Get medication details
        const medications = await db.getUserMedications(userId);
        const medication = medications.find(m => m.id === reminder.medicationId);
        
        if (!medication) continue;

        // Check if reminder is due
        const now = new Date();
        const reminderTime = new Date();
        const [hours, minutes] = reminder.time.split(':');
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Check if today is a scheduled day
        const today = now.getDay();
        if (!reminder.days.includes(today)) continue;

        // Check if reminder is due within the next 5 minutes
        const timeDiff = reminderTime.getTime() - now.getTime();
        if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) {
          await this.sendMedicationReminder(reminder, medication);
        }
      }
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
    }
  }

  async startReminderScheduler(): Promise<void> {
    // Check for due reminders every minute
    setInterval(() => {
      this.scheduleReminders();
    }, 60 * 1000);

    // Also check immediately
    await this.scheduleReminders();
  }

  async testNotification(): Promise<void> {
    const notificationData: NotificationData = {
      title: 'LifeLight Test',
      body: 'Notifications are working correctly!',
      icon: '/icon-192x192.png',
      tag: 'test'
    };

    await this.sendNotification(notificationData);
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 