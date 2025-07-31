import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import ClientManagement from './ClientManagement';
import EventScheduling from './EventScheduling';
import VendorManagement from './VendorManagement';
import BudgetModule from './BudgetModule';
import ReportingDashboard from './ReportingDashboard';

const WorkerDashboard = () => {
  return (
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
  );
};

export default WorkerDashboard;