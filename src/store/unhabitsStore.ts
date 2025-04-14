import { create } from 'zustand';
import { db } from '../db';
import { unhabits, logs, user } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { Unhabit, UnhabitLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { authClient } from '@/lib/auth-client';

interface UnhabitsState {
  unhabits: Unhabit[];
  archivedUnhabits: Unhabit[];
  logs: UnhabitLog[];
  loading: boolean;
  error: string | null;
  fetchUnhabits: () => Promise<void>;
  fetchArchivedUnhabits: () => Promise<void>;
  addUnhabit: (
    unhabit: Omit<
      Unhabit,
      'id' | 'createdAt' | 'updatedAt' | 'archived' | 'userId'
    >,
  ) => Promise<void>;
  addLog: (
    log: Omit<UnhabitLog, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
  ) => Promise<void>;
  updateLog: (log: UnhabitLog) => Promise<void>;
  updateUnhabit: (
    id: string,
    updates: Partial<
      Omit<Unhabit, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'userId'>
    >,
  ) => Promise<void>;
  archiveUnhabit: (id: string) => Promise<void>;
  restoreUnhabit: (id: string) => Promise<void>;
}

export const useUnhabitsStore = create<UnhabitsState>()((set) => ({
  unhabits: [],
  archivedUnhabits: [],
  logs: [],
  loading: false,
  error: null,

  fetchUnhabits: async () => {
    set({ loading: true, error: null });
    try {
      const fetchedUnhabits = await db.query.unhabits.findMany({
        where: eq(unhabits.archived, false),
        orderBy: desc(unhabits.createdAt),
      });

      const fetchedLogs = await db.query.logs.findMany({
        orderBy: desc(logs.date),
      });

      set({
        unhabits: fetchedUnhabits as Unhabit[],
        logs: fetchedLogs as UnhabitLog[],
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  fetchArchivedUnhabits: async () => {
    set({ loading: true, error: null });
    try {
      const fetchedArchivedUnhabits = await db.query.unhabits.findMany({
        where: eq(unhabits.archived, true),
        orderBy: desc(unhabits.createdAt),
      });

      set({
        archivedUnhabits: fetchedArchivedUnhabits as Unhabit[],
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  addUnhabit: async (unhabit) => {
    const { data } = authClient.useSession();

    if (!data) {
      throw new Error('User not found');
    }

    const { user } = data;

    try {
      const now = new Date();
      const [insertedUnhabit] = await db
        .insert(unhabits)
        .values({
          id: uuidv4(),
          ...unhabit,
          archived: false,
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      set((state) => ({
        unhabits: [insertedUnhabit as Unhabit, ...state.unhabits],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  addLog: async (log) => {
    const { data } = authClient.useSession();

    if (!data) {
      throw new Error('User not found');
    }

    try {
      const now = new Date();
      const [insertedLog] = await db
        .insert(logs)
        .values({
          id: uuidv4(),
          ...log,
          userId: user.id.toString(),
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      set((state) => ({
        logs: [insertedLog as UnhabitLog, ...state.logs],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  updateLog: async (log) => {
    try {
      const now = new Date();
      await db
        .update(logs)
        .set({
          count: log.count,
          updatedAt: now,
        })
        .where(eq(logs.id, log.id));

      set((state) => ({
        logs: state.logs.map((l) =>
          l.id === log.id ? { ...l, count: log.count, updatedAt: now } : l,
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  updateUnhabit: async (id, updates) => {
    try {
      const now = new Date();
      await db
        .update(unhabits)
        .set({
          ...updates,
          updatedAt: now,
        })
        .where(eq(unhabits.id, id));

      set((state) => ({
        unhabits: state.unhabits.map((unhabit) =>
          unhabit.id === id
            ? { ...unhabit, ...updates, updatedAt: now }
            : unhabit,
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  archiveUnhabit: async (id) => {
    try {
      const now = new Date();
      await db
        .update(unhabits)
        .set({
          archived: true,
          updatedAt: now,
        })
        .where(eq(unhabits.id, id));

      set((state) => {
        const unhabitToArchive = state.unhabits.find(
          (unhabit) => unhabit.id === id,
        );
        if (!unhabitToArchive) return state;

        return {
          unhabits: state.unhabits.filter((unhabit) => unhabit.id !== id),
          archivedUnhabits: [
            { ...unhabitToArchive, archived: true, updatedAt: now },
            ...state.archivedUnhabits,
          ],
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  restoreUnhabit: async (id) => {
    try {
      const now = new Date();
      await db
        .update(unhabits)
        .set({
          archived: false,
          updatedAt: now,
        })
        .where(eq(unhabits.id, id));

      set((state) => {
        const unhabitToRestore = state.archivedUnhabits.find(
          (unhabit) => unhabit.id === id,
        );
        if (!unhabitToRestore) return state;

        return {
          archivedUnhabits: state.archivedUnhabits.filter(
            (unhabit) => unhabit.id !== id,
          ),
          unhabits: [
            { ...unhabitToRestore, archived: false, updatedAt: now },
            ...state.unhabits,
          ],
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },
}));
