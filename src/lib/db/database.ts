'use client';

import Dexie, { Table } from 'dexie';

// Database Interfaces
export interface User {
  id?: number;
  name: string;
  email: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  medicalConditions?: string[];
  allergies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id?: number;
  userId: number;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  reminderTimes?: string[];
  ndcNumber?: string;
  barcode?: string;
  description?: string;
  sideEffects?: string[];
  interactions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthLog {
  id?: number;
  userId: number;
  date: Date;
  healthScore: number;
  symptoms?: string[];
  notes?: string;
  medicationsTaken?: number[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    weight?: number;
    temperature?: number;
  };
  createdAt: Date;
}

export interface MedicationReminder {
  id?: number;
  medicationId: number;
  userId: number;
  time: string;
  days: number[]; // 0-6 representing Sunday-Saturday
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface DrugInteraction {
  id?: number;
  medication1: string;
  medication2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
  source: string;
  createdAt: Date;
}

export interface MedicationLog {
  id?: number;
  userId: number;
  medicationId: number;
  takenAt: Date;
  dosageTaken: string;
  notes?: string;
  reminded: boolean;
  createdAt: Date;
}

export interface AIInsight {
  id?: number;
  userId: number;
  type: 'medication' | 'health' | 'interaction' | 'general';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

class LifeLightDatabase extends Dexie {
  users!: Table<User>;
  medications!: Table<Medication>;
  healthLogs!: Table<HealthLog>;
  medicationReminders!: Table<MedicationReminder>;
  drugInteractions!: Table<DrugInteraction>;
  medicationLogs!: Table<MedicationLog>;
  aiInsights!: Table<AIInsight>;

  constructor() {
    super('LifeLightDatabase');
    
    this.version(1).stores({
      users: '++id, email, name, createdAt',
      medications: '++id, userId, name, isActive, startDate, ndcNumber, barcode, createdAt',
      healthLogs: '++id, userId, date, healthScore, createdAt',
      medicationReminders: '++id, medicationId, userId, isActive, createdAt',
      drugInteractions: '++id, medication1, medication2, severity, createdAt',
      medicationLogs: '++id, userId, medicationId, takenAt, createdAt',
      aiInsights: '++id, userId, type, priority, isRead, createdAt'
    });

    // Hooks for automatic timestamps - simplified to avoid TS errors
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      this.users.hook('creating', (_primKey: unknown, obj: any) => {
        obj.createdAt = new Date();
        obj.updatedAt = new Date();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.users.hook('updating', (modifications: any) => {
        modifications.updatedAt = new Date();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      this.medications.hook('creating', (_primKey: unknown, obj: any) => {
        obj.createdAt = new Date();
        obj.updatedAt = new Date();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.medications.hook('updating', (modifications: any) => {
        modifications.updatedAt = new Date();
      });

      // Auto-add timestamps to other tables
      [this.healthLogs, this.medicationReminders, this.drugInteractions, 
       this.medicationLogs, this.aiInsights].forEach(table => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        table.hook('creating', (_primKey: unknown, obj: any) => {
          obj.createdAt = new Date();
        });
      });
    } catch (error) {
      console.warn('Hook setup warning:', error);
    }
  }

  // User Methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await this.users.add(userData as User);
  }

  async getUser(id: number): Promise<User | undefined> {
    return await this.users.get(id);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<number> {
    return await this.users.update(id, updates);
  }

  // Medication Methods
  async addMedication(medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await this.medications.add(medicationData as Medication);
  }

  async getUserMedications(userId: number): Promise<Medication[]> {
    return await this.medications
      .where('userId')
      .equals(userId)
      .toArray();
  }

  async getActiveMedications(userId: number): Promise<Medication[]> {
    return await this.medications
      .where({ userId, isActive: true })
      .toArray();
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<number> {
    return await this.medications.update(id, updates);
  }

  async deactivateMedication(id: number): Promise<number> {
    return await this.medications.update(id, { isActive: false, endDate: new Date() });
  }

  async getMedicationByBarcode(barcode: string): Promise<Medication | undefined> {
    return await this.medications
      .where('barcode')
      .equals(barcode)
      .first();
  }

  async searchMedications(query: string, userId?: number): Promise<Medication[]> {
    let collection = this.medications.toCollection();
    
    if (userId) {
      collection = this.medications.where('userId').equals(userId);
    }

    return await collection
      .filter((med: Medication) => {
        const nameMatch = med.name.toLowerCase().includes(query.toLowerCase());
        const genericMatch = med.genericName ? med.genericName.toLowerCase().includes(query.toLowerCase()) : false;
        return nameMatch || genericMatch;
      })
      .toArray();
  }

  // Health Log Methods
  async addHealthLog(logData: Omit<HealthLog, 'id' | 'createdAt'>): Promise<number> {
    return await this.healthLogs.add(logData as HealthLog);
  }

  async getUserHealthLogs(userId: number, limit?: number): Promise<HealthLog[]> {
    let results = await this.healthLogs
      .where('userId')
      .equals(userId)
      .toArray();

    // Sort by date in reverse order
    results.sort((a, b) => b.date.getTime() - a.date.getTime());

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  async getHealthLogsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<HealthLog[]> {
    const results = await this.healthLogs
      .where('userId')
      .equals(userId)
      .and((log: HealthLog) => log.date >= startDate && log.date <= endDate)
      .toArray();
    
    // Sort by date
    return results.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Medication Reminder Methods
  async addMedicationReminder(reminderData: Omit<MedicationReminder, 'id' | 'createdAt'>): Promise<number> {
    return await this.medicationReminders.add(reminderData as MedicationReminder);
  }

  async getUserReminders(userId: number): Promise<MedicationReminder[]> {
    return await this.medicationReminders
      .where({ userId, isActive: true })
      .toArray();
  }

  async updateReminder(id: number, updates: Partial<MedicationReminder>): Promise<number> {
    return await this.medicationReminders.update(id, updates);
  }

  // Drug Interaction Methods
  async addDrugInteraction(interactionData: Omit<DrugInteraction, 'id' | 'createdAt'>): Promise<number> {
    return await this.drugInteractions.add(interactionData as DrugInteraction);
  }

  async checkDrugInteractions(medications: string[]): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();
        
        const interaction = await this.drugInteractions
          .where('medication1').equals(med1).and(item => item.medication2 === med2)
          .or('medication1').equals(med2).and(item => item.medication2 === med1)
          .first();
          
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions;
  }

  // Medication Log Methods
  async logMedicationTaken(logData: Omit<MedicationLog, 'id' | 'createdAt'>): Promise<number> {
    return await this.medicationLogs.add(logData as MedicationLog);
  }

  async getUserMedicationLogs(userId: number, limit?: number): Promise<MedicationLog[]> {
    let results = await this.medicationLogs
      .where('userId')
      .equals(userId)
      .toArray();

    // Sort by takenAt in reverse order
    results.sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  async getMedicationAdherence(userId: number, medicationId: number, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await this.medicationLogs
      .where('userId').equals(userId)
      .and(log => log.medicationId === medicationId && log.takenAt >= startDate)
      .count();

    // This is a simplified calculation - in reality you'd compare against prescribed frequency
    return Math.min(100, (logs / days) * 100);
  }

  // AI Insights Methods
  async addAIInsight(insightData: Omit<AIInsight, 'id' | 'createdAt'>): Promise<number> {
    return await this.aiInsights.add(insightData as AIInsight);
  }

  async getUserInsights(userId: number, unreadOnly?: boolean): Promise<AIInsight[]> {
    let query = this.aiInsights.where('userId').equals(userId);
    
    if (unreadOnly) {
      query = query.and(insight => !insight.isRead);
    }
    
    const results = await query.toArray();
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markInsightAsRead(id: number): Promise<number> {
    return await this.aiInsights.update(id, { isRead: true });
  }

  async cleanupExpiredInsights(): Promise<number> {
    const now = new Date();
    const expiredInsights = await this.aiInsights
      .where('expiresAt')
      .below(now)
      .toArray();
    
    const deletedCount = expiredInsights.length;
    await this.aiInsights.bulkDelete(expiredInsights.map(insight => insight.id!));
    return deletedCount;
  }

  // Analytics and Stats Methods
  async getUserStats(userId: number): Promise<{
    totalMedications: number;
    activeMedications: number;
    averageHealthScore: number;
    adherenceRate: number;
    unreadInsights: number;
  }> {
    const [
      totalMedications,
      activeMedications,
      recentHealthLogs,
      recentMedicationLogs,
      unreadInsights
    ] = await Promise.all([
      this.medications.where('userId').equals(userId).count(),
      this.medications.where({ userId, isActive: true }).count(),
      this.getUserHealthLogs(userId, 30),
      this.getUserMedicationLogs(userId, 100),
      this.aiInsights.where({ userId, isRead: false }).count()
    ]);

    const averageHealthScore = recentHealthLogs.length > 0
      ? recentHealthLogs.reduce((sum, log) => sum + log.healthScore, 0) / recentHealthLogs.length
      : 0;

    // Simplified adherence calculation
    const adherenceRate = recentMedicationLogs.length > 0
      ? Math.min(100, (recentMedicationLogs.length / 30) * 100)
      : 0;

    return {
      totalMedications,
      activeMedications,
      averageHealthScore,
      adherenceRate,
      unreadInsights
    };
  }

  // Backup and Restore
  async exportUserData(userId: number): Promise<{
    user: User | undefined;
    medications: Medication[];
    healthLogs: HealthLog[];
    medicationLogs: MedicationLog[];
    insights: AIInsight[];
  }> {
    const [user, medications, healthLogs, medicationLogs, insights] = await Promise.all([
      this.getUser(userId),
      this.getUserMedications(userId),
      this.getUserHealthLogs(userId),
      this.getUserMedicationLogs(userId),
      this.getUserInsights(userId)
    ]);

    return { user, medications, healthLogs, medicationLogs, insights };
  }

  // Database maintenance
  async performMaintenance(): Promise<void> {
    console.log('Performing database maintenance...');
    
    // Clean up expired insights
    const expiredInsights = await this.cleanupExpiredInsights();
    console.log(`Cleaned up ${expiredInsights} expired insights`);
    
    // Additional cleanup tasks can be added here
    console.log('Database maintenance completed');
  }
}

// Export singleton instance
export const db = new LifeLightDatabase();

// Initialize sample data in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  db.on('populate', () => {
    console.log('Populating development database...');
    
    // Add sample user
    db.users.add({
      name: 'John Doe',
      email: 'john.doe@example.com',
      dateOfBirth: '1950-05-15',
      emergencyContact: '+1-555-0123',
      medicalConditions: ['Hypertension', 'Diabetes Type 2'],
      allergies: ['Penicillin'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add sample medications
    const sampleMedications = [
      {
        userId: 1,
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals',
        startDate: new Date('2024-01-01'),
        isActive: true,
        ndcNumber: '0093-1079-01',
        description: 'For diabetes management',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take in the morning',
        startDate: new Date('2024-01-15'),
        isActive: true,
        ndcNumber: '0093-5056-01',
        description: 'For blood pressure control',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    db.medications.bulkAdd(sampleMedications);

    console.log('Development database populated');
  });
}

export default db;