import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Building2, UserCheck, Settings } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'user' | 'worker') => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Event Management System
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform designed to streamline event planning and management. 
            Whether you're booking an event or managing multiple events as a professional, 
            our system provides all the tools you need for successful event coordination.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CalendarDays className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Event Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Plan and schedule events with detailed information, dates, and venue management.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Client & Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Manage client relationships and vendor networks with comprehensive contact information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Budget & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Track expenses, manage budgets, and generate comprehensive reports for better insights.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
            Choose Your Role
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-700">I'm a User</CardTitle>
                <CardDescription className="text-lg">
                  Looking to book and manage my own events
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 mb-8 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Book personal or business events
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Manage your event details and timeline
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Track your event budgets and expenses
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Access personalized event dashboard
                  </li>
                </ul>
                <Button 
                  onClick={() => handleRoleSelection('user')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                  size="lg"
                >
                  Continue as User
                </Button>
              </CardContent>
            </Card>

            {/* Worker Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">I'm a Worker</CardTitle>
                <CardDescription className="text-lg">
                  Professional event planner managing multiple events
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-3 mb-8 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    View and manage all client events
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Comprehensive client management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Vendor network management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Advanced reporting and analytics
                  </li>
                </ul>
                <Button 
                  onClick={() => handleRoleSelection('worker')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  Continue as Worker
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-500">
          <p>Streamline your event management process with our comprehensive platform</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;