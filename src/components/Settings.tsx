import { useState } from "react";
import { Settings as SettingsIcon, Plus, X, Sparkles } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { toast } from "sonner";

export function Settings() {
  const { 
    bufferMinutes, 
    setBufferMinutes, 
    workingHours, 
    setWorkingHours,
    durationOptions,
    setDurationOptions,
    profile,
    setProfile,
    populateRandomData
  } = useTimelineStore();

  const [open, setOpen] = useState(false);
  
  // Local state for the form
  const [localBuffer, setLocalBuffer] = useState(bufferMinutes);
  const [localWorkingHours, setLocalWorkingHours] = useState(workingHours);
  const [localDurations, setLocalDurations] = useState(durationOptions);
  const [localProfile, setLocalProfile] = useState(profile);
  const [newDuration, setNewDuration] = useState("");

  const hasChanges = 
    localBuffer !== bufferMinutes || 
    localWorkingHours.start !== workingHours.start || 
    localWorkingHours.end !== workingHours.end || 
    JSON.stringify(localDurations.sort()) !== JSON.stringify([...durationOptions].sort()) ||
    localProfile.name !== profile.name ||
    localProfile.position !== profile.position ||
    localProfile.company !== profile.company;

  const handleSave = () => {
    if (!hasChanges) return;
    setBufferMinutes(localBuffer);
    setWorkingHours(localWorkingHours);
    setDurationOptions([...localDurations].sort((a, b) => a - b));
    setProfile(localProfile);
    toast.success("Settings saved successfully");
    setOpen(false);
  };

  const addDuration = () => {
    const val = parseInt(newDuration);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid duration in minutes");
      return;
    }
    if (localDurations.includes(val)) {
      toast.error("Duration already exists");
      return;
    }
    setLocalDurations([...localDurations, val]);
    setNewDuration("");
  };

  const removeDuration = (val: number) => {
    setLocalDurations(localDurations.filter(d => d !== val));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v) {
        // Reset local state to store state when opening
        setLocalBuffer(bufferMinutes);
        setLocalWorkingHours(workingHours);
        setLocalDurations(durationOptions);
        setLocalProfile(profile);
      }
    }}>
      <DialogTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4A5568] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-[#EDF2F7] hover:bg-[#F7FAFC] transition-all">
          <SettingsIcon className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2D3748]">Schedule Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-[#2D3748] uppercase tracking-wider">High-Profile Individual Profile</Label>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="profile-name" className="text-xs">Full Name</Label>
                <Input
                  id="profile-name"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  placeholder="e.g. Elon Musk"
                  className="h-9 rounded-xl"
                />
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-position" className="text-xs">Position</Label>
                  <Input
                    id="profile-position"
                    value={localProfile.position}
                    onChange={(e) => setLocalProfile({ ...localProfile, position: e.target.value })}
                    placeholder="e.g. CEO"
                    className="h-9 rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-company" className="text-xs">Company</Label>
                  <Input
                    id="profile-company"
                    value={localProfile.company}
                    onChange={(e) => setLocalProfile({ ...localProfile, company: e.target.value })}
                    placeholder="e.g. Tesla"
                    className="h-9 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[#EDF2F7]" />

          <div className="grid gap-2">
            <Label htmlFor="buffer" className="text-sm font-medium">Default Buffer (minutes)</Label>
            <Input
              id="buffer"
              type="number"
              min="0"
              step="5"
              value={localBuffer}
              onChange={(e) => setLocalBuffer(Number(e.target.value))}
              className="h-9 rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dayStart" className="text-sm font-medium">Day Start Time</Label>
              <Input
                id="dayStart"
                type="time"
                value={localWorkingHours.start}
                onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, start: e.target.value })}
                className="h-9 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dayEnd" className="text-sm font-medium">Day End Time</Label>
              <Input
                id="dayEnd"
                type="time"
                value={localWorkingHours.end}
                onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, end: e.target.value })}
                className="h-9 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Ready Durations (presets)</Label>
            <div className="flex flex-wrap gap-2">
              {localDurations.map((d) => (
                <div key={d} className="flex items-center gap-1 bg-[#F7FAFC] border border-[#EDF2F7] px-2 py-1 rounded-lg text-sm group">
                  <span>{d >= 60 ? `${d/60}h` : `${d}m`}</span>
                  <button 
                    onClick={() => removeDuration(d)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add minutes (e.g. 45)"
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="h-9 rounded-xl"
              />
              <button 
                onClick={addDuration}
                className="flex items-center justify-center bg-[#2D3748] text-white p-2 rounded-xl hover:bg-[#1A202C] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="h-[1px] bg-[#EDF2F7]" />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Debug Tools</Label>
            <button
              onClick={() => {
                populateRandomData();
                toast.success("Random data generated for 1 day ago to 7 days in future");
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#F7FAFC] border border-[#EDF2F7] text-[#4A5568] py-2 rounded-xl text-sm font-medium hover:bg-[#EDF2F7] transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              Populate Random Data
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed italic">
            * Changes only apply after clicking Save. Buffers are automatically added between events when reordering.
          </p>

        </div>
        <DialogFooter>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-full bg-[#2D3748] text-white py-2 rounded-xl font-medium hover:bg-[#1A202C] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2D3748]"
          >
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
