
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseBooks';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email: "votre-email@example.com",  // Remplacez par votre email
      password: "votre-mot-de-passe"     // Remplacez par votre mot de passe
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, signIn, signOut };
}
