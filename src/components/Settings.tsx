import { Settings as SettingsIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useTimelineStore } from "../lib/store";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function Settings() {
  const { bufferMinutes, setBufferMinutes, workingHours, setWorkingHours } = useTimelineStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4A5568] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-[#EDF2F7] hover:bg-[#F7FAFC] transition-all">
          <SettingsIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 max-h-[80vh] overflow-y-auto" sideOffset={8}>
        <div className="space-y-4 p-1">
          <h4 className="font-semibold text-sm text-[#2D3748]">Schedule Settings</h4>
          <div className="grid gap-2">
            <Label htmlFor="buffer" className="text-xs">Default Buffer (minutes)</Label>
            <Input
              id="buffer"
              type="number"
              min="0"
              step="5"
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dayStart" className="text-xs">Day Start Time</Label>
            <Input
              id="dayStart"
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dayEnd" className="text-xs">Day End Time</Label>
            <Input
              id="dayEnd"
              type="time"
              value={workingHours.end}
              onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Buffers are automatically added between events when reordering. Clash prevention is active.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
