import { createFileRoute } from "@tanstack/react-router";
import { Plus, Share2, Calendar as CalendarIcon, Settings } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { format } from "date-fns";
import { Timeline } from "../components/Timeline";
import { AddEventModal } from "../components/AddEventModal";
import { Toaster } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const events = useTimelineStore((state) => state.events);

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-6 py-8 md:p-12 font-sans selection:bg-[#EBF8FF]">
      <Toaster position="top-center" richColors />
      
      <header className="mx-auto max-w-3xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-[#2D3748] flex items-center justify-center text-white">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#A0AEC0]">PA Assistant</span>
          </div>
          <h1 className="text-4xl font-serif font-medium text-[#1A202C] tracking-tight">Daily Timeline</h1>
          <p className="text-[#718096] mt-1 text-lg">{format(new Date(), "EEEE, MMMM do")}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4A5568] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-[#EDF2F7] hover:bg-[#F7FAFC] transition-all">
            <Share2 className="h-4 w-4" /> Share Schedule
          </button>
          <AddEventModal />
        </div>
      </header>

      <main className="mx-auto max-w-3xl">
        <Timeline />
      </main>

      <footer className="mx-auto max-w-3xl mt-20 pt-8 border-t border-[#EDF2F7] flex justify-between items-center text-[11px] font-medium text-[#A0AEC0] uppercase tracking-widest">
        <span>&copy; 2026 Executive PA Suite</span>
        <div className="flex gap-6">
          <button className="hover:text-[#4A5568] transition-colors">Privacy</button>
          <button className="hover:text-[#4A5568] transition-colors">Support</button>
        </div>
      </footer>
    </div>
  );
}
