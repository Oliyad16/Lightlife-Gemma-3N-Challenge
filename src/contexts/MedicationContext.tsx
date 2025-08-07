'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, type Medication } from '@/lib/db/database';

interface MedicationContextType {
  medications: Medication[];
  loading: boolean;
  refreshMedications: () => Promise<void>;
  addMedication: (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateMedication: (id: number, updates: Partial<Medication>) => Promise<number>;
  deactivateMedication: (id: number) => Promise<number>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

interface MedicationProviderProps {
  children: ReactNode;
}

export const MedicationProvider: React.FC<MedicationProviderProps> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMedications = async () => {
    try {
      console.log('Refreshing medications from database...');
      const userMeds = await db.getUserMedications(1); // Assuming user ID 1
      setMedications(userMeds);
      console.log('Medications refreshed:', userMeds.length);
    } catch (error) {
      console.error('Failed to refresh medications:', error);
    }
  };

  const addMedication = async (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    try {
      console.log('Adding medication through context:', medicationData);
      const medicationId = await db.addMedication(medicationData);
      
      // Refresh medications after adding
      await refreshMedications();
      
      console.log('Medication added and refreshed, ID:', medicationId);
      return medicationId;
    } catch (error) {
      console.error('Failed to add medication through context:', error);
      throw error;
    }
  };

  const updateMedication = async (id: number, updates: Partial<Medication>): Promise<number> => {
    try {
      console.log('Updating medication through context:', id, updates);
      const result = await db.updateMedication(id, updates);
      
      // Refresh medications after updating
      await refreshMedications();
      
      console.log('Medication updated and refreshed');
      return result;
    } catch (error) {
      console.error('Failed to update medication through context:', error);
      throw error;
    }
  };

  const deactivateMedication = async (id: number): Promise<number> => {
    try {
      console.log('Deactivating medication through context:', id);
      const result = await db.deactivateMedication(id);
      
      // Refresh medications after deactivating
      await refreshMedications();
      
      console.log('Medication deactivated and refreshed');
      return result;
    } catch (error) {
      console.error('Failed to deactivate medication through context:', error);
      throw error;
    }
  };

  // Initialize medications on mount
  useEffect(() => {
    const initializeMedications = async () => {
      try {
        // First, ensure we have sample data if none exists
        const allUsers = await db.users.toArray();
        
        if (allUsers.length === 0) {
          console.log('No users found, creating sample data...');
          
          // Create sample user
          await db.users.add({
            name: 'Sarah',
            email: 'sarah@example.com',
            dateOfBirth: '1975-08-20',
            emergencyContact: '+1-555-0123',
            medicalConditions: ['Hypertension', 'Diabetes Type 2'],
            allergies: ['Penicillin'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          // Create sample medications
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
            },
            {
              userId: 1,
              name: 'Vitamin D3',
              dosage: '2000 IU',
              frequency: 'Once daily',
              instructions: 'Take with breakfast',
              startDate: new Date('2024-02-01'),
              isActive: true,
              description: 'Vitamin D supplement',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          
          await db.medications.bulkAdd(sampleMedications);
          console.log('Sample medications added');
        }
        
        // Load medications
        await refreshMedications();
        
      } catch (error) {
        console.error('Failed to initialize medications:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMedications();
  }, []);

  const contextValue: MedicationContextType = {
    medications,
    loading,
    refreshMedications,
    addMedication,
    updateMedication,
    deactivateMedication
  };

  return (
    <MedicationContext.Provider value={contextValue}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedications = (): MedicationContextType => {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedications must be used within a MedicationProvider');
  }
  return context;
};

export default MedicationProvider;