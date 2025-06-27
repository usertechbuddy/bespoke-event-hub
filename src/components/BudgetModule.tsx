
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Budget {
  id: string;
  event_id: string;
  total_budget: number;
}

interface Event {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  budget_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const expenseCategories = [
  'Venue',
  'Catering',
  'Decoration',
  'Entertainment',
  'Photography',
  'Transportation',
  'Security',
  'Equipment',
  'Marketing',
  'Miscellaneous'
];

const BudgetModule = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [budgetFormData, setBudgetFormData] = useState({
    event_id: '',
    total_budget: ''
  });
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadBudgets(),
        loadEvents(),
        loadExpenses()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast({
        title: "Error",
        description: "Failed to load budgets.",
        variant: "destructive"
      });
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalBudget = parseFloat(budgetFormData.total_budget);
    
    try {
      if (editingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update({
            event_id: budgetFormData.event_id,
            total_budget: totalBudget
          })
          .eq('id', editingBudget.id);

        if (error) throw error;

        toast({
          title: "Budget Updated",
          description: "Budget has been updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([{
            event_id: budgetFormData.event_id,
            total_budget: totalBudget,
            user_id: user?.id
          }]);

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Budget Exists",
              description: "A budget already exists for this event.",
              variant: "destructive"
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Budget Created",
          description: "New budget has been created successfully."
        });
      }

      await loadBudgets();
      resetBudgetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Error",
        description: "Failed to save budget.",
        variant: "destructive"
      });
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(expenseFormData.amount);
    
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          budget_id: selectedBudgetId,
          category: expenseFormData.category,
          description: expenseFormData.description,
          amount,
          date: expenseFormData.date,
          user_id: user?.id
        }]);

      if (error) throw error;

      const budget = budgets.find(b => b.id === selectedBudgetId);
      const budgetExpenses = expenses.filter(e => e.budget_id === selectedBudgetId);
      const totalExpenses = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0) + amount;
      
      if (budget && totalExpenses > budget.total_budget) {
        toast({
          title: "Budget Exceeded!",
          description: `This expense will exceed the budget by $${(totalExpenses - budget.total_budget).toFixed(2)}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Expense Added",
          description: "New expense has been recorded successfully."
        });
      }

      await loadExpenses();
      resetExpenseForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense.",
        variant: "destructive"
      });
    }
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      event_id: '',
      total_budget: ''
    });
    setEditingBudget(null);
    setIsBudgetDialogOpen(false);
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsExpenseDialogOpen(false);
  };

  const handleEditBudget = (budget: Budget) => {
    setBudgetFormData({
      event_id: budget.event_id,
      total_budget: budget.total_budget.toString()
    });
    setEditingBudget(budget);
    setIsBudgetDialogOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Budget Deleted",
        description: "Budget has been removed successfully."
      });

      await loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Expense Deleted",
        description: "Expense has been removed successfully."
      });

      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive"
      });
    }
  };

  const getBudgetExpenses = (budgetId: string) => {
    return expenses.filter(expense => expense.budget_id === budgetId);
  };

  const calculateTotalExpenses = (budgetExpenses: Expense[]) => {
    return budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateBudgetProgress = (totalBudget: number, totalExpenses: number) => {
    return Math.min((totalExpenses / totalBudget) * 100, 100);
  };

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.name || 'Unknown Event';
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Please sign in to manage budgets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Budget & Expense Management</h2>
          <p className="text-slate-600">Track budgets and expenses for your events</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
                <DialogDescription>
                  {editingBudget ? 'Update budget details' : 'Set up a budget for an event'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBudgetSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Event</Label>
                    <Select
                      value={budgetFormData.event_id}
                      onValueChange={(value) => setBudgetFormData({...budgetFormData, event_id: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="totalBudget" className="text-right">Total Budget</Label>
                    <Input
                      id="totalBudget"
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      value={budgetFormData.total_budget}
                      onChange={(e) => setBudgetFormData({...budgetFormData, total_budget: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetBudgetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBudget ? 'Update' : 'Create'} Budget
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {budgets.map((budget) => {
          const budgetExpenses = getBudgetExpenses(budget.id);
          const totalExpenses = calculateTotalExpenses(budgetExpenses);
          const progress = calculateBudgetProgress(budget.total_budget, totalExpenses);
          const isOverBudget = totalExpenses > budget.total_budget;

          return (
            <Card key={budget.id} className={isOverBudget ? 'border-red-200 bg-red-50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getEventName(budget.event_id)}
                      {isOverBudget && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </CardTitle>
                    <CardDescription>
                      Budget: ${budget.total_budget.toLocaleString()} | 
                      Spent: ${totalExpenses.toLocaleString()} | 
                      Remaining: ${(budget.total_budget - totalExpenses).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedBudgetId(budget.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Expense</DialogTitle>
                          <DialogDescription>
                            Record a new expense for {getEventName(budget.event_id)}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleExpenseSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">Category</Label>
                              <Select
                                value={expenseFormData.category}
                                onValueChange={(value) => setExpenseFormData({...expenseFormData, category: value})}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {expenseCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="description" className="text-right">Description</Label>
                              <Input
                                id="description"
                                className="col-span-3"
                                value={expenseFormData.description}
                                onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="amount" className="text-right">Amount</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                value={expenseFormData.amount}
                                onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="date" className="text-right">Date</Label>
                              <Input
                                id="date"
                                type="date"
                                className="col-span-3"
                                value={expenseFormData.date}
                                onChange={(e) => setExpenseFormData({...expenseFormData, date: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={resetExpenseForm}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Expense</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => handleEditBudget(budget)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteBudget(budget.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Progress</span>
                    <span className={isOverBudget ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {budgetExpenses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                              {expense.amount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-slate-500">
                    No expenses recorded yet. Add your first expense to start tracking.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Budgets Created</h3>
            <p className="text-slate-500 mb-4">
              Create your first budget to start tracking expenses for your events.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetModule;
