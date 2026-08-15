import { createFileRoute } from '@tanstack/react-router';
import { useTimelineStore } from '../lib/store';
import { format, parseISO, startOfDay, addMinutes } from 'date-fns';
import { Clock, MapPin, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export const Route = createFileRoute('/share/$date')({
  component: SharePage,
});

function SharePage() {
  const { date } = Route.useParams();
  const events = useTimelineStore((state) => 
    state.events.filter(e => startOfDay(parseISO(e.startTime)).toISOString() === date)
  );

  const typeStyles = {
    meeting: 'bg-[#EBF8FF] text-[#3182CE] border-[#BEE3F8]',
    visit: 'bg-[#F0FFF4] text-[#38A169] border-[#C6F6D5]',
    guest: 'bg-[#FAF5FF] text-[#805AD5] border-[#E9D8FD]',
    break: 'bg-[#FFF5F5] text-[#E53E3E] border-[#FED7D7]',
    unavailable: 'bg-[#EDF2F7] text-[#4A5568] border-[#E2E8F0]',
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8 md:p-12 font-sans">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <h1 className="text-3xl font-serif font-medium text-[#1A202C]">Daily Timeline</h1>
          <p className="text-[#718096] text-lg mt-1">{format(parseISO(date), "EEEE, MMMM do, yyyy")}</p>
        </header>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EDF2F7]">
            <p className="text-[#718096]">No events scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-6 relative pl-4">
            <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-[#EDF2F7] -z-10" />
            {events.map((event) => {
              const start = parseISO(event.startTime);
              const end = addMinutes(start, event.durationMinutes);
              return (
                <div key={event.id} className="relative group">
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-[#EDF2F7]">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                          typeStyles[event.type]
                        )}>
                          {event.type}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-[#A0AEC0]">
                          <Clock className="h-3 w-3" />
                          {format(start, "h:mm a")} - {format(end, "h:mm a")}
                        </div>
                      </div>
                      <h3 className="font-semibold text-[#2D3748] text-lg">{event.title}</h3>
                      {(event.location || event.attendees) && (
                        <div className="flex gap-4 mt-3">
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-xs text-[#718096]">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
