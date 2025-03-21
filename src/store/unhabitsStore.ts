import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Unhabit, UnhabitLog } from '../types';

interface UnhabitsState {
  unhabits: Unhabit[];
  logs: UnhabitLog[];
  loading: boolean;
  error: string | null;
  fetchUnhabits: () => Promise<void>;
  addUnhabit: (unhabit: Omit<Unhabit, 'id' | 'createdAt' | 'archived'>) => Promise<void>;
  addLog: (log: Omit<UnhabitLog, 'id'>) => Promise<void>;
  archiveUnhabit: (id: string) => Promise<void>;
}

export const useUnhabitsStore = create<UnhabitsState>()((set, get) => ({
  unhabits: [],
  logs: [],
  loading: false,
  error: null,

  fetchUnhabits: async () => {
    set({ loading: true, error: null });
    try {
      const { data: unhabits, error: unhabitsError } = await supabase
        .from('unhabits')
        .select('*')
        .order('created_at', { ascending: false });

      if (unhabitsError) throw unhabitsError;

      const { data: logs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('date', { ascending: false });

      if (logsError) throw logsError;

      set({ unhabits, logs, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
    }
  },

  addUnhabit: async (unhabit) => {
    try {
      const { data, error } = await supabase
        .from('unhabits')
        .insert([unhabit])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        unhabits: [data, ...state.unhabits],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },

  addLog: async (log) => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .insert([log])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        logs: [data, ...state.logs],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },

  archiveUnhabit: async (id) => {
    try {
      const { error } = await supabase
        .from('unhabits')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        unhabits: state.unhabits.map((unhabit) =>
          unhabit.id === id ? { ...unhabit, archived: true } : unhabit
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },
}));