import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'user' | 'worker' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else {
          setRole(data.role as UserRole);
        }
      } catch (err) {
        console.error('Error:', err);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const updateRole = async (newRole: 'user' | 'worker') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: newRole
        });

      if (error) {
        console.error('Error updating role:', error);
      } else {
        setRole(newRole);
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const isWorker = role === 'worker';
  const isUser = role === 'user';

  return {
    role,
    loading,
    updateRole,
    isWorker,
    isUser
  };
};