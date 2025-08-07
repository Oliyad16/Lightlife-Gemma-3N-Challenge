'use client';

import { useState, useEffect } from 'react';
import { Brain, Lightbulb, AlertTriangle, MessageCircle, X, RefreshCw, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db, type AIInsight } from '@/lib/db/database';
import { gemmaAgent } from '@/agents/gemma-agent';
import Link from 'next/link';

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [gemmaStatus, setGemmaStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [selectedContext, setSelectedContext] = useState<'medication' | 'health' | 'interaction' | 'general'>('general');

  useEffect(() => {
    const initializeGemma = async () => {
      try {
        setGemmaStatus('initializing');
        await gemmaAgent.initialize();
        setGemmaStatus('ready');
      } catch (error) {
        console.error('Failed to initialize Gemma:', error);
        setGemmaStatus('error');
      }
    };

    const loadData = async () => {
      try {
        const userInsights = await db.getUserInsights(1, false); // Get unread insights
        setInsights(userInsights);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeGemma();
    loadData();
  }, []);

  const generateNewInsight = async () => {
    if (gemmaStatus !== 'ready') return;

    setAiLoading(true);
    try {
      const newInsight = await gemmaAgent.generateInsight(1, selectedContext);
      
      // Add to local state
      const insightData: AIInsight = {
        id: Date.now(), // Temporary ID
        userId: 1,
        type: selectedContext,
        title: newInsight.title,
        content: newInsight.content,
        priority: newInsight.priority,
        isRead: false,
        createdAt: new Date()
      };
      
      setInsights([insightData, ...insights]);
    } catch (error) {
      console.error('Failed to generate insight:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const markAsRead = async (insightId: number) => {
    try {
      await db.markInsightAsRead(insightId);
      setInsights(insights.map(insight => 
        insight.id === insightId ? { ...insight, isRead: true } : insight
      ));
    } catch (error) {
      console.error('Failed to mark insight as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'health': return '❤️';
      case 'interaction': return '⚠️';
      case 'general': return '💡';
      default: return '🧠';
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
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="p-2 hover:bg-white/20 rounded-full">
              <X size={24} className="text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex-1">
              AI Insights
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Powered by Gemma 3N - Your personal health AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-sm mx-auto space-y-6">
        
        {/* Gemma Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-primary" />
              <span className="font-semibold text-foreground">Gemma 3N Status</span>
            </div>
            <Badge 
              variant={gemmaStatus === 'ready' ? 'success' : gemmaStatus === 'error' ? 'destructive' : 'secondary'}
              size="sm"
            >
              {gemmaStatus === 'ready' ? 'Online' : gemmaStatus === 'error' ? 'Error' : 'Initializing'}
            </Badge>
          </div>
          
          {gemmaStatus === 'ready' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Sparkles size={14} />
              <span>AI running offline - 100% private</span>
            </div>
          )}
          
          {gemmaStatus === 'initializing' && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <RefreshCw size={14} className="animate-spin" />
              <span>Loading AI model...</span>
            </div>
          )}
          
          {gemmaStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle size={14} />
              <span>Failed to initialize AI</span>
            </div>
          )}
        </Card>

        {/* Generate New Insight */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Generate New Insight</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Context
            </label>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value as 'medication' | 'health' | 'interaction' | 'general')}
              className="w-full p-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="general">General Health</option>
              <option value="medication">Medication</option>
              <option value="health">Health Tracking</option>
              <option value="interaction">Drug Interactions</option>
            </select>
          </div>

          <Button
            onClick={generateNewInsight}
            disabled={gemmaStatus !== 'ready' || aiLoading}
            variant="primary"
            size="lg"
            fullWidth
            className="touch-feedback"
          >
            {aiLoading ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb size={16} className="mr-2" />
                Ask Gemma
              </>
            )}
          </Button>
        </Card>

        {/* Insights List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Your Insights ({insights.length})
          </h2>

          {insights.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                No insights yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first AI-powered health insight
              </p>
              <Button
                onClick={generateNewInsight}
                disabled={gemmaStatus !== 'ready'}
                variant="primary"
                className="touch-feedback"
              >
                <Lightbulb size={16} className="mr-2" />
                Generate Insight
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className={`p-4 transition-all duration-200 ${
                    !insight.isRead ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getInsightIcon(insight.type)}</span>
                      <h3 className="font-semibold text-foreground">{insight.title}</h3>
                    </div>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      className={getPriorityColor(insight.priority)}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    {!insight.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(insight.id!)}
                        className="touch-feedback"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* AI Capabilities */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">What Gemma 3N Can Do</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Brain size={16} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Medication Analysis</h4>
                <p className="text-sm text-muted-foreground">Analyze your medication patterns and provide personalized recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Interaction Detection</h4>
                <p className="text-sm text-muted-foreground">Identify potential drug interactions and food conflicts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={16} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Health Insights</h4>
                <p className="text-sm text-muted-foreground">Provide personalized health recommendations based on your data</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/medications">
              <Button variant="outline" size="md" fullWidth className="touch-feedback">
                <Brain size={16} className="mr-2" />
                Analyze Meds
              </Button>
            </Link>
            <Link href="/health-log">
              <Button variant="outline" size="md" fullWidth className="touch-feedback">
                <MessageCircle size={16} className="mr-2" />
                Health Review
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