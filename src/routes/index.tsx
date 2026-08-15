import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Calendar, Share2, Settings } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const events = useTimelineStore((state) => state.events);

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8 font-sans">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[#1A202C]">Daily Schedule</h1>
          <p className="text-[#718096]">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#4A5568] shadow-sm hover:shadow-md transition-all">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all">
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        <div className="relative space-y-6">
          {events.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-[#E2E8F0] bg-white">
              <p className="text-[#A0AEC0]">No events scheduled for today.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="group relative rounded-2xl bg-white p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#2D3748]">{event.title}</h3>
                    <p className="text-sm text-[#718096] mt-1">
                      {format(new Date(event.startTime), "h:mm a")} • {event.durationMinutes} mins
                    </p>
                  </div>
                  <span className="rounded-full bg-[#EBF8FF] px-3 py-1 text-xs font-medium text-[#3182CE] uppercase tracking-wider">
                    {event.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
