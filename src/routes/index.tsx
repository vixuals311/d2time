import { createFileRoute } from "@tanstack/react-router";
import { Plus, Share2, Calendar as CalendarIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, CalendarDays, Moon, Sun } from "lucide-react";
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
import { AuthButton } from "../components/AuthButton";


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
    <div className="min-h-screen bg-background px-4 py-6 md:px-12 md:py-16 font-sans selection:bg-accent relative">
      <Toaster position="top-center" richColors />
      
      <div className="absolute top-6 right-4 md:top-10 md:right-12 flex items-center gap-2 md:gap-3 print:hidden z-10">
        <AuthButton />

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <Link 
          to="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all"
          title="Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </Link>
      </div>

      <header className="mx-auto max-w-4xl mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 print:hidden">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-gray-200/50 animate-float">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block leading-none mb-1">Executive Suite</span>
              <span className="text-xs font-semibold text-foreground/70">Personal Assistant v2.0</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground tracking-tight text-gradient">Timeline</h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
            <p className="text-muted-foreground text-lg md:text-xl font-light">{format(currentSelectedDate, "EEEE, MMMM do")}</p>
            <div className="flex items-center w-full justify-between sm:w-auto bg-card border border-border rounded-xl shadow-sm px-1 py-1 print:hidden">
              <button 
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2 px-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-accent rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CalendarDays className="h-3 w-3" />
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

                {format(new Date(), "yyyy-MM-dd") === selectedDate && (
                  <button 
                    onClick={handleToday}
                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-accent rounded-lg transition-colors"
                  >
                    Today
                  </button>
                )}
              </div>

              <button 
                onClick={handleNextDay}
                className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 print:hidden w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <SharePanel />
          </div>
          <div className="flex-1 md:flex-none">
            <AddEventModal />
          </div>
        </div>

      </header>

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
