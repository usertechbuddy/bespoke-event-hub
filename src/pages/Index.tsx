
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, User, DollarSign, BarChart3, LogOut, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import ClientManagement from '@/components/ClientManagement';
import EventScheduling from '@/components/EventScheduling';
import VendorManagement from '@/components/VendorManagement';
import BudgetModule from '@/components/BudgetModule';
import ReportingDashboard from '@/components/ReportingDashboard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { role, isWorker, updateRole } = useUserRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingEvents: 0,
    activeVendors: 0,
    totalBudget: 0
  });

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Fetch data from Supabase instead of localStorage
      const [clientsData, eventsData, vendorsData, budgetsData] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('events').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('budgets').select('*')
      ]);

      const clients = clientsData.data || [];
      const events = eventsData.data || [];
      const vendors = vendorsData.data || [];
      const budgets = budgetsData.data || [];

      const now = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) > now);
      const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.total_budget || 0), 0);

      setStats({
        totalClients: clients.length,
        upcomingEvents: upcomingEvents.length,
        activeVendors: vendors.length,
        totalBudget
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 rounded-full animate-glow-pulse"></div>
          </div>
          <p className="mt-6 text-muted-foreground text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-gradient-celebration bg-[length:400%_400%] animate-rainbow-shift relative overflow-hidden">
      {/* Floating celebration elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-party-pink rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-party-orange rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-1/4 w-5 h-5 bg-party-purple rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-20 w-4 h-4 bg-party-blue rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-60 left-16 w-3 h-3 bg-party-green rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-32 right-1/4 w-2 h-2 bg-party-yellow rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
      </div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Enhanced Radiant Header */}
        <div className="mb-12 flex justify-between items-start">
          <div className="animate-slide-up">
            <h1 className="text-6xl font-bold bg-gradient-confetti bg-clip-text text-transparent mb-4 animate-confetti-spin relative">
              ✨ Event Management System ✨
            </h1>
            <div className="flex items-center gap-4 animate-celebration-bounce">
              <p className="text-foreground text-xl font-medium bg-gradient-glass backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                🎉 Welcome back, {user.email}! 🎉
              </p>
              {role && (
                <Badge 
                  variant={isWorker ? "default" : "secondary"} 
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-500 animate-party-pulse ${
                    isWorker 
                      ? 'bg-gradient-primary text-white shadow-confetti hover:scale-110' 
                      : 'bg-gradient-secondary text-white shadow-party hover:scale-110'
                  }`}
                >
                  <UserCheck className="h-5 w-5 animate-celebration-bounce" />
                  {role === 'worker' ? '🎊 Worker 🎊' : '🎈 User 🎈'}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="flex items-center gap-2 bg-gradient-glass backdrop-blur-sm border-primary/30 text-foreground hover:bg-gradient-primary hover:text-white hover:shadow-confetti transition-all duration-500 hover:scale-110 hover:rotate-3"
          >
            <LogOut className="h-5 w-5 animate-celebration-bounce" />
            Sign Out
          </Button>
        </div>

        {/* Radiant Celebration Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-gradient-primary text-white shadow-confetti hover:shadow-party transition-all duration-700 hover:scale-110 hover:rotate-3 animate-slide-up border-0 overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-confetti opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-confetti-spin" />
            <div className="absolute top-2 right-2 text-2xl animate-celebration-bounce">🎊</div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold tracking-wide">🎯 Total Clients</CardTitle>
              <Users className="h-6 w-6 group-hover:animate-confetti-spin transition-transform duration-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold animate-party-pulse">{stats.totalClients}</div>
              <p className="text-xs opacity-80 mt-1">Happy customers! 🎉</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary text-white shadow-confetti hover:shadow-party transition-all duration-700 hover:scale-110 hover:rotate-3 animate-slide-up border-0 overflow-hidden group relative" style={{ animationDelay: '0.15s' }}>
            <div className="absolute inset-0 bg-gradient-rainbow opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-rainbow-shift" />
            <div className="absolute top-2 right-2 text-2xl animate-celebration-bounce" style={{ animationDelay: '0.5s' }}>🗓️</div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold tracking-wide">🎪 Upcoming Events</CardTitle>
              <Calendar className="h-6 w-6 group-hover:animate-celebration-bounce transition-transform duration-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold animate-party-pulse">{stats.upcomingEvents}</div>
              <p className="text-xs opacity-80 mt-1">Exciting times ahead! ✨</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-accent text-white shadow-confetti hover:shadow-party transition-all duration-700 hover:scale-110 hover:rotate-3 animate-slide-up border-0 overflow-hidden group relative" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-celebration opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-confetti-spin" />
            <div className="absolute top-2 right-2 text-2xl animate-float">🤝</div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold tracking-wide">🌟 Active Vendors</CardTitle>
              <User className="h-6 w-6 group-hover:animate-float transition-transform duration-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold animate-party-pulse">{stats.activeVendors}</div>
              <p className="text-xs opacity-80 mt-1">Amazing partners! 🚀</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-warning text-white shadow-confetti hover:shadow-party transition-all duration-700 hover:scale-110 hover:rotate-3 animate-slide-up border-0 overflow-hidden group relative" style={{ animationDelay: '0.45s' }}>
            <div className="absolute inset-0 bg-gradient-confetti opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-rainbow-shift" />
            <div className="absolute top-2 right-2 text-2xl animate-celebration-bounce" style={{ animationDelay: '1s' }}>💰</div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold tracking-wide">💎 Total Budget</CardTitle>
              <DollarSign className="h-6 w-6 group-hover:animate-celebration-bounce transition-transform duration-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold animate-party-pulse">${stats.totalBudget.toLocaleString()}</div>
              <p className="text-xs opacity-80 mt-1">Making dreams real! 🌈</p>
            </CardContent>
          </Card>
        </div>

        {/* Radiant Main Content with Celebration Theme */}
        <Card className="shadow-confetti hover:shadow-party transition-all duration-700 border-0 bg-gradient-glass backdrop-blur-lg animate-scale-in overflow-hidden relative hover:scale-105">
          <div className="absolute inset-0 bg-gradient-rainbow opacity-5 animate-rainbow-shift"></div>
          <CardHeader className="bg-gradient-celebration bg-[length:400%_400%] animate-rainbow-shift border-b border-primary/20 relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 bg-party-pink rounded-full animate-celebration-bounce"></div>
              <div className="w-3 h-3 bg-party-orange rounded-full animate-celebration-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-party-purple rounded-full animate-celebration-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <CardTitle className="flex items-center gap-4 text-3xl font-bold text-white relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-confetti text-white shadow-party animate-confetti-spin">
                <BarChart3 className="h-8 w-8" />
              </div>
              <span className="bg-gradient-glass backdrop-blur-sm px-4 py-2 rounded-full">
                🎉 Event Management Dashboard 🎊
              </span>
            </CardTitle>
            <CardDescription className="text-lg text-white/90 font-medium bg-gradient-glass backdrop-blur-sm px-4 py-2 rounded-full inline-block mt-2">
              ✨ Manage clients, events, vendors, and budgets with style! 🌟
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 relative z-10">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-gradient-glass backdrop-blur-lg p-2 rounded-2xl border border-primary/30 shadow-party">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-confetti data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-bold text-sm hover:bg-gradient-accent/20"
                >
                  🏠 Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="clients"
                  className="data-[state=active]:bg-gradient-secondary data-[state=active]:text-white data-[state=active]:shadow-confetti data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-bold text-sm hover:bg-gradient-accent/20"
                >
                  👥 Clients
                </TabsTrigger>
                <TabsTrigger 
                  value="events"
                  className="data-[state=active]:bg-gradient-accent data-[state=active]:text-white data-[state=active]:shadow-confetti data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-bold text-sm hover:bg-gradient-accent/20"
                >
                  🎪 Events
                </TabsTrigger>
                <TabsTrigger 
                  value="vendors"
                  className="data-[state=active]:bg-gradient-success data-[state=active]:text-white data-[state=active]:shadow-confetti data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-bold text-sm hover:bg-gradient-accent/20"
                >
                  🤝 Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="budget"
                  className="data-[state=active]:bg-gradient-warning data-[state=active]:text-white data-[state=active]:shadow-confetti data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-bold text-sm hover:bg-gradient-accent/20"
                >
                  💰 Budget
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="data-[state=active]:bg-gradient-celebration data-[state=active]:text-white data-[state=active]:shadow-confetti data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-bold text-sm hover:bg-gradient-accent/20"
                >
                  📊 Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-8 animate-fade-in">
                <ReportingDashboard />
              </TabsContent>

              <TabsContent value="clients" className="mt-8 animate-fade-in">
                <ClientManagement />
              </TabsContent>

              <TabsContent value="events" className="mt-8 animate-fade-in">
                <EventScheduling />
              </TabsContent>

              <TabsContent value="vendors" className="mt-8 animate-fade-in">
                <VendorManagement />
              </TabsContent>

              <TabsContent value="budget" className="mt-8 animate-fade-in">
                <BudgetModule />
              </TabsContent>

              <TabsContent value="reports" className="mt-8 animate-fade-in">
                <ReportingDashboard />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
