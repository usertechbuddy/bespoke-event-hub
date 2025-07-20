
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Auth from '@/components/Auth';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'user' | 'worker' | null;

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return <Auth onAuthSuccess={handleAuthSuccess} selectedRole={role} />;
};

export default AuthPage;
