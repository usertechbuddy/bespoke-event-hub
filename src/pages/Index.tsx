
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5 animate-fade-in">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-12 flex justify-between items-start">
          <div className="animate-slide-up">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
              Event Management System
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground text-lg">Welcome back, {user.email}!</p>
              {role && (
                <Badge 
                  variant={isWorker ? "default" : "secondary"} 
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium transition-all duration-300 ${
                    isWorker 
                      ? 'bg-gradient-primary text-white shadow-glow' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  {role === 'worker' ? 'Worker' : 'User'}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="flex items-center gap-2 hover:shadow-elegant transition-all duration-300 hover:scale-105"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-gradient-primary text-white shadow-floating hover:shadow-glow transition-all duration-500 hover:scale-105 animate-slide-up border-0 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">Total Clients</CardTitle>
              <Users className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-success text-white shadow-floating hover:shadow-glow transition-all duration-500 hover:scale-105 animate-slide-up border-0 overflow-hidden group" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">Upcoming Events</CardTitle>
              <Calendar className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-accent text-white shadow-floating hover:shadow-glow transition-all duration-500 hover:scale-105 animate-slide-up border-0 overflow-hidden group" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">Active Vendors</CardTitle>
              <User className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{stats.activeVendors}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-warning text-white shadow-floating hover:shadow-glow transition-all duration-500 hover:scale-105 animate-slide-up border-0 overflow-hidden group" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">Total Budget</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <Card className="shadow-floating hover:shadow-elegant transition-all duration-500 border-0 bg-gradient-card backdrop-blur-sm animate-scale-in overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-card to-muted/50 border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-lg bg-gradient-primary text-white shadow-glow">
                <BarChart3 className="h-6 w-6" />
              </div>
              Event Management Dashboard
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Manage clients, events, vendors, and budgets all in one place
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-muted/50 backdrop-blur-sm p-1 rounded-xl border border-border/50">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="clients"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
                >
                  Clients
                </TabsTrigger>
                <TabsTrigger 
                  value="events"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
                >
                  Events
                </TabsTrigger>
                <TabsTrigger 
                  value="vendors"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
                >
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="budget"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
                >
                  Budget
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
                >
                  Reports
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
