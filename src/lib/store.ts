import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutes, isBefore, isAfter, parseISO, startOfDay } from 'date-fns';

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
  selectedDate: string; // ISO date string (start of day)
  bufferMinutes: number;
  workingHours: WorkingHours;
  durationOptions: number[];
  addEvent: (event: Omit<TimelineEvent, 'id'>) => boolean;
  updateEvent: (id: string, updates: Partial<TimelineEvent>, forceShift?: boolean) => boolean;
  removeEvent: (id: string) => void;
  setBufferMinutes: (minutes: number) => void;
  setEvents: (events: TimelineEvent[]) => void;
  setWorkingHours: (hours: WorkingHours) => void;
  setDurationOptions: (options: number[]) => void;
  setSelectedDate: (date: Date) => void;

}


export const useTimelineStore = create<TimelineState>()(
  persist(
    (set) => ({
      events: [],
      selectedDate: startOfDay(new Date()).toISOString(),
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
      updateEvent: (id, updates, forceShift = false) => {
        let success = true;
        set((state) => {
          const existing = state.events.find((e) => e.id === id);
          if (!existing) return state;
          const updated = { ...existing, ...updates };

          const otherEvents = state.events.filter((e) => e.id !== id);
          
          const hasClash = otherEvents.some((e) => {
            const eStart = parseISO(e.startTime);
            const eEnd = addMinutes(eStart, e.durationMinutes + state.bufferMinutes);
            const updatedStart = parseISO(updated.startTime);
            const updatedEnd = addMinutes(updatedStart, updated.durationMinutes + state.bufferMinutes);
            return isBefore(updatedStart, eEnd) && isAfter(updatedEnd, eStart);
          });

          if (hasClash && !forceShift) {
            success = false;
            return state;
          }

          if (hasClash && forceShift) {
            // Logic to shift subsequent events
            const sorted = [...state.events.map(e => e.id === id ? updated : e)].sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
            
            const index = sorted.findIndex(e => e.id === id);
            let currentTime = addMinutes(parseISO(updated.startTime), updated.durationMinutes + state.bufferMinutes);
            
            for (let i = index + 1; i < sorted.length; i++) {
              const currentEvent = sorted[i];
              if (!currentEvent) continue;
              
              const eventStart = parseISO(currentEvent.startTime);
              
              if (isBefore(eventStart, currentTime)) {
                sorted[i] = {
                  ...currentEvent,
                  startTime: currentTime.toISOString()
                } as TimelineEvent;
                currentTime = addMinutes(currentTime, currentEvent.durationMinutes + state.bufferMinutes);
              } else {
                break;
              }
            }

            return { events: sorted };
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
      setSelectedDate: (date) => set({ selectedDate: startOfDay(date).toISOString() }),

    }),
    {
      name: 'timeline-storage',
    }
  )
);
