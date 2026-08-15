import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EventType = 'visit' | 'meeting' | 'guest' | 'break';

export interface TimelineEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  durationMinutes: number;
  type: EventType;
  description?: string;
  location?: string;
  attendees?: string[];
  sharedWith?: string[];
}

interface TimelineState {
  events: TimelineEvent[];
  bufferMinutes: number;
  addEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  removeEvent: (id: string) => void;
  setBufferMinutes: (minutes: number) => void;
  setEvents: (events: TimelineEvent[]) => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set) => ({
      events: [],
      bufferMinutes: 15,
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: crypto.randomUUID() }].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          ),
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      setBufferMinutes: (minutes) => set({ bufferMinutes: minutes }),
      setEvents: (events) => set({ events }),
    }),
    {
      name: 'timeline-storage',
    }
  )
);
