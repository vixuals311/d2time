import { createFileRoute } from '@tanstack/react-router';
import { useTimelineStore } from '../lib/store';
import { format, parseISO, startOfDay, addMinutes } from 'date-fns';
import { Clock, MapPin, Users, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export const Route = createFileRoute('/share/$date')({
  component: SharePage,
});

function SharePage() {
  const { date } = Route.useParams();
  const { events: allEvents, profile } = useTimelineStore();
  
  const events = allEvents.filter(e => startOfDay(parseISO(e.startTime)).toISOString() === date);

  const typeStyles = {
    meeting: 'bg-[#EBF8FF] text-[#3182CE] border-[#BEE3F8]',
    visit: 'bg-[#F0FFF4] text-[#38A169] border-[#C6F6D5]',
    guest: 'bg-[#FAF5FF] text-[#805AD5] border-[#E9D8FD]',
    break: 'bg-[#FFF5F5] text-[#E53E3E] border-[#FED7D7]',
    unavailable: 'bg-[#EDF2F7] text-[#4A5568] border-[#E2E8F0]',
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8 md:p-12 font-sans selection:bg-[#EBF8FF]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-[#2D3748] flex items-center justify-center text-white">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#A0AEC0]">Schedule Shared</span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#1A202C] tracking-tight">
            {profile.name ? `${profile.name}'s Schedule` : 'Daily Timeline'}
          </h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[#718096] text-lg">{format(parseISO(date), "EEEE, MMMM do, yyyy")}</p>
            {profile.position && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0]">
                {profile.position} {profile.company ? `@ ${profile.company}` : ''}
              </span>
            )}
          </div>
        </header>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EDF2F7]">
            <p className="text-[#718096]">No events scheduled for this day.</p>
          </div>
        ) : (
            <div className="space-y-6 relative pl-4 pb-12 print:hidden">
            <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-[#EDF2F7] -z-10" />
            {events.map((event) => {
              const start = parseISO(event.startTime);
              const end = addMinutes(start, event.durationMinutes);
              return (
                <div key={event.id} className="relative group">
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-transparent transition-all">
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
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-[#718096]">
                              <Users className="h-3 w-3" />
                              {event.attendees.length} Attendees
                            </div>
                          )}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs text-[#718096] mt-3 line-clamp-2 italic border-l-2 border-[#EDF2F7] pl-3">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabular Print View */}
          <div className="hidden print:block w-full overflow-hidden border border-[#E2E8F0] rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7FAFC] border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#4A5568]">Time</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#4A5568]">Event</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#4A5568]">Location</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#4A5568]">Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const start = parseISO(event.startTime);
                  const end = addMinutes(start, event.durationMinutes);
                  return (
                    <tr key={event.id} className="border-b border-[#E2E8F0] last:border-0">
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        <div className="text-sm font-semibold text-[#2D3748]">{format(start, "h:mm a")}</div>
                        <div className="text-[10px] text-[#A0AEC0]">{event.durationMinutes} min</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                            typeStyles[event.type]
                          )}>
                            {event.type}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-[#1A202C]">{event.title}</div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-[#4A5568]">
                        {event.location || '-'}
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-[#718096]">
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="mb-1">{event.attendees.length} Attendees</div>
                        )}
                        {event.description && (
                          <div className="italic text-[#A0AEC0]">{event.description}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
