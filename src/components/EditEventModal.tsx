import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTimelineStore, TimelineEvent, EventType } from "../lib/store";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import { parseISO } from "date-fns";

interface Props {
  event: TimelineEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventModal({ event, open, onOpenChange }: Props) {
  const [formData, setFormData] = useState({
    title: event.title,
    startDate: parseISO(event.startTime),
    durationMinutes: event.durationMinutes,
  });

  const updateEvent = useTimelineStore((state) => state.updateEvent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = updateEvent(event.id, {
      title: formData.title,
      startTime: formData.startDate.toISOString(),
      durationMinutes: formData.durationMinutes,
    });

    if (success) {
      toast.success("Event updated");
      onOpenChange(false);
    } else {
      toast.error("Time clash! Please choose a different time.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} />
            <DatePicker selected={formData.startDate} onChange={(d: Date) => setFormData(p => ({...p, startDate: d}))} showTimeSelect timeFormat="HH:mm" dateFormat="MMMM d, yyyy h:mm aa" />
            <Input type="number" value={formData.durationMinutes} onChange={e => setFormData(p => ({...p, durationMinutes: Number(e.target.value)}))} />
          </div>
          <DialogFooter><button type="submit" className="bg-black text-white px-4 py-2 rounded">Save</button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
