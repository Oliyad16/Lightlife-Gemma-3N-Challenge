'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pill, Clock, AlertTriangle, Apple, X, MessageCircle, Send, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedications } from '@/contexts/MedicationContext';
import { gemmaAgent } from '@/agents/gemma-agent';
import Link from 'next/link';

export default function MedicationsPage() {
  const { medications, loading } = useMedications();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedMedication, setSelectedMedication] = useState<{name: string} | null>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);
  const [aiInitError, setAiInitError] = useState<string | null>(null);

  // Initialize AI agent
  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log('Initializing AI agent for medications page...');
        await gemmaAgent.initialize();
        setAiInitialized(true);
        console.log('AI agent initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AI agent:', error);
        setAiInitError(error instanceof Error ? error.message : 'Unknown error');
        // Still set as initialized to allow fallback mode
        setAiInitialized(true);
      }
    };

    initializeAI();
  }, []);

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && med.isActive) ||
      (filter === 'inactive' && !med.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getNextDoseTime = () => {
    // Mock next dose calculation
    const now = new Date();
    const nextDose = new Date(now.getTime() + Math.random() * 6 * 60 * 60 * 1000); // Random time within 6 hours
    return nextDose.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Food recommendations for different medications
  const getFoodRecommendations = (medicationName: string) => {
    const recommendations: { [key: string]: { avoid: string[], recommended: string[] } } = {
      'Metformin': {
        avoid: ['High-sugar foods', 'Alcohol', 'Grapefruit', 'Refined carbohydrates'],
        recommended: ['Whole grains', 'Leafy greens', 'Lean proteins', 'Berries', 'Nuts']
      },
      'Lisinopril': {
        avoid: ['High-sodium foods', 'Processed meats', 'Canned soups', 'Pickled foods'],
        recommended: ['Fresh vegetables', 'Fruits', 'Lean meats', 'Low-fat dairy', 'Herbs and spices']
      },
      'Vitamin D3': {
        avoid: ['Excessive caffeine', 'High-oxalate foods'],
        recommended: ['Fatty fish', 'Egg yolks', 'Mushrooms', 'Fortified dairy', 'Sunlight exposure']
      },
      'Aspirin': {
        avoid: ['Alcohol', 'Grapefruit', 'High-fat foods'],
        recommended: ['Water', 'Light meals', 'Ginger tea', 'Bland foods']
      },
      'Ibuprofen': {
        avoid: ['Alcohol', 'Spicy foods', 'Acidic foods'],
        recommended: ['Water', 'Bland foods', 'Ginger', 'Peppermint tea']
      }
    };
    
    return recommendations[medicationName] || {
      avoid: ['Consult your doctor for specific dietary restrictions'],
      recommended: ['Maintain a balanced diet', 'Stay hydrated', 'Eat regular meals']
    };
  };

  const openFoodModal = (medication: {name: string}) => {
    setSelectedMedication(medication);
    setShowFoodModal(true);
  };

  const sendAIMessage = async () => {
    if (!chatMessage.trim() || isAILoading || !aiInitialized) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsAILoading(true);

    try {
      // Get current medications for context
      const currentMeds = medications.map(med => med.name).join(', ');
      
      // Get AI response - use medication advice with general context
      const response = await gemmaAgent.provideMedicationAdvice(
        currentMeds || 'general medications', 
        userMessage
      );
      
      setChatHistory(prev => [...prev, { type: 'ai', message: response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const getPersonalizedFoodRecommendations = async () => {
    if (isAILoading || !aiInitialized) return;

    setIsAILoading(true);
    try {
      const currentMeds = medications.map(med => med.name).join(', ');
      
      const response = await gemmaAgent.provideMedicationAdvice(
        currentMeds || 'general medications', 
        'What are the best food recommendations and dietary considerations for these medications?'
      );
      setChatHistory(prev => [...prev, { type: 'ai', message: response }]);
    } catch (error) {
      console.error('AI recommendation error:', error);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: 'Sorry, I couldn\'t generate personalized recommendations right now.' 
      }]);
    } finally {
      setIsAILoading(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground mb-2">
            My Medications
          </h1>
          <p className="text-muted-foreground text-base mb-4">
            Manage your medication schedule
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', count: medications.length },
            { key: 'active', label: 'Active', count: medications.filter(med => med.isActive).length },
            { key: 'inactive', label: 'Inactive', count: medications.filter(med => !med.isActive).length }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab.key as 'all' | 'active' | 'inactive')}
              className="flex-1 touch-feedback"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {medications.filter(m => m.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {medications.filter(() => {
                // Mock: check if any doses are due soon
                return Math.random() > 0.7;
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Due Soon</div>
          </Card>
        </div>

        {/* Medications List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Your Medications ({filteredMedications.length})
            </h2>
            <Link href="/scan">
              <Button size="sm" className="touch-feedback">
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </Link>
          </div>

          {filteredMedications.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {searchQuery ? 'No medications found' : 'No medications yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start by scanning a medication barcode or adding manually'
                }
              </p>
              {!searchQuery && (
                <Link href="/scan">
                  <Button className="touch-feedback">
                    <Plus size={16} className="mr-2" />
                    Add First Medication
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMedications.map((medication) => (
                <Card key={medication.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{medication.name}</h3>
                        {medication.isActive ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {medication.dosage} • {medication.frequency}
                      </p>
                      
                      {/* Next Dose Info */}
                      {medication.isActive && (
                                              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                        <Clock size={12} />
                        <span>Next: {getNextDoseTime()}</span>
                      </div>
                      )}
                    </div>
                    
                                        <div className="flex flex-col items-end gap-2">
                      <Button size="sm" variant="outline" className="touch-feedback">
                        View Details
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="touch-feedback"
                        onClick={() => openFoodModal(medication)}
                      >
                        <Apple size={12} className="mr-1" />
                        Food Guide
                      </Button>
                      
                      {/* Warning indicators */}
                      {Math.random() > 0.8 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle size={12} />
                          <span>Check interactions</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional info */}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Added: {new Date(medication.createdAt).toLocaleDateString()}</span>
                    <span>{medication.description ? 'Has notes' : 'No notes'}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* AI Chat Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Brain size={16} className="text-primary" />
              AI Health Assistant
            </h3>
            <Button
              onClick={() => setShowAIChat(!showAIChat)}
              variant="outline"
              size="sm"
              disabled={!aiInitialized}
              className="touch-feedback"
            >
              <MessageCircle size={14} className="mr-1" />
              {!aiInitialized ? 'AI Loading...' : showAIChat ? 'Hide Chat' : 'Open Chat'}
            </Button>
          </div>

          {showAIChat && (
            <div className="space-y-3">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={getPersonalizedFoodRecommendations}
                  disabled={isAILoading || !aiInitialized}
                  variant="outline"
                  size="sm"
                  className="touch-feedback"
                >
                  <Apple size={14} className="mr-1" />
                  Get Food Tips
                </Button>
                <Button
                  onClick={() => {
                    const prompt = "What are the best times to take my medications?";
                    setChatMessage(prompt);
                    setTimeout(() => sendAIMessage(), 100);
                  }}
                  disabled={isAILoading || !aiInitialized}
                  variant="outline"
                  size="sm"
                  className="touch-feedback"
                >
                  <Clock size={14} className="mr-1" />
                  Timing Tips
                </Button>
              </div>

              {/* Chat History */}
              <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                {!aiInitialized && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Initializing AI assistant...</p>
                    {aiInitError && (
                      <p className="text-xs text-red-500 mt-1">Using fallback mode: {aiInitError}</p>
                    )}
                  </div>
                )}
                {aiInitialized && chatHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Ask me about your medications, food interactions, or health tips!
                  </p>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          msg.type === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                {isAILoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-2 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder={aiInitialized ? "Ask about your medications..." : "AI initializing..."}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isAILoading || !aiInitialized}
                />
                <Button
                  onClick={sendAIMessage}
                  disabled={!chatMessage.trim() || isAILoading || !aiInitialized}
                  size="sm"
                  className="touch-feedback"
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        {filteredMedications.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/scan">
                <Button variant="outline" size="md" fullWidth className="touch-feedback">
                  <Plus size={16} className="mr-2" />
                  Add New
                </Button>
              </Link>
              <Button 
                onClick={() => setShowAIChat(true)}
                variant="outline" 
                size="md" 
                fullWidth 
                disabled={!aiInitialized}
                className="touch-feedback"
              >
                <Brain size={16} className="mr-2" />
                {aiInitialized ? 'Ask AI' : 'AI Loading...'}
              </Button>
            </div>
          </Card>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* Food Recommendations Modal */}
      {showFoodModal && selectedMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  Food Guide for {selectedMedication.name}
                </h2>
                <button
                  onClick={() => setShowFoodModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Avoid Foods */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                    ❌ AVOID FOODS
                  </h3>
                  <div className="space-y-2">
                    {getFoodRecommendations(selectedMedication.name).avoid.map((food, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        <div className="font-medium text-red-800">{food}</div>
                        <div className="text-xs text-red-600">May interfere with medication</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Foods */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                    ✅ RECOMMENDED FOODS
                  </h3>
                  <div className="space-y-2">
                    {getFoodRecommendations(selectedMedication.name).recommended.map((food, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <div className="font-medium text-green-800">{food}</div>
                        <div className="text-xs text-green-600">Supports medication effectiveness</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 General Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Always take medications as prescribed by your doctor</li>
                    <li>• Maintain consistent meal timing</li>
                    <li>• Stay hydrated throughout the day</li>
                    <li>• Consult your healthcare provider for personalized advice</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => setShowFoodModal(false)}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="touch-feedback"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}