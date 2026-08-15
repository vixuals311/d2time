import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutes, isBefore, isAfter, parseISO } from 'date-fns';

const checkClash = (newEvent: TimelineEvent, existingEvents: TimelineEvent[]) => {
  const newStart = parseISO(newEvent.startTime);
  const newEnd = addMinutes(newStart, newEvent.durationMinutes);

  return existingEvents.some((e) => {
    const eStart = parseISO(e.startTime);
    const eEnd = addMinutes(eStart, e.durationMinutes);
    
    // Check if new event overlaps with existing event
    // (newStart < eEnd) && (newEnd > eStart)
    return isBefore(newStart, eEnd) && isAfter(newEnd, eStart);
  });
};

export type EventType = 'visit' | 'meeting' | 'guest' | 'break' | 'unavailable';

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

export interface WorkingHours {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

interface TimelineState {
  events: TimelineEvent[];
  bufferMinutes: number;
  workingHours: WorkingHours;
  durationOptions: number[];
  addEvent: (event: Omit<TimelineEvent, 'id'>) => boolean;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => boolean;
  removeEvent: (id: string) => void;
  setBufferMinutes: (minutes: number) => void;
  setEvents: (events: TimelineEvent[]) => void;
  setWorkingHours: (hours: WorkingHours) => void;
  setDurationOptions: (options: number[]) => void;
}


export const useTimelineStore = create<TimelineState>()(
  persist(
    (set) => ({
      events: [],
      bufferMinutes: 15,
      workingHours: { start: '09:00', end: '18:00' },
      durationOptions: [15, 30, 60, 120],

      addEvent: (event) => {
        let success = true;
        set((state) => {
          const newEvent = { ...event, id: crypto.randomUUID() };
          
          // Check for clashes INCLUDING buffer
          const hasClash = state.events.some((e) => {
            const eStart = parseISO(e.startTime);
            const eEnd = addMinutes(eStart, e.durationMinutes + state.bufferMinutes);
            
            const newStart = parseISO(newEvent.startTime);
            const newEnd = addMinutes(newStart, newEvent.durationMinutes + state.bufferMinutes);
            
            return isBefore(newStart, eEnd) && isAfter(newEnd, eStart);
          });

          if (hasClash) {
            success = false;
            return state;
          }
          return {
            events: [...state.events, newEvent].sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
          };
        });
        return success;
      },
      updateEvent: (id, updates) => {
        let success = true;
        set((state) => {
          const existing = state.events.find((e) => e.id === id);
          if (!existing) return state;
          const updated = { ...existing, ...updates };
          const hasClash = checkClash(updated, state.events.filter((e) => e.id !== id));
          if (hasClash) {
            success = false;
            return state;
          }
          return {
            events: state.events.map((e) => (e.id === id ? updated : e)).sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
          };
        });
        return success;
      },
      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      setBufferMinutes: (minutes) => set({ bufferMinutes: minutes }),
      setEvents: (events) => set({ events }),
      setWorkingHours: (hours) => set({ workingHours: hours }),
      setDurationOptions: (options) => set({ durationOptions: options }),

    }),
    {
      name: 'timeline-storage',
    }
  )
);
