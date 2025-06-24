
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, User, DollarSign, BarChart3 } from 'lucide-react';
import ClientManagement from '@/components/ClientManagement';
import EventScheduling from '@/components/EventScheduling';
import VendorManagement from '@/components/VendorManagement';
import BudgetModule from '@/components/BudgetModule';
import ReportingDashboard from '@/components/ReportingDashboard';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingEvents: 0,
    activeVendors: 0,
    totalBudget: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');

    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > now);
    const totalBudget = budgets.reduce((sum, budget) => sum + (budget.totalBudget || 0), 0);

    setStats({
      totalClients: clients.length,
      upcomingEvents: upcomingEvents.length,
      activeVendors: vendors.length,
      totalBudget
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Event Management System</h1>
          <p className="text-slate-600">Streamline your event planning and management</p>
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
