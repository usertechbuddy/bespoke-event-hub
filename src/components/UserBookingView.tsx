import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, DollarSign, PiggyBank, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EventScheduling from './EventScheduling';

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  description?: string;
}

interface Budget {
  id: string;
  event_id: string;
  total_budget: number;
  created_at: string;
}

interface Expense {
  id: string;
  budget_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

const UserBookingView = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true });

      // Load budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id);

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id);

      if (eventsError) console.error('Error loading events:', eventsError);
      if (budgetsError) console.error('Error loading budgets:', budgetsError);
      if (expensesError) console.error('Error loading expenses:', expensesError);

      setEvents(eventsData || []);
      setBudgets(budgetsData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!selectedEventId || !budgetAmount || !user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          event_id: selectedEventId,
          total_budget: parseFloat(budgetAmount)
        });

      if (error) {
        console.error('Error creating budget:', error);
        toast({
          title: "Error",
          description: "Failed to create budget. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Budget created successfully!",
        });
        setBudgetAmount('');
        setSelectedEventId('');
        setBudgetDialogOpen(false);
        loadUserData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getBudgetForEvent = (eventId: string) => {
    return budgets.find(budget => budget.event_id === eventId);
  };

  const getExpensesForBudget = (budgetId: string) => {
    return expenses.filter(expense => expense.budget_id === budgetId);
  };

  const calculateTotalExpenses = (budgetId: string) => {
    const budgetExpenses = getExpensesForBudget(budgetId);
    return budgetExpenses.reduce((total, expense) => total + parseFloat(expense.amount.toString()), 0);
  };

  const calculateBudgetProgress = (totalBudget: number, totalExpenses: number) => {
    return totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-success-foreground bg-success/10 border-success/20';
      case 'pending':
        return 'text-warning-foreground bg-warning/10 border-warning/20';
      case 'cancelled':
        return 'text-destructive-foreground bg-destructive/10 border-destructive/20';
      default:
        return 'text-primary-foreground bg-primary/10 border-primary/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary animate-glow-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-elegant border-0 bg-gradient-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-0 bg-gradient-accent text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Active Budgets</p>
                <p className="text-3xl font-bold">{budgets.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <PiggyBank className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-0 bg-gradient-success text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Budget</p>
                <p className="text-3xl font-bold">
                  ${budgets.reduce((total, budget) => total + parseFloat(budget.total_budget.toString()), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="book-event" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm p-1 rounded-xl border border-border/50">
          <TabsTrigger 
            value="book-event" 
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Book New Event
          </TabsTrigger>
          <TabsTrigger 
            value="my-events"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 rounded-lg font-medium"
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book-event" className="mt-8 animate-fade-in">
          <Card className="shadow-floating border-0 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 rounded-xl bg-gradient-primary text-white shadow-glow">
                  <Sparkles className="h-6 w-6" />
                </div>
                Create Your Dream Event
              </CardTitle>
              <CardDescription className="text-lg">
                Let us help you plan the perfect occasion with our expert event management services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EventScheduling />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-events" className="mt-8 animate-fade-in">
          <div className="space-y-6">
            {events.length === 0 ? (
              <Card className="shadow-floating border-0 bg-gradient-card backdrop-blur-sm">
                <CardContent className="py-16">
                  <div className="text-center text-muted-foreground">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No events scheduled yet</h3>
                    <p className="text-muted-foreground">Book your first event to get started!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {events.map((event) => {
                  const budget = getBudgetForEvent(event.id);
                  const totalExpenses = budget ? calculateTotalExpenses(budget.id) : 0;
                  const progress = budget ? calculateBudgetProgress(parseFloat(budget.total_budget.toString()), totalExpenses) : 0;

                  return (
                    <Card key={event.id} className="shadow-elegant border-0 bg-gradient-card backdrop-blur-sm hover:shadow-floating transition-all duration-300 animate-scale-in">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-foreground">{event.name}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)} backdrop-blur-sm`}>
                                {event.status}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-accent/10">
                                  <Clock className="h-4 w-4 text-accent" />
                                </div>
                                <span className="font-medium">{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-success/10">
                                  <MapPin className="h-4 w-4 text-success" />
                                </div>
                                <span className="font-medium">{event.venue}</span>
                              </div>
                            </div>

                            {event.description && (
                              <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Budget Section */}
                        <div className="border-t border-border/50 pt-6">
                          {budget ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-lg bg-gradient-accent text-white">
                                    <DollarSign className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Event Budget</h4>
                                    <p className="text-sm text-muted-foreground">
                                      ${totalExpenses.toLocaleString()} of ${parseFloat(budget.total_budget.toString()).toLocaleString()} spent
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    ${(parseFloat(budget.total_budget.toString()) - totalExpenses).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">remaining</div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span className={progress > 90 ? 'text-destructive font-semibold' : progress > 75 ? 'text-warning' : 'text-success'}>
                                    {progress.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      progress > 90 ? 'bg-gradient-to-r from-destructive to-destructive/80' :
                                      progress > 75 ? 'bg-gradient-to-r from-warning to-warning/80' :
                                      'bg-gradient-to-r from-success to-success/80'
                                    }`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    onClick={() => setSelectedEventId(event.id)}
                                    className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-glow hover:shadow-floating transition-all duration-300"
                                  >
                                    <PiggyBank className="h-4 w-4 mr-2" />
                                    Set Budget for This Event
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gradient-card border-0 shadow-floating">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <PiggyBank className="h-5 w-5 text-primary" />
                                      Set Event Budget
                                    </DialogTitle>
                                    <DialogDescription>
                                      Set a budget for "{event.name}" to track your expenses
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="budget-amount">Budget Amount ($)</Label>
                                      <Input
                                        id="budget-amount"
                                        type="number"
                                        placeholder="Enter budget amount"
                                        value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                        className="border-border/50 focus:border-primary transition-colors"
                                      />
                                    </div>
                                    <div className="flex gap-3">
                                      <Button 
                                        onClick={handleCreateBudget}
                                        disabled={!budgetAmount}
                                        className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-glow"
                                      >
                                        Create Budget
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setBudgetDialogOpen(false)}
                                        className="border-border/50"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserBookingView;