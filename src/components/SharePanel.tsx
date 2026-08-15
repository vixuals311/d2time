import { useState } from "react";
import { Share2, Link as LinkIcon, FileText, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";
import { useTimelineStore } from "../lib/store";

export function SharePanel() {
  const [copied, setCopied] = useState(false);
  const selectedDate = useTimelineStore((state) => state.selectedDate);

  const copyLink = () => {
    const url = new URL(window.location.origin);
    url.pathname = `/share/${selectedDate}`;
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    toast.success("Shareable link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = () => {
    toast.loading("Preparing print view...", { id: "pdf-gen" });
    // Use window.print() for faster, higher quality PDF generation
    window.print();
    toast.dismiss("pdf-gen");
    toast.success("Print dialog opened");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4A5568] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-[#EDF2F7] hover:bg-[#F7FAFC] transition-all">
          <Share2 className="h-4 w-4" /> Share Schedule
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Timeline</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <button
            onClick={copyLink}
            className="flex items-center justify-between w-full rounded-xl border border-[#EDF2F7] p-4 hover:bg-[#F7FAFC] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#EBF8FF] flex items-center justify-center text-[#3182CE]">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#2D3748]">Copy link</p>
                <p className="text-xs text-[#718096]">Share a live view of this timeline</p>
              </div>
            </div>
            {copied ? <Check className="h-4 w-4 text-[#38A169]" /> : <div className="h-4 w-4" />}
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center justify-between w-full rounded-xl border border-[#EDF2F7] p-4 hover:bg-[#F7FAFC] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F0FFF4] flex items-center justify-center text-[#38A169]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#2D3748]">Download PDF / Print</p>
                <p className="text-xs text-[#718096]">Save as a high-quality document</p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
