
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

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
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
      navigate('/auth');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Sign Out and Role */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Event Management System</h1>
            <div className="flex items-center gap-4">
              <p className="text-slate-600">Welcome back, {user.email}!</p>
              {role && (
                <div className="flex items-center gap-2">
                  <Badge variant={isWorker ? "default" : "secondary"} className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {role === 'worker' ? 'Worker' : 'User'}
                  </Badge>
                  {/* Toggle role button for demo purposes */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateRole(isWorker ? 'user' : 'worker')}
                    className="text-xs"
                  >
                    Switch to {isWorker ? 'User' : 'Worker'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <User className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVendors}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Event Management Dashboard
            </CardTitle>
            <CardDescription>
              Manage clients, events, vendors, and budgets all in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <ReportingDashboard />
              </TabsContent>

              <TabsContent value="clients" className="mt-6">
                <ClientManagement />
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <EventScheduling />
              </TabsContent>

              <TabsContent value="vendors" className="mt-6">
                <VendorManagement />
              </TabsContent>

              <TabsContent value="budget" className="mt-6">
                <BudgetModule />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
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
