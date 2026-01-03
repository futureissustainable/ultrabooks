import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile, Database } from '@/lib/supabase/types';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  hasInitialized: boolean; // Track if we've attempted initialization
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
  hasInitialized: false,
  error: null,

  initialize: async () => {
    // Prevent duplicate initialization
    if (get().hasInitialized) return;

    // Mark as initialized IMMEDIATELY - prevents infinite loading
    set({ hasInitialized: true });

    try {
      const supabase = createClient();
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
    } catch {
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
      // Create profile - using type assertion due to @supabase/ssr type inference limitation
      const profileData: ProfileInsert = {
        id: data.user.id,
        email: data.user.email!,
      };
      await (supabase.from('profiles') as unknown as { insert: (data: ProfileInsert) => Promise<unknown> }).insert(profileData);

      // Create default settings
      const settingsData: UserSettingsInsert = {
        user_id: data.user.id,
      };
      await (supabase.from('user_settings') as unknown as { insert: (data: UserSettingsInsert) => Promise<unknown> }).insert(settingsData);
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

    // Using type assertion due to @supabase/ssr type inference limitation
    const updateData: ProfileUpdate = { ...data, updated_at: new Date().toISOString() };
    const updateFn = supabase.from('profiles').update as unknown as (data: ProfileUpdate) => { eq: (field: string, value: string) => Promise<{ error: unknown }> };
    const { error } = await updateFn(updateData).eq('id', user.id);

    if (!error) {
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
      }));
    }
  },
}));
