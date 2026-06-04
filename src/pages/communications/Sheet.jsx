// Sheet.jsx - Modal Drawer Component
import React from "react";
import { X } from "lucide-react";

// Add cn function directly here
function cn(...args) {
    return args.filter(Boolean).join(" ");
}

export function Sheet({ children, open, onOpenChange }) {
    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
                onClick={() => onOpenChange(false)}
            />

            {/* Sheet Content */}
            {children}
        </>
    );
}

export function SheetContent({ children, className, onClose }) {
    return (
        <div
            className={cn(
                "fixed z-50 gap-2 bg-background shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right w-[600px] sm:w-[620px] sm:max-w-[650px] flex flex-col p-0",
                className
            )}
            style={{ pointerEvents: "auto" }}
        >
            {children}

            {/* Close Button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>
    );
}

export function SheetHeader({ children, className }) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
            {children}
        </div>
    );
}

export function SheetTitle({ children, className }) {
    return <h2 className={cn("font-semibold text-foreground", className)}>{children}</h2>;
}

export function SheetDescription({ children, className }) {
    return <p className={cn("text-muted-foreground text-sm mt-3", className)}>{children}</p>;
}
