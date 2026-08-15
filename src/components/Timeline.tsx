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
import { format, addMinutes } from 'date-fns';
import { GripVertical, Clock, MapPin, Users, Trash2 } from 'lucide-react';
import { useTimelineStore, TimelineEvent } from '../lib/store';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface SortableEventItemProps {
  event: TimelineEvent;
  bufferMinutes: number;
}

function SortableEventItem({ event, bufferMinutes }: SortableEventItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });
  const removeEvent = useTimelineStore((state) => state.removeEvent);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const startTime = new Date(event.startTime);
  const endTime = addMinutes(startTime, event.durationMinutes);
  const bufferEndTime = addMinutes(endTime, bufferMinutes);

  const typeStyles = {
    meeting: 'bg-[#EBF8FF] text-[#3182CE] border-[#BEE3F8]',
    visit: 'bg-[#F0FFF4] text-[#38A169] border-[#C6F6D5]',
    guest: 'bg-[#FAF5FF] text-[#805AD5] border-[#E9D8FD]',
    break: 'bg-[#FFF5F5] text-[#E53E3E] border-[#FED7D7]',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative mb-8 group">
      {/* Event Card */}
      <div
        className={cn(
          "relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-transparent hover:border-[#E2E8F0] transition-all",
          isDragging && "opacity-50"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-[#CBD5E0] hover:text-[#A0AEC0] transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </button>

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
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
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
                  {event.attendees.length} people
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            removeEvent(event.id);
            toast.info("Event removed");
          }}
          className="opacity-0 group-hover:opacity-100 p-2 text-[#FC8181] hover:bg-[#FFF5F5] rounded-lg transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Buffer Indicator */}
      <div className="absolute -bottom-7 left-14 right-8 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-dashed bg-[#E2E8F0] border-t border-dashed" />
        <span className="text-[10px] font-medium text-[#A0AEC0] uppercase tracking-widest whitespace-nowrap">
          {bufferMinutes}m buffer
        </span>
        <div className="h-[1px] flex-1 bg-dashed bg-[#E2E8F0] border-t border-dashed" />
      </div>
    </div>
  );
}

export function Timeline() {
  const { events, bufferMinutes, setEvents } = useTimelineStore();
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
      
      const newEvents = arrayMove(events, oldIndex, newIndex);
      
      // Update times based on new order and buffer
      let currentTime = new Date(newEvents[0].startTime);
      const updatedEvents = newEvents.map((e, idx) => {
        const start = idx === 0 ? currentTime : addMinutes(currentTime, bufferMinutes);
        const updated = { ...e, startTime: start.toISOString() };
        currentTime = addMinutes(start, e.durationMinutes);
        return updated;
      });

      setEvents(updatedEvents);
      toast.success("Schedule reordered");
    }
  }

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
        <div className="relative pl-4">
          {/* Vertical line */}
          <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-[#EDF2F7] -z-10" />
          
          {events.map((event) => (
            <SortableEventItem key={event.id} event={event} bufferMinutes={bufferMinutes} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
