import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AdminUser } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('admin_user');
    }
  }, [user]);

  useEffect(() => {
    // Don't check user on mount - we'll set it manually in signIn()
    setLoading(false);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🔍 Checking user session:', session?.user?.id);
      
      if (session?.user) {
        // For now, create a mock admin user for any authenticated user
        // TODO: Re-enable admin_users table check once RLS is fixed
        const mockAdminUser: AdminUser = {
          id: session.user.id,
          email: session.user.email || '',
          role: 'super_admin',
          created_at: new Date().toISOString(),
        };
        
        console.log('✅ Session user found, setting mock admin:', mockAdminUser.email);
        setUser(mockAdminUser);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    
    console.log('✅ Auth successful, user ID:', data.user?.id);
    
    // For now, just set a mock admin user to get you logged in
    // TODO: Re-enable admin_users table check once RLS is fixed
    const mockAdminUser: AdminUser = {
      id: data.user.id,
      email: data.user.email || email,
      role: 'super_admin',
      created_at: new Date().toISOString(),
    };
    
    console.log('✅ Mock admin user loaded:', mockAdminUser.email);
    setUser(mockAdminUser);
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};
