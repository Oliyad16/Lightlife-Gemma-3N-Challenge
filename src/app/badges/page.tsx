'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Target, Award, X, Lock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db/database';
import Link from 'next/link';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'medication' | 'health' | 'streak' | 'achievement';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'medication' | 'health' | 'streak' | 'achievement'>('all');

  useEffect(() => {
    const loadBadges = async () => {
      try {
        // Simulate loading user data to determine badge progress
        const userStats = await db.getUserStats(1);
        
        // Define all possible badges
        const allBadges: BadgeData[] = [
          // Medication badges
          {
            id: 'first-medication',
            name: 'First Steps',
            description: 'Add your first medication',
            icon: '💊',
            category: 'medication',
            unlocked: userStats.totalMedications > 0,
            progress: Math.min(userStats.totalMedications, 1),
            maxProgress: 1,
            unlockedDate: userStats.totalMedications > 0 ? new Date() : undefined,
            rarity: 'common'
          },
          {
            id: 'medication-master',
            name: 'Medication Master',
            description: 'Add 5 different medications',
            icon: '🏆',
            category: 'medication',
            unlocked: userStats.totalMedications >= 5,
            progress: Math.min(userStats.totalMedications, 5),
            maxProgress: 5,
            unlockedDate: userStats.totalMedications >= 5 ? new Date() : undefined,
            rarity: 'rare'
          },
          {
            id: 'perfect-week',
            name: 'Perfect Week',
            description: 'Take all medications on time for 7 days',
            icon: '⭐',
            category: 'medication',
            unlocked: userStats.adherenceRate >= 100,
            progress: Math.min(userStats.adherenceRate, 100),
            maxProgress: 100,
            unlockedDate: userStats.adherenceRate >= 100 ? new Date() : undefined,
            rarity: 'epic'
          },
          
          // Health badges
          {
            id: 'health-tracker',
            name: 'Health Tracker',
            description: 'Log your health data for 5 days',
            icon: '📊',
            category: 'health',
            unlocked: false, // Would need health log count
            progress: 2,
            maxProgress: 5,
            rarity: 'common'
          },
          {
            id: 'vital-signs',
            name: 'Vital Signs',
            description: 'Record all vital signs in one day',
            icon: '❤️',
            category: 'health',
            unlocked: false,
            progress: 0,
            maxProgress: 4,
            rarity: 'rare'
          },
          
          // Streak badges
          {
            id: 'week-warrior',
            name: 'Week Warrior',
            description: 'Maintain a 7-day medication streak',
            icon: '🔥',
            category: 'streak',
            unlocked: false,
            progress: 3,
            maxProgress: 7,
            rarity: 'common'
          },
          {
            id: 'month-master',
            name: 'Month Master',
            description: 'Maintain a 30-day medication streak',
            icon: '👑',
            category: 'streak',
            unlocked: false,
            progress: 3,
            maxProgress: 30,
            rarity: 'legendary'
          },
          
          // Achievement badges
          {
            id: 'early-bird',
            name: 'Early Bird',
            description: 'Take morning medication before 8 AM for 5 days',
            icon: '🌅',
            category: 'achievement',
            unlocked: false,
            progress: 2,
            maxProgress: 5,
            rarity: 'rare'
          },
          {
            id: 'reminder-setter',
            name: 'Reminder Setter',
            description: 'Set up medication reminders for all active medications',
            icon: '🔔',
            category: 'achievement',
            unlocked: false,
            progress: 1,
            maxProgress: 3,
            rarity: 'common'
          }
        ];
        
        setBadges(allBadges);
      } catch (error) {
        console.error('Failed to load badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBackground = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const filteredBadges = badges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const totalBadges = badges.length;

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
              Achievements
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Track your progress and unlock achievements
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Progress Overview */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {unlockedBadges.length}/{totalBadges}
              </div>
              <div className="text-sm text-muted-foreground">Badges Unlocked</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedBadges.length / totalBadges) * 100}%` }}
            ></div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All', icon: '🏆' },
            { key: 'medication', label: 'Medication', icon: '💊' },
            { key: 'health', label: 'Health', icon: '❤️' },
            { key: 'streak', label: 'Streaks', icon: '🔥' },
            { key: 'achievement', label: 'Achievements', icon: '⭐' }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as 'all' | 'medication' | 'health' | 'streak' | 'achievement')}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedCategory === 'all' ? 'All Badges' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Badges`}
          </h2>

          {filteredBadges.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                No badges in this category
              </h3>
              <p className="text-sm text-muted-foreground">
                Try selecting a different category or complete more tasks to unlock badges
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredBadges.map((badge) => (
                <Card 
                  key={badge.id} 
                  className={`p-4 text-center transition-all duration-200 ${
                    badge.unlocked 
                      ? 'bg-white shadow-md' 
                      : 'bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl ${
                    badge.unlocked 
                      ? getRarityBackground(badge.rarity)
                      : 'bg-gray-200'
                  }`}>
                    {badge.unlocked ? (
                      <span>{badge.icon}</span>
                    ) : (
                      <Lock size={20} className="text-gray-400" />
                    )}
                  </div>

                  {/* Badge Info */}
                  <h3 className={`font-semibold text-sm mb-1 ${
                    badge.unlocked ? 'text-foreground' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      {badge.progress}/{badge.maxProgress}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          badge.unlocked 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Rarity Badge */}
                  <Badge 
                    variant="outline" 
                    size="sm"
                    className={`text-xs ${getRarityColor(badge.rarity)}`}
                  >
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </Badge>

                  {/* Unlocked Date */}
                  {badge.unlocked && badge.unlockedDate && (
                    <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                      <CheckCircle size={10} />
                      <span>Unlocked {badge.unlockedDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Unlock More Badges</h3>
          <div className="space-y-3">
            <Link href="/medications">
              <Button variant="outline" size="md" fullWidth className="touch-feedback">
                <Target size={16} className="mr-2" />
                Add Medications
              </Button>
            </Link>
            <Link href="/health-log">
              <Button variant="outline" size="md" fullWidth className="touch-feedback">
                <Award size={16} className="mr-2" />
                Log Health Data
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