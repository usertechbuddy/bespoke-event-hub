
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  clientId: string;
  clientName: string;
  vendorIds: string[];
  description: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

const EventScheduling = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    clientId: '',
    vendorIds: [] as string[],
    description: '',
    status: 'planned' as Event['status']
  });

  useEffect(() => {
    loadEvents();
    loadClients();
    loadVendors();
  }, []);

  const loadEvents = () => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  };

  const loadClients = () => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  };

  const loadVendors = () => {
    const savedVendors = localStorage.getItem('vendors');
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors));
    }
  };

  const saveEvents = (updatedEvents: Event[]) => {
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const checkVenueConflict = (date: string, time: string, venue: string, excludeId?: string) => {
    return events.some(event => 
      event.id !== excludeId &&
      event.date === date &&
      event.time === time &&
      event.venue.toLowerCase() === venue.toLowerCase() &&
      event.status !== 'cancelled'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkVenueConflict(formData.date, formData.time, formData.venue, editingEvent?.id)) {
      toast({
        title: "Venue Conflict",
        description: "This venue is already booked for the selected date and time.",
        variant: "destructive"
      });
      return;
    }

    const selectedClient = clients.find(client => client.id === formData.clientId);
    
    if (editingEvent) {
      const updatedEvents = events.map(event =>
        event.id === editingEvent.id
          ? { 
              ...event, 
              ...formData,
              clientName: selectedClient?.name || ''
            }
          : event
      );
      saveEvents(updatedEvents);
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully."
      });
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        clientName: selectedClient?.name || '',
        createdAt: new Date().toISOString()
      };
      saveEvents([...events, newEvent]);
      toast({
        title: "Event Created",
        description: "New event has been scheduled successfully."
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      venue: '',
      clientId: '',
      vendorIds: [],
      description: '',
      status: 'planned'
    });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      venue: event.venue,
      clientId: event.clientId,
      vendorIds: event.vendorIds,
      description: event.description,
      status: event.status
    });
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    saveEvents(updatedEvents);
    toast({
      title: "Event Deleted",
      description: "Event has been removed successfully."
    });
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Event Scheduling</h2>
          <p className="text-slate-600">Plan and manage your events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Schedule New Event'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update event details' : 'Enter event information below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Event Name</Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    className="col-span-3"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="venue" className="text-right">Venue</Label>
                  <Input
                    id="venue"
                    className="col-span-3"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({...formData, clientId: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value as Event['status']})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Input
                    id="description"
                    className="col-span-3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Update' : 'Schedule'} Event
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events ({events.length})</CardTitle>
          <CardDescription>View and manage all scheduled events</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{event.date}</span>
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{event.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {event.venue}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-slate-400" />
                      {event.clientName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {events.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No events scheduled. Create your first event to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventScheduling;
