
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, User, DollarSign, TrendingUp, Award, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalClients: number;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalVendors: number;
  totalBudget: number;
  totalExpenses: number;
  topClients: Array<{name: string; eventCount: number}>;
  topVendors: Array<{name: string; category: string}>;
  monthlyExpenses: Array<{month: string; amount: number}>;
  expensesByCategory: Array<{category: string; amount: number}>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

const ReportingDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalVendors: 0,
    totalBudget: 0,
    totalExpenses: 0,
    topClients: [],
    topVendors: [],
    monthlyExpenses: [],
    expensesByCategory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStats();
    }
  }, [user]);

  const calculateStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data from Supabase
      const [clientsData, eventsData, vendorsData, budgetsData, expensesData] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('events').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('expenses').select('*')
      ]);

      const clients = clientsData.data || [];
      const events = eventsData.data || [];
      const vendors = vendorsData.data || [];
      const budgets = budgetsData.data || [];
      const expenses = expensesData.data || [];

      const now = new Date();
      const upcomingEvents = events.filter((event: any) => new Date(event.date) > now);
      const completedEvents = events.filter((event: any) => event.status === 'completed');

      // Calculate client event counts
      const clientEventCounts = clients.map((client: any) => ({
        name: client.name,
        eventCount: events.filter((event: any) => event.client_id === client.id).length
      })).sort((a, b) => b.eventCount - a.eventCount).slice(0, 5);

      // Get top vendors (by availability and recent usage)
      const topVendors = vendors.filter((vendor: any) => vendor.availability === 'available')
        .slice(0, 5)
        .map((vendor: any) => ({
          name: vendor.name,
          category: vendor.service_category
        }));

      // Calculate monthly expenses
      const monthlyExpenseMap = new Map();
      expenses.forEach((expense: any) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (!monthlyExpenseMap.has(monthKey)) {
          monthlyExpenseMap.set(monthKey, { month: monthName, amount: 0 });
        }
        monthlyExpenseMap.get(monthKey).amount += Number(expense.amount);
      });

      const monthlyExpenses = Array.from(monthlyExpenseMap.values())
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      // Calculate expenses by category
      const categoryExpenseMap = new Map();
      expenses.forEach((expense: any) => {
        if (!categoryExpenseMap.has(expense.category)) {
          categoryExpenseMap.set(expense.category, 0);
        }
        categoryExpenseMap.set(expense.category, categoryExpenseMap.get(expense.category) + Number(expense.amount));
      });

      const expensesByCategory = Array.from(categoryExpenseMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      const totalBudget = budgets.reduce((sum: number, budget: any) => sum + Number(budget.total_budget || 0), 0);
      const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0);

      setStats({
        totalClients: clients.length,
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        completedEvents: completedEvents.length,
        totalVendors: vendors.length,
        totalBudget,
        totalExpenses,
        topClients: clientEventCounts,
        topVendors,
        monthlyExpenses,
        expensesByCategory
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Please sign in to view dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-600">Your event management insights at a glance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-blue-100">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-green-100">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <User className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-purple-100">
              Service providers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget vs Spent</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalBudget > 0 ? `${((stats.totalExpenses / stats.totalBudget) * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-orange-100">
              ${stats.totalExpenses.toLocaleString()} spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Expenses
            </CardTitle>
            <CardDescription>Expense trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Expenses by Category
            </CardTitle>
            <CardDescription>Breakdown of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {stats.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 5 Clients
            </CardTitle>
            <CardDescription>Clients with most events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topClients.length > 0 ? (
                stats.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                    <span className="text-sm text-slate-600">{client.eventCount} events</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No client data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Available Vendors
            </CardTitle>
            <CardDescription>Top vendors ready for your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topVendors.length > 0 ? (
                stats.topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                        {vendor.name.charAt(0)}
                      </div>
                      <span className="font-medium">{vendor.name}</span>
                    </div>
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {vendor.category}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No vendor data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Event Status Overview
          </CardTitle>
          <CardDescription>Current status of all your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</div>
              <div className="text-sm text-slate-600">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">{stats.totalBudget > 0 ? `$${stats.totalBudget.toLocaleString()}` : '$0'}</div>
              <div className="text-sm text-slate-600">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${stats.totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Expenses</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingDashboard;
