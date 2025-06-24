
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Mail, Phone, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  };

  const saveClients = (updatedClients: Client[]) => {
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.length >= 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number (minimum 10 digits).",
        variant: "destructive"
      });
      return;
    }

    if (editingClient) {
      const updatedClients = clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...formData }
          : client
      );
      saveClients(updatedClients);
      toast({
        title: "Client Updated",
        description: "Client information has been updated successfully."
      });
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveClients([...clients, newClient]);
      toast({
        title: "Client Added",
        description: "New client has been added successfully."
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: ''
    });
    setEditingClient(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address
    });
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id);
    saveClients(updatedClients);
    toast({
      title: "Client Deleted",
      description: "Client has been removed successfully."
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Client Management</h2>
          <p className="text-slate-600">Manage your client database</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'Update client information' : 'Enter client details below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">Company</Label>
                  <Input
                    id="company"
                    className="col-span-3"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Address</Label>
                  <Input
                    id="address"
                    className="col-span-3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClient ? 'Update' : 'Add'} Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clients ({filteredClients.length})</CardTitle>
              <CardDescription>View and manage all your clients</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-400" />
                      {client.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-slate-400" />
                      {client.company || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No clients found. Add your first client to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientManagement;
