import { Settings as SettingsIcon } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function Settings() {
  const { bufferMinutes, setBufferMinutes, workingHours, setWorkingHours } = useTimelineStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4A5568] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-[#EDF2F7] hover:bg-[#F7FAFC] transition-all">
          <SettingsIcon className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2D3748]">Schedule Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="buffer" className="text-sm font-medium">Default Buffer (minutes)</Label>
            <Input
              id="buffer"
              type="number"
              min="0"
              step="5"
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dayStart" className="text-sm font-medium">Day Start Time</Label>
            <Input
              id="dayStart"
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dayEnd" className="text-sm font-medium">Day End Time</Label>
            <Input
              id="dayEnd"
              type="time"
              value={workingHours.end}
              onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
              className="h-9"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Buffers are automatically added between events when reordering. Clash prevention is active to ensure no overlapping schedules.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
