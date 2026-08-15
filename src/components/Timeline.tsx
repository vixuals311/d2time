import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, addMinutes, parseISO, parse, startOfDay, isPast, isFuture, isSameMinute } from 'date-fns';
import { GripVertical, Clock, MapPin, Users, Trash2, Share2, Copy, Calendar, Edit3, Briefcase, Coffee, User, Map, AlertCircle, Plus } from 'lucide-react';
import { useTimelineStore, TimelineEvent } from '../lib/store';
import { EditEventModal } from './EditEventModal';
import { AddEventModal } from './AddEventModal';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface SortableEventItemProps {
  event: TimelineEvent;
  bufferMinutes: number;
  index: number;
}

function SortableEventItem({ event, bufferMinutes, index }: SortableEventItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });
  const { removeEvent, profile } = useTimelineStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const startTime = new Date(event.startTime);
  const endTime = addMinutes(startTime, event.durationMinutes);
  const isEventPast = isPast(endTime) && !isSameMinute(new Date(), endTime);

  const typeIcons = {
    meeting: Briefcase,
    visit: Map,
    guest: User,
    break: Coffee,
    unavailable: AlertCircle,
  };
  const Icon = typeIcons[event.type] || Clock;

  const typeStyles = {
    meeting: 'bg-[#F0F7FF] text-[#4A90E2] border-[#D1E9FF]',
    visit: 'bg-[#F2FAF5] text-[#48BB78] border-[#C6F6D5]',
    guest: 'bg-[#FAF5FF] text-[#9F7AEA] border-[#E9D8FD]',
    break: 'bg-[#FFF5F5] text-[#F56565] border-[#FED7D7]',
    unavailable: 'bg-[#F7FAFC] text-[#718096] border-[#E2E8F0]',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{ ...style, animationDelay: `${index * 0.1}s` }} 
      className={cn(
        "relative mb-8 md:mb-12 group animate-event transition-all duration-300",
        isDragging && "opacity-0 scale-95",
        isEventPast && !isDragging && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex gap-4 md:gap-8">
        {/* Time Column */}
        <div className="w-16 md:w-20 pt-1 text-right flex-shrink-0">
          <div className={cn(
            "text-[10px] md:text-xs font-bold tracking-tight",
            isEventPast ? "text-[#A0AEC0]" : "text-[#2D3748]"
          )}>
            {format(startTime, "h:mm")}
          </div>
          <div className="text-[8px] md:text-[10px] text-[#A0AEC0] font-medium uppercase tracking-tighter">
            {format(startTime, "a")}
          </div>
        </div>

        {/* Event Card */}
        <div className="relative flex-1">
          {/* Connector Dot */}
          <div className={cn(
            "absolute -left-[32px] md:-left-[46px] top-5 h-4 w-4 rounded-full border-2 bg-white z-10 transition-transform group-hover:scale-110",
            isEventPast ? "border-[#CBD5E0]" : "border-[#3B82F6] shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
          )} />

          <div
            className={cn(
              "relative flex items-center gap-2 md:gap-5 rounded-[1.5rem] bg-white p-4 md:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-[#E2E8F0] hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.08)] transition-all duration-500",
            )}
          >
            <div className="absolute right-4 top-4 flex flex-col gap-2 print:hidden">
              <button
                onClick={() => {
                  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss'Z'");
                  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(startTime)}/${fmt(endTime)}${event.location ? `&location=${encodeURIComponent(event.location)}` : ''}`;
                  window.open(gCalUrl, '_blank');
                }}
                className="p-1.5 text-[#A0AEC0] hover:text-[#4A5568] transition-colors"
                title="Add to Calendar"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 text-[#A0AEC0] hover:text-[#4A5568] transition-colors"
                title="Edit"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  removeEvent(event.id);
                  toast.info("Event removed");
                }}
                className="p-1.5 text-[#A0AEC0] hover:text-[#F56565] transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 md:mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] border flex items-center gap-1.5 shadow-sm",
                    typeStyles[event.type]
                  )}>
                    <Icon className="h-3 w-3" />
                    {event.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#A0AEC0]">
                  <Clock className="h-3 w-3" />
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                </div>
              </div>
              
              <h3 className="font-semibold text-[#1A202C] text-sm md:text-lg leading-snug truncate md:whitespace-normal">{event.title}</h3>
              
              {(event.location || event.attendees) && (
                <div className="flex flex-wrap gap-4 mt-3">
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-[#718096]">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#718096]">
                      <Users className="h-3 w-3" />
                      {event.attendees.length} people
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drag Handle at the left side */}
            <div 
              {...attributes} 
              {...listeners}
              className="absolute -left-2 top-0 bottom-0 w-4 cursor-grab active:cursor-grabbing print:hidden"
            />

          </div>

          {/* Buffer Indicator */}
          <div className="absolute -bottom-6 md:-bottom-8 left-6 md:left-8 right-0 flex items-center gap-2 md:gap-3 print:hidden">
            <div className="h-[1px] flex-1 bg-dashed border-t border-dashed border-[#E2E8F0]" />
            <span className="text-[8px] md:text-[9px] font-bold text-[#CBD5E0] uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap">
              {bufferMinutes}m buffer
            </span>
            <div className="h-[1px] flex-1 bg-dashed border-t border-dashed border-[#E2E8F0]" />
          </div>
        </div>
      </div>

      <EditEventModal 
        event={event} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </div>
  );
}

export function Timeline() {
  const { events: allEvents, bufferMinutes, setEvents, workingHours, selectedDate, profile } = useTimelineStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const events = allEvents.filter(e => {
    const eventDate = startOfDay(parseISO(e.startTime)).toISOString();
    return eventDate === selectedDate;
  });

  const activeEvent = events.find(e => e.id === activeId);

  const isToday = startOfDay(new Date()).toISOString() === selectedDate;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);
      
      const newEventsOrder = arrayMove(events, oldIndex, newIndex);
      
      const otherDaysEvents = allEvents.filter(e => startOfDay(parseISO(e.startTime)).toISOString() !== selectedDate);
      
      const firstEvent = newEventsOrder[0];
      if (!firstEvent) return;
      let currentTimePointer = new Date(firstEvent.startTime);
      const updatedEventsForDay = newEventsOrder.map((e, idx) => {
        const start = idx === 0 ? currentTimePointer : addMinutes(currentTimePointer, bufferMinutes);
        const updated = { ...e, startTime: start.toISOString() };
        currentTimePointer = addMinutes(start, e.durationMinutes);
        return updated;
      });

      const baseDate = format(new Date(firstEvent.startTime), "yyyy-MM-dd");
      const dayStart = parse(`${baseDate} ${workingHours.start}`, "yyyy-MM-dd HH:mm", new Date());
      const dayEnd = parse(`${baseDate} ${workingHours.end}`, "yyyy-MM-dd HH:mm", new Date());

      const firstStart = new Date(updatedEventsForDay[0]!.startTime);
      const lastEventItem = updatedEventsForDay[updatedEventsForDay.length - 1];
      
      if (lastEventItem) {
        const lastEnd = addMinutes(new Date(lastEventItem.startTime), lastEventItem.durationMinutes);
        if (firstStart < dayStart || lastEnd > dayEnd) {
          toast.error(`Schedule exceeds working hours (${workingHours.start} - ${workingHours.end})!`);
          return;
        }
      }

      setEvents([...otherDaysEvents, ...updatedEventsForDay]);
      toast.success("Schedule reordered");
    }
  }

  // Calculate position for current time indicator (only if today)
  const getTimeIndicator = () => {
    if (!isToday || events.length === 0) return null;
    
    // Simple heuristic: find between which events the current time falls
    // Or just place it relatively if we had a scale. 
    // Since this is a list-based timeline, we'll place it near the current event.
    return null; // For list-based timeline, a floating line is hard without fixed heights
  };

  if (events.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-[#EDF2F7] bg-white/40 backdrop-blur-md shadow-inner">
        <div className="rounded-[2rem] bg-white p-8 mb-6 shadow-xl shadow-gray-100/50 animate-float">
          <Clock className="h-10 w-10 text-[#2D3748]" />
        </div>
        <p className="text-[#1A202C] text-lg font-medium tracking-tight">Timeline is clear</p>
        <p className="text-sm text-[#A0AEC0] mt-2 font-light">No events scheduled for this day</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="relative pl-0 md:pl-4 pb-12 print:hidden">
          {/* Vertical line - premium gradient */}
          <div className="absolute left-[85px] md:left-[100px] top-4 bottom-4 w-[2px] bg-[#EDF2F7] -z-10" />
          
          {events.map((event, index) => {
            const startTime = new Date(event.startTime);
            const endTime = addMinutes(startTime, event.durationMinutes);
            const isNow = isToday && isPast(startTime) && isFuture(endTime);

            return (
              <div key={event.id} className="relative">
                {isNow && (
                  <div className="absolute left-0 right-0 -top-8 flex items-center gap-4 z-20 print:hidden">
                     <div className="w-16 md:w-20 text-right text-[9px] font-bold text-[#E53E3E] uppercase tracking-[0.2em] animate-pulse">Now</div>
                     <div className="h-2 w-2 rounded-full bg-[#E53E3E] shadow-[0_0_10px_rgba(229,62,62,0.5)] animate-pulse" />
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-[#E53E3E] to-transparent opacity-20" />
                  </div>
                )}
                <SortableEventItem event={event} bufferMinutes={bufferMinutes} index={index} />
              </div>
            );
          })}

          {/* Quick Add at the bottom */}
          <div className="flex gap-4 md:gap-8 items-center mt-4 print:hidden">
             <div className="w-16 md:w-20 invisible" />
             <div className="relative flex-1">
                <div className="absolute -left-[29px] md:-left-[43px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#EDF2F7] border border-[#CBD5E0]" />
                <AddEventModal 
                  trigger={
                    <button className="w-full h-14 border-2 border-dashed border-[#EDF2F7] rounded-[1.5rem] flex items-center justify-center text-[#A0AEC0] hover:text-[#2D3748] hover:bg-white hover:border-[#CBD5E0] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer group">
                      <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Schedule Slot</span>
                    </button>
                  } 
                />
             </div>
          </div>
        </div>
      </SortableContext>
      
      {/* Tabular Print View for main Timeline */}
      <div className="hidden print:block w-full bg-white font-sans text-[#1A202C]">
        <div className="mb-8 border-b-2 border-[#1A202C] pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1">Executive Schedule</h1>
              <p className="text-lg text-[#4A5568]">{format(parseISO(selectedDate), "EEEE, MMMM do, yyyy")}</p>
            </div>
            <div className="text-right">
              {profile.name && <h2 className="text-xl font-bold">{profile.name}</h2>}
              {profile.position && <p className="text-sm text-[#718096] uppercase tracking-widest">{profile.position}</p>}
              {profile.company && <p className="text-xs text-[#A0AEC0]">{profile.company}</p>}
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#1A202C]">
              <th className="py-4 text-sm font-bold uppercase tracking-wider w-[15%]">Time</th>
              <th className="px-4 py-4 text-sm font-bold uppercase tracking-wider w-[25%]">Event</th>
              <th className="px-4 py-4 text-sm font-bold uppercase tracking-wider w-[25%]">Location</th>
              <th className="px-4 py-4 text-sm font-bold uppercase tracking-wider w-[35%]">Notes / Details</th>
            </tr>
          </thead>
          <tbody>
              {events.map((event) => {
                const start = parseISO(event.startTime);
                const end = addMinutes(start, event.durationMinutes);
                return (
                  <tr key={event.id} className="border-b border-[#E2E8F0]">
                    <td className="py-5 align-top">
                      <div className="text-sm font-bold whitespace-nowrap">{format(start, "h:mm a")} - {format(end, "h:mm a")}</div>
                    </td>
                  <td className="px-4 py-5 align-top">
                    <div className="text-[9px] font-bold uppercase text-[#718096] mb-1 tracking-widest">{event.type}</div>
                    <div className="text-sm font-bold leading-tight">{event.title}</div>
                  </td>
                  <td className="px-4 py-5 align-top text-sm text-[#4A5568]">
                    {event.location || '-'}
                  </td>
                  <td className="px-4 py-5 align-top">
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="text-[10px] text-[#718096] mb-1 font-medium">Guests: {event.attendees.length}</div>
                    )}
                    {event.description && (
                      <div className="text-xs text-[#4A5568] leading-relaxed">{event.description}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="mt-12 pt-8 border-t border-[#EDF2F7] text-center">
          <p className="text-[10px] text-[#CBD5E0] uppercase tracking-[0.3em]">Generated via Executive Timeline Manager</p>
        </div>
      </div>

      <DragOverlay adjustScale={false} dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.4',
            },
          },
        }),
      }}>
        {activeId && activeEvent ? (
          <div className="flex gap-4 md:gap-8 opacity-90 scale-105 transition-transform duration-200">
            <div className="w-12 md:w-16 pt-1 text-right flex-shrink-0">
              <div className="text-[10px] md:text-xs font-bold text-[#2D3748]">
                {format(new Date(activeEvent.startTime), "h:mm")}
              </div>
              <div className="text-[8px] md:text-[10px] text-[#A0AEC0] font-medium uppercase tracking-tighter">
                {format(new Date(activeEvent.startTime), "a")}
              </div>
            </div>
            <div className="relative flex-1">
              <div className="absolute -left-[27px] md:-left-[41px] top-3 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full border-2 bg-white border-[#2D3748] shadow-[0_0_0_4px_rgba(45,55,72,0.1)]" />
              <div className="flex items-center gap-3 md:gap-4 rounded-xl md:rounded-2xl bg-white p-3 md:p-5 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.12)] border border-[#E2E8F0]">
                <GripVertical className="h-5 w-5 text-[#CBD5E0]" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A202C] text-sm md:text-lg">{activeEvent.title}</h3>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
