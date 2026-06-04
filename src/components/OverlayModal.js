import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, Download, X } from "lucide-react";

function useLockBodyScroll(open) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);
}

export default function OverlayModal({ open, onClose, children }) {
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/80 animate-fade-in" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-preview-title"
        aria-describedby="doc-preview-desc"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl transform flex-col overflow-hidden border-l bg-background p-6 shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right"
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "15px",
            top: "15px",
            zIndex: "99999",
          }}
          className="pdfcontrollButtonsPDF"
          aria-label="Close"
          title="Close"
        >
          <X size={24} />
          <span className="sr-only">Close</span>
        </button>

        <div id="doc-preview-desc" className="mt-4 flex-1 overflow-auto">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-from-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in-from-right { animation: slide-in-from-right 0.45s ease forwards; }
        .animate-fade-in { animation: fade-in 0.25s ease forwards; }
      `}</style>
    </div>,
    document.body
  );
}
