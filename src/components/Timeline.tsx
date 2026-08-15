import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  const removeEvent = useTimelineStore((state) => state.removeEvent);
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
    meeting: 'bg-[#EBF8FF] text-[#2B6CB0] border-[#BEE3F8]',
    visit: 'bg-[#F0FFF4] text-[#2F855A] border-[#C6F6D5]',
    guest: 'bg-[#FAF5FF] text-[#6B46C1] border-[#E9D8FD]',
    break: 'bg-[#FFF5F5] text-[#C53030] border-[#FED7D7]',
    unavailable: 'bg-[#EDF2F7] text-[#4A5568] border-[#E2E8F0]',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{ ...style, animationDelay: `${index * 0.1}s` }} 
      className={cn(
        "relative mb-12 group animate-event",
        isEventPast && "opacity-75 grayscale-[0.2]"
      )}
    >
      <div className="flex gap-6 md:gap-8">
        {/* Time Column */}
        <div className="w-16 pt-1 text-right flex-shrink-0">
          <div className={cn(
            "text-xs font-bold tracking-tight",
            isEventPast ? "text-[#A0AEC0]" : "text-[#2D3748]"
          )}>
            {format(startTime, "h:mm")}
          </div>
          <div className="text-[10px] text-[#A0AEC0] font-medium uppercase tracking-tighter">
            {format(startTime, "a")}
          </div>
        </div>

        {/* Event Card */}
        <div className="relative flex-1">
          {/* Connector Dot */}
          <div className={cn(
            "absolute -left-[33px] md:-left-[41px] top-3 h-3 w-3 rounded-full border-2 bg-white z-10 transition-transform group-hover:scale-125",
            isEventPast ? "border-[#CBD5E0]" : "border-[#2D3748] shadow-[0_0_0_4px_rgba(45,55,72,0.1)]"
          )} />

          <div
            className={cn(
              "relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-transparent hover:border-[#E2E8F0] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all",
              isDragging && "opacity-50"
            )}
          >
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab text-[#CBD5E0] hover:text-[#A0AEC0] transition-colors print:hidden"
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1",
                    typeStyles[event.type]
                  )}>
                    <Icon className="h-3 w-3" />
                    {event.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#A0AEC0]">
                  <Clock className="h-3 w-3" />
                  {event.durationMinutes} min
                </div>
              </div>
              
              <h3 className="font-semibold text-[#1A202C] text-lg leading-snug">{event.title}</h3>
              
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

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all print:hidden">
              <button
                onClick={() => {
                  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss'Z'");
                  const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(startTime)}/${fmt(endTime)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
                  window.open(gCalUrl, '_blank');
                }}
                className="p-2 text-[#718096] hover:bg-[#F7FAFC] rounded-lg transition-all"
                title="Add to Google Calendar"
              >
                <Calendar className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsEditOpen(true)}
                className="p-2 text-[#718096] hover:bg-[#F7FAFC] rounded-lg transition-all"
                title="Edit Event"
              >
                <Edit3 className="h-4 w-4" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-[#718096] hover:bg-[#F7FAFC] rounded-lg transition-all">
                    <Share2 className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('event', event.id);
                    navigator.clipboard.writeText(url.toString());
                    toast.success("Event link copied");
                  }}>
                    <Share2 className="mr-2 h-4 w-4" /> Share Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const text = `${event.title}\n${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}\n${event.location || ''}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Event info copied");
                  }}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Info
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => {
                  removeEvent(event.id);
                  toast.info("Event removed");
                }}
                className="p-2 text-[#FC8181] hover:bg-[#FFF5F5] rounded-lg transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Buffer Indicator */}
          <div className="absolute -bottom-8 left-6 right-0 flex items-center gap-3 print:hidden">
            <div className="h-[1px] flex-1 bg-dashed border-t border-dashed border-[#E2E8F0]" />
            <span className="text-[9px] font-bold text-[#CBD5E0] uppercase tracking-[0.2em] whitespace-nowrap">
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
  const { events: allEvents, bufferMinutes, setEvents, workingHours, selectedDate } = useTimelineStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const events = allEvents.filter(e => {
    const eventDate = startOfDay(parseISO(e.startTime)).toISOString();
    return eventDate === selectedDate;
  });

  const isToday = startOfDay(new Date()).toISOString() === selectedDate;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
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
      <div className="flex h-64 flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#E2E8F0] bg-white/50 backdrop-blur-sm">
        <div className="rounded-full bg-[#EDF2F7] p-4 mb-4">
          <Clock className="h-8 w-8 text-[#A0AEC0]" />
        </div>
        <p className="text-[#718096] font-medium">Your timeline is empty</p>
        <p className="text-sm text-[#A0AEC0] mt-1">Start by adding an event above</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="relative pl-0 md:pl-4 pb-12">
          {/* Vertical line - responsive offset */}
          <div className="absolute left-[87px] md:left-[95px] top-4 bottom-4 w-[2px] bg-[#EDF2F7] -z-10" />
          
          {events.map((event, index) => {
            const startTime = new Date(event.startTime);
            const endTime = addMinutes(startTime, event.durationMinutes);
            const isNow = isToday && isPast(startTime) && isFuture(endTime);

            return (
              <div key={event.id} className="relative">
                {isNow && (
                  <div className="absolute left-0 right-0 -top-6 flex items-center gap-3 z-20 print:hidden animate-pulse">
                     <div className="w-16 text-right text-[10px] font-bold text-[#E53E3E] uppercase tracking-tighter">Now</div>
                     <div className="h-2 w-2 rounded-full bg-[#E53E3E]" />
                     <div className="h-[1px] flex-1 bg-[#E53E3E]" />
                  </div>
                )}
                <SortableEventItem event={event} bufferMinutes={bufferMinutes} index={index} />
              </div>
            );
          })}

          {/* Quick Add at the bottom */}
          <div className="flex gap-6 md:gap-8 items-center mt-4 group cursor-pointer print:hidden">
             <div className="w-16 invisible" />
             <div className="relative flex-1">
                <div className="absolute -left-[31px] md:-left-[39px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#EDF2F7] border border-[#CBD5E0]" />
                <div className="h-10 border border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#A0AEC0] hover:text-[#718096] hover:bg-white hover:border-[#CBD5E0] transition-all relative group/inner">
                   <AddEventModal 
                     trigger={
                       <button className="flex items-center justify-center w-full h-full">
                         <Plus className="h-4 w-4 mr-2" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Add Event</span>
                       </button>
                     } 
                   />
                </div>
             </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
