import { createFileRoute } from "@tanstack/react-router";
import { Plus, Share2, Calendar as CalendarIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { format, addDays, parseISO } from "date-fns";
import { Timeline } from "../components/Timeline";
import { AddEventModal } from "../components/AddEventModal";
import { SharePanel } from "../components/SharePanel";
import { Settings } from "../components/Settings";
import { useReminders } from "../lib/useReminders";
import { Toaster } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { selectedDate, setSelectedDate } = useTimelineStore();
  const currentSelectedDate = parseISO(selectedDate);
  useReminders();

  const handlePrevDay = () => setSelectedDate(addDays(currentSelectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(currentSelectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

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
          <h1 className="text-4xl font-serif font-medium text-[#1A202C] tracking-tight print:hidden">Timeline</h1>
          <h1 className="hidden print:block text-4xl font-serif font-medium text-[#1A202C] tracking-tight">Executive Schedule</h1>

          <div className="flex items-center gap-3 mt-1">
            <p className="text-[#718096] text-lg">{format(currentSelectedDate, "EEEE, MMMM do")}</p>
            <div className="flex items-center bg-white border border-[#EDF2F7] rounded-lg shadow-sm px-1 py-0.5 print:hidden">
              <button 
                onClick={handlePrevDay}
                className="p-1 hover:bg-[#F7FAFC] rounded transition-colors text-[#718096]"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleToday}
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4A5568] hover:bg-[#F7FAFC] rounded transition-colors"
              >
                Today
              </button>
              <button 
                onClick={handleNextDay}
                className="p-1 hover:bg-[#F7FAFC] rounded transition-colors text-[#718096]"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
          <SharePanel />
          <AddEventModal />
          <Settings />
        </div>

      </header>

      <main className="mx-auto max-w-3xl">
        <Timeline />
      </main>

      <footer className="mx-auto max-w-3xl mt-20 pt-8 border-t border-[#EDF2F7] flex justify-between items-center text-[11px] font-medium text-[#A0AEC0] uppercase tracking-widest print:hidden">
        <span>&copy; 2026 Executive PA Suite</span>
        <div className="flex gap-6">
          <button className="hover:text-[#4A5568] transition-colors">Privacy</button>
          <button className="hover:text-[#4A5568] transition-colors">Support</button>
        </div>
      </footer>
    </div>
  );
}
