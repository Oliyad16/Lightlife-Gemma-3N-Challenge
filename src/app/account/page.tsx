'use client';

import { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Smartphone, 
  Moon, 
  Sun,
  Volume2,
  Zap,
  Heart,
  Database,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ElderlyButton } from '@/components/ui/elderly-button';

export default function AccountPage() {
  const [elderlyMode, setElderlyMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 to-primary/5 px-4 py-6 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Account</h1>
              <p className="text-muted-foreground">Manage your profile and settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Profile Section */}
        <Card className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">John Doe</h3>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
          <Button variant="outline" size="md" fullWidth className="touch-feedback">
            Edit Profile
          </Button>
        </Card>

        {/* Accessibility Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Accessibility
          </h3>
          
          <div className="space-y-4">
            {/* Elderly Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Elderly-Friendly Mode</p>
                <p className="text-sm text-muted-foreground">Larger buttons and text</p>
              </div>
              <Button
                variant={elderlyMode ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setElderlyMode(!elderlyMode)}
                className="touch-feedback"
              >
                {elderlyMode ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Haptic Feedback</p>
                <p className="text-sm text-muted-foreground">Vibration on button taps</p>
              </div>
              <Button
                variant={hapticFeedback ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setHapticFeedback(!hapticFeedback)}
                className="touch-feedback"
              >
                {hapticFeedback ? 'On' : 'Off'}
              </Button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">High Contrast</p>
                <p className="text-sm text-muted-foreground">Improve visibility</p>
              </div>
              <Button variant="outline" size="sm" className="touch-feedback">
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* App Settings */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            App Settings
          </h3>
          
          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">Medication reminders</p>
                </div>
              </div>
              <Button
                variant={notifications ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className="touch-feedback"
              >
                {notifications ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">{darkMode ? 'Dark' : 'Light'} mode</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="touch-feedback"
              >
                Toggle
              </Button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Sound</p>
                  <p className="text-sm text-muted-foreground">App sounds and alerts</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="touch-feedback">
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* AI Settings */}
        <Card className="p-4 border-amber-200 bg-amber-50/30">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Gemma 3N AI
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">AI Status</p>
                <p className="text-sm text-muted-foreground">Offline model ready</p>
              </div>
              <Badge variant="success">Ready</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Model Version</p>
                <p className="text-sm text-muted-foreground">Gemma 3N 2B Instruct</p>
              </div>
              <Button variant="outline" size="sm" className="touch-feedback">
                Update
              </Button>
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data
          </h3>
          
          <div className="space-y-3">
            <Button variant="ghost" size="md" fullWidth className="justify-start touch-feedback">
              <Database className="w-4 h-4 mr-3" />
              Export My Data
            </Button>
            
            <Button variant="ghost" size="md" fullWidth className="justify-start touch-feedback">
              <Shield className="w-4 h-4 mr-3" />
              Privacy Policy
            </Button>
            
            <Button variant="ghost" size="md" fullWidth className="justify-start touch-feedback">
              <Info className="w-4 h-4 mr-3" />
              Terms of Service
            </Button>
          </div>
        </Card>

        {/* Device Info */}
        <Card className="p-4 bg-gray-100/50">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Info
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version:</span>
              <span className="text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span className="text-foreground">Web/Android/Jetson</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Model:</span>
              <span className="text-foreground">Offline Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">FDA Database:</span>
              <span className="text-foreground">Updated</span>
            </div>
          </div>
        </Card>

        {/* Demo: Elderly Mode Button */}
        {elderlyMode && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h3 className="font-semibold text-foreground mb-4 text-center">
              Elderly Mode Preview
            </h3>
            <ElderlyButton
              variant="primary"
              fullWidth
              hapticFeedback={true}
              doubleConfirm={true}
            >
              Large Button Example
            </ElderlyButton>
            <p className="text-sm text-muted-foreground text-center mt-3">
              All buttons will be larger and require double-tap confirmation for safety
            </p>
          </Card>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
