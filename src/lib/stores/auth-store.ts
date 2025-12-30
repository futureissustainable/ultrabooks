import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/supabase/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    const supabase = createClient();

    try {
      // Get initial session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        set({ user, profile, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({ user: session.user, profile });
        } else {
          set({ user: null, profile: null });
        }
      });
    } catch (err) {
      console.error('Auth initialization failed:', err);
      set({ isLoading: false, error: 'Failed to initialize auth' });
    }
  },

  signUp: async (email: string, password: string) => {
    const supabase = createClient();
    set({ isLoading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    if (data.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email!,
      });

      // Create default settings
      await supabase.from('user_settings').insert({
        user_id: data.user.id,
      });
    }

    set({ isLoading: false });
    return { error: null };
  },

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    set({ isLoading: true, error: null });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false, error: error.message });
      return { error: error.message };
    }

    set({ isLoading: false });
    return { error: null };
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (data: Partial<Profile>) => {
    const supabase = createClient();
    const { user } = get();

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
      }));
    }
  },
}));
