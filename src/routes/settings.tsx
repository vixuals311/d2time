import { createFileRoute } from "@tanstack/react-router";
import { useTimelineStore } from "../lib/store";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { X, Plus, Sparkles, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
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

  const [localBuffer, setLocalBuffer] = useState(bufferMinutes);
  const [localWorkingHours, setLocalWorkingHours] = useState(workingHours);
  const [localDurations, setLocalDurations] = useState(durationOptions);
  const [localProfile, setLocalProfile] = useState(profile);
  const [newDuration, setNewDuration] = useState("");

  const hasChanges = 
    localBuffer !== bufferMinutes || 
    localWorkingHours.start !== workingHours.start || 
    localWorkingHours.end !== workingHours.end || 
    JSON.stringify([...localDurations].sort()) !== JSON.stringify([...durationOptions].sort()) ||
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
    <div className="min-h-screen bg-background px-4 py-6 md:px-12 md:py-16 font-sans">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-accent rounded-xl transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">Settings</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </header>

        <div className="space-y-8 pb-20">
          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">High-Profile Individual Profile</Label>
            <div className="grid gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="grid gap-1.5">
                <Label htmlFor="profile-name" className="text-xs">Full Name</Label>
                <Input
                  id="profile-name"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  placeholder="e.g. Elon Musk"
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-position" className="text-xs">Position</Label>
                  <Input
                    id="profile-position"
                    value={localProfile.position}
                    onChange={(e) => setLocalProfile({ ...localProfile, position: e.target.value })}
                    placeholder="e.g. CEO"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-company" className="text-xs">Company</Label>
                  <Input
                    id="profile-company"
                    value={localProfile.company}
                    onChange={(e) => setLocalProfile({ ...localProfile, company: e.target.value })}
                    placeholder="e.g. Tesla"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Schedule Configuration</Label>
            <div className="grid gap-6 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="grid gap-2">
                <Label htmlFor="buffer" className="text-sm font-medium">Default Buffer (minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  min="0"
                  step="5"
                  value={localBuffer}
                  onChange={(e) => setLocalBuffer(Number(e.target.value))}
                  className="h-10 rounded-xl"
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
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dayEnd" className="text-sm font-medium">Day End Time</Label>
                  <Input
                    id="dayEnd"
                    type="time"
                    value={localWorkingHours.end}
                    onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, end: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Ready Durations (presets)</Label>
                <div className="flex flex-wrap gap-2">
                  {localDurations.map((d) => (
                    <div key={d} className="flex items-center gap-1 bg-secondary border border-border px-3 py-1.5 rounded-xl text-sm group">
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
                    className="h-10 rounded-xl"
                  />
                  <button 
                    onClick={addDuration}
                    className="flex items-center justify-center bg-primary text-primary-foreground w-10 h-10 rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">System & Debug</Label>
            <div className="grid gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <button
                onClick={() => {
                  populateRandomData();
                  toast.success("Random data generated for 1 day ago to 7 days in future");
                }}
                className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground py-3 rounded-xl text-sm font-medium hover:bg-accent transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Populate Random Data
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed italic text-center">
                * Changes only apply after clicking Save. Buffers are automatically added between events when reordering.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
