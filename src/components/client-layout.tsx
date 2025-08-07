'use client';

import { useEffect } from 'react';
import { notificationService } from '@/lib/notification-service';
import { gemmaAgent } from '@/agents/gemma-agent';
import { MedicationProvider } from '@/contexts/MedicationContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        // Initialize notification service
        await notificationService.initialize();
        
        // Initialize Gemma 3N AI agent
        await gemmaAgent.initialize();
        
        // Start reminder scheduler
        await notificationService.startReminderScheduler();
        
        console.log('✅ All services initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <MedicationProvider>
      {children}
    </MedicationProvider>
  );
} 