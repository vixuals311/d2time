import { useEffect } from 'react';
import { useTimelineStore } from './store';
import { toast } from 'sonner';
import { isBefore, parseISO, differenceInMinutes } from 'date-fns';

export function useReminders() {
  const events = useTimelineStore((state) => state.events);

  useEffect(() => {
    // Request permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      events.forEach((event) => {
        const startTime = parseISO(event.startTime);
        const diff = differenceInMinutes(startTime, now);

        // Notify 5 minutes before
        if (diff === 5) {
          if (Notification.permission === 'granted') {
            new Notification('Upcoming Event', {
              body: `${event.title} starts in 5 minutes at ${event.location || 'scheduled location'}.`,
            });
          }
          toast.info(`Reminder: ${event.title} in 5 minutes`, {
            duration: 10000,
          });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [events]);
}
