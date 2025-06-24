
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

interface Budget {
  id: string;
  eventId: string;
  eventName: string;
  totalBudget: number;
  expenses: Expense[];
  createdAt: string;
}

interface Expense {
  id: string;
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
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [budgetFormData, setBudgetFormData] = useState({
    eventId: '',
    totalBudget: ''
  });
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadBudgets();
    loadEvents();
  }, []);

  const loadBudgets = () => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  };

  const loadEvents = () => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  };

  const saveBudgets = (updatedBudgets: Budget[]) => {
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    setBudgets(updatedBudgets);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedEvent = events.find(event => event.id === budgetFormData.eventId);
    const totalBudget = parseFloat(budgetFormData.totalBudget);
    
    if (editingBudget) {
      const updatedBudgets = budgets.map(budget =>
        budget.id === editingBudget.id
          ? { 
              ...budget, 
              eventId: budgetFormData.eventId,
              eventName: selectedEvent?.name || '',
              totalBudget
            }
          : budget
      );
      saveBudgets(updatedBudgets);
      toast({
        title: "Budget Updated",
        description: "Budget has been updated successfully."
      });
    } else {
      const existingBudget = budgets.find(b => b.eventId === budgetFormData.eventId);
      if (existingBudget) {
        toast({
          title: "Budget Exists",
          description: "A budget already exists for this event.",
          variant: "destructive"
        });
        return;
      }

      const newBudget: Budget = {
        id: Date.now().toString(),
        eventId: budgetFormData.eventId,
        eventName: selectedEvent?.name || '',
        totalBudget,
        expenses: [],
        createdAt: new Date().toISOString()
      };
      saveBudgets([...budgets, newBudget]);
      toast({
        title: "Budget Created",
        description: "New budget has been created successfully."
      });
    }

    resetBudgetForm();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(expenseFormData.amount);
    const newExpense: Expense = {
      id: Date.now().toString(),
      category: expenseFormData.category,
      description: expenseFormData.description,
      amount,
      date: expenseFormData.date
    };

    const updatedBudgets = budgets.map(budget =>
      budget.id === selectedBudgetId
        ? { ...budget, expenses: [...budget.expenses, newExpense] }
        : budget
    );

    saveBudgets(updatedBudgets);
    
    const budget = budgets.find(b => b.id === selectedBudgetId);
    const totalExpenses = budget ? budget.expenses.reduce((sum, exp) => sum + exp.amount, 0) + amount : amount;
    
    if (budget && totalExpenses > budget.totalBudget) {
      toast({
        title: "Budget Exceeded!",
        description: `This expense will exceed the budget by $${(totalExpenses - budget.totalBudget).toFixed(2)}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Expense Added",
        description: "New expense has been recorded successfully."
      });
    }

    resetExpenseForm();
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      eventId: '',
      totalBudget: ''
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
      eventId: budget.eventId,
      totalBudget: budget.totalBudget.toString()
    });
    setEditingBudget(budget);
    setIsBudgetDialogOpen(true);
  };

  const handleDeleteBudget = (id: string) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== id);
    saveBudgets(updatedBudgets);
    toast({
      title: "Budget Deleted",
      description: "Budget has been removed successfully."
    });
  };

  const handleDeleteExpense = (budgetId: string, expenseId: string) => {
    const updatedBudgets = budgets.map(budget =>
      budget.id === budgetId
        ? { ...budget, expenses: budget.expenses.filter(exp => exp.id !== expenseId) }
        : budget
    );
    saveBudgets(updatedBudgets);
    toast({
      title: "Expense Deleted",
      description: "Expense has been removed successfully."
    });
  };

  const calculateTotalExpenses = (expenses: Expense[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateBudgetProgress = (totalBudget: number, totalExpenses: number) => {
    return Math.min((totalExpenses / totalBudget) * 100, 100);
  };

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
                      value={budgetFormData.eventId}
                      onValueChange={(value) => setBudgetFormData({...budgetFormData, eventId: value})}
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
                      value={budgetFormData.totalBudget}
                      onChange={(e) => setBudgetFormData({...budgetFormData, totalBudget: e.target.value})}
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
          const totalExpenses = calculateTotalExpenses(budget.expenses);
          const progress = calculateBudgetProgress(budget.totalBudget, totalExpenses);
          const isOverBudget = totalExpenses > budget.totalBudget;

          return (
            <Card key={budget.id} className={isOverBudget ? 'border-red-200 bg-red-50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {budget.eventName}
                      {isOverBudget && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </CardTitle>
                    <CardDescription>
                      Budget: ${budget.totalBudget.toLocaleString()} | 
                      Spent: ${totalExpenses.toLocaleString()} | 
                      Remaining: ${(budget.totalBudget - totalExpenses).toLocaleString()}
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
                            Record a new expense for {budget.eventName}
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
                {budget.expenses.length > 0 ? (
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
                      {budget.expenses.map((expense) => (
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
                              onClick={() => handleDeleteExpense(budget.id, expense.id)}
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
