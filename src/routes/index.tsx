import { createFileRoute } from "@tanstack/react-router";
import { Plus, Share2, Calendar as CalendarIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, CalendarDays, Moon, Sun, User } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { format, addDays, parseISO, startOfDay } from "date-fns";
import { Timeline } from "../components/Timeline";
import { AddEventModal } from "../components/AddEventModal";
import { SharePanel } from "../components/SharePanel";
import { useReminders } from "../lib/useReminders";
import { Toaster } from "sonner";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { cn } from "../lib/utils";
import { useTheme } from "../lib/theme";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { selectedDate, setSelectedDate } = useTimelineStore();
  const currentSelectedDate = parseISO(selectedDate);
  useReminders();
  const { theme, toggleTheme } = useTheme();

  const handlePrevDay = () => setSelectedDate(addDays(currentSelectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(currentSelectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="min-h-screen bg-[#F7FAFC] px-4 py-6 md:px-12 md:py-16 font-sans selection:bg-accent text-[#1A202C]">
      <Toaster position="top-center" richColors />
      
      <header className="mx-auto max-w-4xl mb-8 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#2D3748] flex items-center justify-center text-white shadow-lg shadow-gray-200/50">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0AEC0] block leading-none mb-0.5">Executive Suite</span>
            <span className="text-xs font-semibold text-[#4A5568]">Personal Assistant v2.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4A5568] shadow-sm border border-[#E2E8F0] hover:bg-[#F7FAFC] transition-all"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <div className="h-10 w-10 rounded-full bg-[#EDF2F7] flex items-center justify-center text-[#A0AEC0] border border-[#E2E8F0]">
            <User className="h-5 w-5" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl mb-12">
        <h1 className="text-[52px] font-serif font-bold text-[#1A202C] tracking-tight leading-tight">Timeline</h1>
        <p className="text-[#718096] text-2xl font-light mt-1">{format(currentSelectedDate, "EEEE, MMMM do")}</p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center w-full justify-between sm:w-auto bg-white border border-[#E2E8F0] rounded-2xl shadow-sm px-2 py-2 print:hidden flex-1 sm:flex-none">
            <button 
              onClick={handlePrevDay}
              className="p-2 hover:bg-[#F7FAFC] rounded-xl transition-colors text-[#A0AEC0]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4 px-4 border-l border-r border-[#EDF2F7]">
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2D3748] hover:bg-[#F7FAFC] rounded-xl transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Pick Date
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={currentSelectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <button 
                onClick={handleToday}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[#F7FAFC] rounded-xl transition-colors",
                  format(new Date(), "yyyy-MM-dd") === selectedDate ? "text-[#3B82F6]" : "text-[#718096]"
                )}
              >
                Today
              </button>
            </div>

            <button 
              onClick={handleNextDay}
              className="p-2 hover:bg-[#F7FAFC] rounded-xl transition-colors text-[#A0AEC0]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 sm:flex-none">
            <div className="flex-1 sm:flex-none">
              <SharePanel />
            </div>
            <div className="flex-1 sm:flex-none">
              <AddEventModal />
            </div>
            <Link 
              to="/settings"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4A5568] shadow-sm border border-[#E2E8F0] hover:bg-[#F7FAFC] transition-all"
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl">
        <Timeline />
      </main>

      <footer className="mx-auto max-w-4xl mt-32 pb-12 pt-8 border-t border-border flex flex-col md:flex-row gap-6 justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] print:hidden">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span>System Active &bull; &copy; 2026</span>
        </div>
        <div className="flex gap-8">
          <button className="hover:text-[#2D3748] transition-colors">Security</button>
          <button className="hover:text-[#2D3748] transition-colors">Terms</button>
          <button className="hover:text-[#2D3748] transition-colors">Support</button>
        </div>
      </footer>
    </div>
  );
}
