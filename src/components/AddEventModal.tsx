import { useState } from "react";
import { Plus } from "lucide-react";
import { parse, format, isBefore, isAfter, startOfMinute } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTimelineStore, EventType } from "../lib/store";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import { cn } from "@/lib/utils";

export function AddEventModal() {
  const [open, setOpen] = useState(false);
  const addEvent = useTimelineStore((state) => state.addEvent);
  const bufferMinutes = useTimelineStore((state) => state.bufferMinutes);
  const workingHours = useTimelineStore((state) => state.workingHours);
  const durationOptions = useTimelineStore((state) => state.durationOptions);

  const [formData, setFormData] = useState<{
    title: string;
    startDate: Date;
    durationMinutes: number;
    type: EventType;
    location: string;
  }>({
    title: "",
    startDate: new Date(),
    durationMinutes: 30,
    type: "meeting",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }

    const eventStart = formData.startDate;
    const eventEnd = new Date(eventStart.getTime() + formData.durationMinutes * 60000);
    
    const baseDate = format(eventStart, "yyyy-MM-dd");
    const dayStart = parse(`${baseDate} ${workingHours.start}`, "yyyy-MM-dd HH:mm", new Date());
    const dayEnd = parse(`${baseDate} ${workingHours.end}`, "yyyy-MM-dd HH:mm", new Date());

    if (eventStart < dayStart || eventEnd > dayEnd) {
      toast.error(`Event must be within working hours (${workingHours.start} - ${workingHours.end})`);
      return;
    }

    // Check if time has passed
    if (isBefore(eventStart, startOfMinute(new Date()))) {
      toast.error("Cannot schedule events in the past");
      return;
    }

    const success = addEvent({
      title: formData.title,
      startTime: eventStart.toISOString(),
      durationMinutes: Number(formData.durationMinutes),
      type: formData.type,
      location: formData.location,
    });

    if (success) {
      toast.success("Event added to timeline");
      setOpen(false);
      setFormData({
        title: "",
        startDate: new Date(),
        durationMinutes: 30,
        type: "meeting",
        location: "",
      });
    } else {
      toast.error("Time clash detected! Please choose a different time.");
    }
  };

  const filterPassedTime = (time: Date) => {
    const baseDate = format(formData.startDate, "yyyy-MM-dd");
    const dayStart = parse(`${baseDate} ${workingHours.start}`, "yyyy-MM-dd HH:mm", new Date());
    const dayEnd = parse(`${baseDate} ${workingHours.end}`, "yyyy-MM-dd HH:mm", new Date());
    const now = new Date();
    
    const isWithinWorkingHours = (isAfter(time, dayStart) || time.getTime() === dayStart.getTime()) && 
                                (isBefore(time, dayEnd) || time.getTime() === dayEnd.getTime());
    
    const isFuture = isAfter(time, startOfMinute(now)) || time.getTime() === startOfMinute(now).getTime();

    return isWithinWorkingHours && isFuture;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Meeting with CEO..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <DatePicker
                    selected={formData.startDate}
                    onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    filterTime={filterPassedTime}
                    minDate={new Date()}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  * Only future hours between {workingHours.start} and {workingHours.end} are selectable.
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Duration</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, durationMinutes: opt }))}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                        formData.durationMinutes === opt 
                          ? "bg-[#2D3748] text-white border-[#2D3748]" 
                          : "bg-white text-[#4A5568] border-[#EDF2F7] hover:bg-[#F7FAFC]"
                      )}
                    >
                      {opt >= 60 ? `${opt/60}h` : `${opt}m`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="h-9 w-24 rounded-xl"
                  />
                  <span className="text-xs text-muted-foreground">custom min</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Main Hall"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: EventType) =>
                    setFormData((prev) => ({ ...prev, type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              * A {bufferMinutes}m buffer will be visually added after this event.
            </p>
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all"
            >
              Add to Schedule
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
