import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTimelineStore, TimelineEvent } from "../lib/store";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import { parseISO, addMinutes } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

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
  const [showClashDialog, setShowClashDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        title: event.title,
        startDate: parseISO(event.startTime),
        durationMinutes: event.durationMinutes,
      });
    }
  }, [open, event]);

  const { updateEvent, bufferMinutes, events } = useTimelineStore();

  const handleSubmit = (e?: React.FormEvent, force = false) => {
    e?.preventDefault();
    
    // Manual check for clash to show dialog if not force
    if (!force) {
      const updatedStart = formData.startDate;
      const updatedEnd = addMinutes(updatedStart, formData.durationMinutes + bufferMinutes);
      
      const hasClash = events.filter(e => e.id !== event.id).some(e => {
        const eStart = parseISO(e.startTime);
        const eEnd = addMinutes(eStart, e.durationMinutes + bufferMinutes);
        return updatedStart < eEnd && updatedEnd > eStart;
      });
      
      if (hasClash) {
        setShowClashDialog(true);
        return;
      }
    }

    const success = updateEvent(event.id, {
      title: formData.title,
      startTime: formData.startDate.toISOString(),
      durationMinutes: formData.durationMinutes,
    }, force);

    if (success) {
      toast.success(force ? "Schedule shifted and updated" : "Event updated");
      onOpenChange(false);
      setShowClashDialog(false);
    } else {
      toast.error("Could not update event");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={(e) => handleSubmit(e)}>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(d: Date | null) => d && setFormData((p) => ({ ...p, startDate: d }))}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all"
              >
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClashDialog} onOpenChange={setShowClashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time Clash Detected</AlertDialogTitle>
            <AlertDialogDescription>
              This change overlaps with the next event. Would you like to forcefully push all subsequent events forward to accommodate this change?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(undefined, true)}>
              Force Shift Events
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
