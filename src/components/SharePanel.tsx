import { useState } from "react";
import { Share2, Link as LinkIcon, FileText, Check } from "lucide-react";
import { useTimelineStore } from "../lib/store";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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


  const exportPDF = async () => {
    const element = document.querySelector('main');
    if (!element) return;
    
    toast.loading("Generating PDF...", { id: "pdf-gen" });
    
    // Optimization: Don't use scale: 2 unless high res is critical
    const canvas = await html2canvas(element, {
      scale: 1.5,
      logging: false,
      useCORS: true,
      backgroundColor: '#F8F9FB',
      removeContainer: true
    });

    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Timeline-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.dismiss("pdf-gen");
    toast.success("PDF ready");

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
                <p className="text-sm font-semibold text-[#2D3748]">Download PDF</p>
                <p className="text-xs text-[#718096]">Save as a clean document</p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
