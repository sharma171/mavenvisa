//communications/index.js
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  Plus,
  Send,
  Paperclip,
  CircleCheckBig,
  X,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  FileText,
  FileImage,
  XCircle,
  ZoomIn,
  ZoomOut,
  Loader2,
  RefreshCw,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import CreateTicketModal from "./CreateTicketModal";
import {
  getAllMessages,
  sendFollowUpMessage,
  organizeMessagesIntoTickets,
  downloadAttachment,
  changeTicketStatus,
  getAttachment  // ✅ Add this
} from "./communicationApi";

// ============================================
// UTILITY FUNCTIONS
// ============================================

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

function formatTimeLabel(iso) {
  const d = new Date(iso);
  // Use 'en-US' to ensure US format (Month Day, Time AM/PM)
  const date = d.toLocaleDateString('en-US', { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString('en-US', { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

// Map sub-category values to display labels
function mapSubCategoryLabel(subCategory) {
  const subCategoryMap = { awards_prizes: "Awards or Prizes", memberships: "Membership in Associations", media_coverage: "Published Material About You", judging: "Judging Work of Others", original_contributions: "Original Contribution", scholarly_articles: "Scholarly Articles", exhibitions: "Exhibitions or Showcases", leadership_role: "Leading or Critical Role", high_salary: "High Salary", commercial_success: "Commercial Success", critical_role: "Critical or Essential Role", other: "Other", };
  return subCategoryMap[subCategory] || subCategory || 'Not Specified';
}


function statusPillClass(status) {
  const statusMap = {
    Open: "bg-primary text-primary-foreground",
    open: "bg-primary text-primary-foreground",
    Resolved: "bg-green-600 text-white",
    resolved: "bg-green-600 text-white",
    Closed: "bg-slate-600 text-white",
    closed: "bg-slate-600 text-white",
    Pending: "bg-orange-500 text-white",
    pending: "bg-orange-500 text-white",
  };
  return statusMap[status] || "bg-secondary text-secondary-foreground";
}

function priorityPillClass(priority) {
  const priorityLower = priority?.toLowerCase();
  if (priorityLower === "high") return "bg-destructive text-destructive-foreground";
  if (priorityLower === "medium") return "bg-secondary text-secondary-foreground";
  if (priorityLower === "low") return "border text-foreground";
  return "bg-secondary text-secondary-foreground";
}

function mapStatusLabel(status) {
  if (!status) return "Open";
  const statusLower = String(status).toLowerCase();
  if (statusLower === "completed") return "Resolved";
  if (statusLower === "unread") return "Open";
  if (statusLower === "pending") return "Pending";
  if (statusLower === "closed") return "Closed";
  if (statusLower === "open") return "Open";
  if (statusLower === "resolved") return "Resolved";
  return "Open";
}

function mapPriorityLabel(priority) {
  if (!priority) return "Low";
  const priorityLower = priority?.toLowerCase();
  if (priorityLower === "high") return "High";
  if (priorityLower === "medium") return "Medium";
  return "Low";
}

function mapTypeLabel(type) {
  if (type === "message") return "Evidence Clarification";
  if (type === "email") return "Status Update";
  return "General";
}

// Download file utility
function downloadFile(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// UI COMPONENTS
// ============================================

const Card = ({ children }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">{children}</div>
);

const CardHeader = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1.5 p-4 px-5", className)}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold leading-none tracking-tight">{children}</h3>
);

const CardContent = ({ children, className }) => <div className={cn("p-0", className)}>{children}</div>;

const Button = ({ children, variant = "default", ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2 py-2",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-2 py-2",
    ghost: "hover:bg-accent hover:text-accent-foreground h-10 px-2 py-2",
  };

  return (
    <button {...props} className={cn(baseStyles, variantStyles[variant], props.className)}>
      {children}
    </button>
  );
};

const Input = (props) => (
  <input
    {...props}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      props.className
    )}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={cn(
      "flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      props.className
    )}
  />
);

// ============================================
// IMAGE VIEWER MODAL
// ============================================

function ImageViewerModal({ image, onClose }) {
  const [zoom, setZoom] = useState(1);

  if (!image) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/80 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
          <h3 className="text-lg font-semibold">Image Viewer</h3>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-b bg-muted/20 px-6 py-3">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
            Zoom In
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
            Zoom Out
          </button>
          <button
            onClick={() => downloadFile(image.url, image.caption || "image.jpg")}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <span className="ml-auto text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-slate-200
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-slate-300">
          <div className="flex items-center justify-center min-h-full">
            <img
              src={image.url}
              alt={image.caption}
              style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Footer */}
        {image.caption && (
          <div className="border-t bg-muted/30 px-6 py-4">
            <p className="text-sm text-muted-foreground">{image.caption}</p>
          </div>
        )}
      </div>
    </>
  );
}


// ============================================
// ATTACHMENT VIEWER MODAL
// ============================================


function AttachmentViewerModal({ attachment, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (attachment) {
      loadAttachment();
    }
  }, [attachment]);

  const loadAttachment = async () => {
    setIsLoading(true);
    try {
      const result = await getAttachment(attachment.filePath || attachment.url);

      if (result.success) {
        const base64Data = result.data.fileContent;
        const fileType = (attachment.fileType || '').toLowerCase();

        // Create blob URL for viewing
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileType)) {
          setFileContent(`data:image/${fileType};base64,${base64Data}`);
        } else if (fileType === 'pdf') {
          setFileContent(`data:application/pdf;base64,${base64Data}`);
        }
      }
    } catch (error) {
      console.error("Error loading attachment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    await downloadAttachment(
      attachment.filePath || attachment.url,
      attachment.name || attachment.fileName
    );
  };

  if (!attachment) return null;

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
    (attachment.fileType || '').toLowerCase()
  );
  const isPDF = (attachment.fileType || '').toLowerCase() === 'pdf';

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/80 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold truncate">
              {attachment.name || attachment.fileName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {attachment.sizeLabel} • {(attachment.fileType || 'file').toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted transition-colors shrink-0"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-b bg-muted/20 px-6 py-3">
          {isImage && (
            <>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
                Zoom In
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
                Zoom Out
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          {isImage && (
            <span className="ml-auto text-sm text-muted-foreground">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-muted/5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading attachment...</p>
            </div>
          ) : fileContent ? (
            <div className="flex items-center justify-center min-h-full">
              {isImage ? (
                <img
                  src={fileContent}
                  alt={attachment.name || attachment.fileName}
                  style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              ) : isPDF ? (
                <iframe
                  src={fileContent}
                  className="w-full h-full min-h-[calc(100vh-195px)] rounded-lg border"
                  title={attachment.name || attachment.fileName}
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download to view
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
                <p className="text-destructive">Failed to load attachment</p>
                <button
                  onClick={loadAttachment}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


// ============================================
// ATTACHMENT COMPONENTS
// ============================================

function AttachmentIcon({ fileType, className }) {
  const isImage = ["png", "jpg", "jpeg", "webp", "gif", "image"].includes(
    String(fileType || "").toLowerCase()
  );
  const Icon = isImage ? FileImage : FileText;
  return <Icon className={className} />;
}

function AttachmentCard({ att, onView }) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if file type is viewable (images and PDFs)
  const isViewable = () => {
    const fileType = (att.fileType || '').toLowerCase();
    const viewableTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'];
    return viewableTypes.includes(fileType);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAttachment(att.filePath || att.url, att.name || att.fileName);
      // Toast is already shown by API
    } catch (error) {
      console.error("Download error:", error);
      // Toast is already shown by API
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = () => {
    if (onView && isViewable()) {
      onView(att);
    }
  };

  return (
    <div className="bg-background border rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg shrink-0 bg-red-100 text-red-600">
          <AttachmentIcon fileType={att.fileType} className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{att.name || att.fileName}</p>
          <p className="text-xs text-muted-foreground">{att.sizeLabel}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* View Button - Only show for viewable file types */}
          {isViewable() && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent transition-colors"
              title="View"
              onClick={handleView}
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          {/* Download Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent transition-colors"
            title="Download"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


function ChatBubble({ msg, onImageClick, onAttachmentView, loggedInUser }) {
  let isApplicant
  if (loggedInUser === "admin") {
    isApplicant = msg.sender?.role === "case_officer";
  }
  else {
    isApplicant = msg.sender?.role === "applicant" || msg.sender?.role === "candidate";
  }

  return (
    <>
      <div className={cn("flex", isApplicant ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[500px] rounded-lg p-3",
            loggedInUser === "admin" ? isApplicant ? "bg-blue-50 border border-blue-200" : "bg-muted" : isApplicant ? "bg-muted" : "bg-blue-50 border border-blue-200"
          )}
        >
          {loggedInUser === "admin" ? (
            <p className="text-sm font-medium mb-1">{isApplicant ? msg.sender?.name : (<>
              {msg.firstName ? (<>{`${msg.firstName} ${msg.lastName}`}</>) : (<>
                {msg.sender?.candidateEmail}
              </>)}
            </>)}</p>
          ) : (

            <p className="text-sm font-medium mb-1">{msg.sender?.name ?? "User"}</p>
          )}

          {/* Text Content */}
          {(msg.text || msg.content) && (
            <p className="text-sm whitespace-pre-wrap mb-2">{msg.text || msg.content}</p>
          )}

          {/* Images */}
          {(msg.type === "images" || msg.type === "mixed") && Array.isArray(msg.images) && msg.images.length > 0 && (
            <div className={cn("mt-2 gap-2", msg.images.length > 1 ? "grid grid-cols-2" : "")}>
              {msg.images.map((img) => (
                <div key={img.id} className="rounded-md overflow-hidden border group relative">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-32 sm:h-40 object-cover cursor-pointer"
                    onClick={() => onImageClick(img)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                      title="View"
                      onClick={() => onImageClick(img)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                      title="Download"
                      onClick={() => downloadFile(img.url, img.caption || "image.jpg")}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  {img.caption && (
                    <p className="text-xs text-muted-foreground p-1 bg-background/80">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Attachments (PDFs, docs, etc.) - NOW WITH onView PROP */}
          {(msg.type === "attachments" || msg.type === "mixed") && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {msg.attachments.map((att) => (
                <AttachmentCard key={att.id} att={att} onView={onAttachmentView} />
              ))}
            </div>
          )}

          <p className="text-xs mt-2 text-muted-foreground">{formatTimeLabel(msg.createdAt)}</p>
        </div>
      </div>
    </>
  );
}
// ============================================
// CONSTANTS
// ============================================

const ICON_MAP = {
  MessageCircle,
  Clock,
  CircleCheckBig,
  X,
};

const FILTER_TABS = ["All", "Open", "Pending", "Resolved", "Closed"];

// ============================================
// SUB-COMPONENTS
// ============================================

function StatusCard({ item, onClick }) {
  const IconComponent = ICON_MAP[item.icon];

  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <p className="text-3xl font-bold">{item.count}</p>
          </div>
          <div className={`p-3 rounded-full ${item.bg}`}>
            <IconComponent className={`h-6 w-6 ${item.color}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTER_TABS.map((filter) => (
        <Button
          key={filter}
          variant={activeFilter === filter ? "default" : "outline"}
          className="h-9"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}

function TicketItem({ ticket, isActive, onClick }) {
  const statusLabel = mapStatusLabel(ticket.status);
  const priorityLabel = mapPriorityLabel(ticket.priority);

  return (
    <div
      className={cn(
        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
        isActive && "bg-muted"
      )}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm line-clamp-1">
            {ticket.subject.charAt(0).toUpperCase()}{ticket.subject.slice(1)}
          </p>
          {priorityLabel && (
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent",
              priorityPillClass(priorityLabel)
            )}
            >
              {priorityLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {ticket.category || "General"}
          </span>
          {/* ✅ Add Sub-Category Badge */}
          {ticket.subCategory && ticket.category === "General" && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
              {mapSubCategoryLabel(ticket.subCategory)}
            </span>
          )}
          {/* <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent",
              priorityPillClass(priorityLabel)
            )}
          >
            {priorityLabel}
          </span> */}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {ticket.preview || "No messages yet"}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className=" flex gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent",
                statusPillClass(statusLabel)
              )}
            >
              {statusLabel}
            </span>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
              {ticket.visaType?.replace("_", " ")}
            </div>
          </div>
          <span className="text-muted-foreground">
            {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Messages:</span> {ticket.messageCount || 0}
        </p>
      </div>
    </div>
  );
}

function TicketsList({ tickets, activeTicketId, onTicketSelect, ticketQuery, onSearchChange, isLoading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Reset to page 1 when search query changes or items list changes significantly
  useEffect(() => {
    setCurrentPage(1);
  }, [ticketQuery, tickets.length]);

  // Calculate pagination indices
  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = tickets.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  return (
    <Card>
      <div className="h-[480px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Your Tickets ({tickets.length})</CardTitle>
          <div className="relative mt-3" style={{ marginTop: "12px" }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search with ticket name…"
              className="pl-9 rounded h-8"
              value={ticketQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-slate-200
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-slate-300" style={{ padding: "0" }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tickets found</p>
              <p className="text-sm text-muted-foreground mt-2">Create a new ticket to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {currentTickets.map((ticket) => (
                <TicketItem
                  key={ticket.ticketNumber}
                  ticket={ticket}
                  isActive={ticket.ticketNumber === activeTicketId}
                  onClick={() => onTicketSelect(ticket.ticketNumber)}
                />
              ))}
            </div>
          )}
        </CardContent>

        <div className="border-t p-3 py-2 flex items-center justify-between gap-2">
          <Button variant="outline" className="h-7 text-xs" disabled={currentPage === 1 || isLoading || tickets.length === 0}
            onClick={handlePrevPage}>
            <ChevronLeft className="h-3 w-3 " />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {tickets.length === 0 ? 0 : currentPage} of {totalPages}
          </span>
          <Button variant="outline" className="h-7 text-xs" disabled={currentPage === totalPages || isLoading || tickets.length === 0}
            onClick={handleNextPage}>
            Next
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ChatPanel({
  ticket,
  tickets,
  messages,
  draft,
  onDraftChange,
  onSendMessage,
  onImageClick,
  onAttachmentView,  // ✅ Add this prop
  isSending,
  candidateEmail,
  visaType,
  userType,
  loggedInUser,
  selectedCandidate,
  setSelectedCandidate,
  handleChangeTicketStatus

}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const STATUS_DROPDOWN_OPTIONS = ["open", "pending", "resolved", "closed"];
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentDropdownStatus, setCurrentDropdownStatus] = useState("open");

  const scrollRef = useRef(null);
  const dropdownRef = useRef(null);


  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  // ✅ 2. Auto-scroll Logic (Scroll to bottom when messages change)
  useEffect(() => {
    if (scrollRef.current) {
      // Smooth scroll to the bottom of the chat container
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, ticket]); // Trigger when messages or the active ticket changes

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const handleSend = async () => {
    await onSendMessage(draft, selectedFile);
    setSelectedFile(null);
    const fileInput = document.getElementById("chat-file-input");
    if (fileInput) fileInput.value = "";
  };
  useEffect(() => {
    if (userType == "case_officer") {
      //found the applicant mail id in case of admin user
      const foundMessage = messages?.find(msg => msg.sender && msg.sender.name === "Applicant");
      setSelectedCandidate(foundMessage?.sender?.candidateEmail);
      console.log("choosenEmails", foundMessage?.sender?.candidateEmail);
    }
    setCurrentDropdownStatus(ticket?.status || "open");

  }, [messages]);



  return (
    <Card>
      <div className="h-[480px] flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 pt-3 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold tracking-tight text-lg">
                  {ticket?.subject ? (<>{ticket?.subject.charAt(0).toUpperCase()}{ticket?.subject.slice(1)}</>) : "Select a ticket"}
                </h3>
                {userType == "case_officer" && (<>

                  <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                    {/* Change Status Dropdown */}
                    <button
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      className="inline-flex items-center gap-2 border rounded-md px-3 py-2 text-sm bg-background hover:bg-accent capitalize"
                    >
                      {currentDropdownStatus}
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {statusDropdownOpen && (
                      <div className="absolute top-full  w-40 rounded-md border bg-popover shadow-md z-50">
                        {STATUS_DROPDOWN_OPTIONS.map((status) => (
                          <div
                            key={status}
                            onClick={() => {
                              setCurrentDropdownStatus(status.toLowerCase());
                              handleChangeTicketStatus(ticket.ticketNumber, status.toLowerCase(), candidateEmail);
                              console.log("choosenticket", ticket);
                              setStatusDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent capitalize"
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                    {currentDropdownStatus !== "resolved" && (<>

                      {/* Mark as Resolved */}
                      <button className="inline-flex items-center justify-center rounded-md bg-green-600 text-white px-3 py-2 text-sm bold hover:bg-green-700"
                        onClick={() => { handleChangeTicketStatus(ticket.ticketNumber, "resolved", candidateEmail) }}>
                        Mark as Resolved
                      </button>
                    </>)}
                  </div>
                </>)}
              </div>
              {ticket && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Ticket Number */}
                  {ticket.firstName && (<>
                    <span className="text-sm text-muted-foreground capitalize">
                      {ticket.firstName} {ticket.lastName} •
                    </span>
                  </>)}
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    {ticket.category || "General"}
                  </span>

                  {/* ✅ Sub-Category Badge - Only show if exists and category is General */}
                  {ticket.subCategory && ticket.category === "General" && (
                    <span className="inline-flex capitalize items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                      {mapSubCategoryLabel(ticket.subCategory).replace("_", " ")}
                    </span>
                  )}

                  {/* Priority Badge */}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent",
                      priorityPillClass(ticket.priority)
                    )}
                  >
                    {mapPriorityLabel(ticket.priority)} Priority
                  </span>


                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-slate-200
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-slate-300" ref={scrollRef}>
          {messages.length === 0 && tickets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {console.log("allMessages", messages)
              }
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id || msg.messageId}
                  msg={msg}
                  onImageClick={onImageClick}
                  onAttachmentView={onAttachmentView}
                  loggedInUser={loggedInUser}
                />
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="shrink-0 bg-border h-[1px] w-full" />
        {ticket?.status === "resolved" ? (<>
          <CardContent className="p-4 bg-green-50 border-t border-green-200">
            <div className="flex items-center gap-2 text-green-900">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">This ticket has been resolved.</p>
            </div>
          </CardContent>
        </>) : (<>
          {ticket?.status === "closed" ? (<>
            <CardContent className="p-4 bg-muted/20">
              <div className="space-y-3">
                {/* Status Message */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">This ticket has been closed by the case team.</p>
                </div>

                {/* Warning Box */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-900">
                    You cannot reopen this ticket again. Please create a new ticket for further assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </>) : (<>
            <div className="p-3 bg-muted/20">
              {selectedFile && (
                <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">

                <Textarea
                  placeholder="Type your message..."
                  className="flex-1 min-h-[70px] bg-background"
                  rows={2}
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  disabled={isSending || !ticket}
                />
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    id="chat-file-input"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.txt"
                  />
                  <Button
                    variant="outline"
                    className="h-8 w-8 px-0"
                    title="Attach"
                    onClick={() => document.getElementById("chat-file-input").click()}
                    disabled={isSending || !ticket}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    className="h-8 w-8 px-0"
                    title="Send"
                    onClick={handleSend}
                    disabled={isSending || !draft.trim() || !ticket}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>)}
        </>)}
      </div>
    </Card>
  );
}


// ============================================
// MAIN COMPONENT
// ============================================

export default function CommunicationsPage() {
  // User info - Replace with actual auth context
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const loggedInUser = useSelector((state) => state?.data?.userData?.user?.user_role);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  useEffect(() => {
    if (userData?.email !== "") {
      setCandidateEmail(userData?.email)
    }
  }, [userData])
  const [candidateEmail, setCandidateEmail] = useState("");
  const [visaType, setVisaType] = useState("work_visa");
  const [userType, setUserType] = useState("candidate");
  useEffect(() => {
    if (loggedInUser == "admin") {
      setUserType("case_officer");
    }
    else {
      setUserType("candidate");
    }
  }, [loggedInUser])

  // State management
  const [ticketQuery, setTicketQuery] = useState("");
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [draft, setDraft] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  // API data state
  const [allMessages, setAllMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  //for founding applicant email id
  const foundMessage = tickets[0]?.messages?.find(msg => msg.sender && msg.sender.name === "Applicant");
  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    open: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
  });

  // Fetch messages on component mount
  useEffect(() => {
    if (candidateEmail !== "") {

      fetchAllMessages();
    }
  }, [candidateEmail, visaType]);

  // Update active ticket when tickets change
  useEffect(() => {
    if (tickets.length > 0 && !activeTicketId) {
      setActiveTicketId(tickets[0].ticketNumber);
    }
  }, [tickets]);

  const [selectedAttachment, setSelectedAttachment] = useState(null);  // ✅ Add 

  // ✅ Add this handler
  const handleAttachmentView = (attachment) => {
    setSelectedAttachment(attachment);
  };



  // Fetch all messages from API
  const fetchAllMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllMessages(candidateEmail, visaType, loggedInUser);

      if (result.success) {

        setAllMessages(result.data.messages);

        // Organize messages into tickets
        const organized = organizeMessagesIntoTickets(result.data.messages, loggedInUser);
        setTickets(organized.tickets);
        console.log("ticketsJson", organized);


        // Calculate status counts
        const counts = {
          open: 0,
          pending: 0,
          resolved: 0,
          closed: 0,
        };

        organized.tickets.forEach((ticket) => {
          const status = ticket.status?.toLowerCase() || "open";

          if (status === "open" || status === "unread") { ticket.category !== null && counts.open++ }
          else if (status == "pending" && ticket.category !== null) counts.pending++;
          else if (status === "resolved" && ticket.category !== null || status === "completed" && ticket.category !== null) counts.resolved++;
          else if (status === "closed" && ticket.category !== null) counts.closed++;
        });

        setStatusCounts(counts);
        // console("statusis",counts);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tickets by status
  const filteredByStatus =
    activeFilter === "All"
      ? tickets
      : tickets.filter((ticket) => {
        const status = mapStatusLabel(ticket.status);
        return status === activeFilter;
      });

  // Filter by search query AND Sort by Date
  const filteredTickets = filteredByStatus
    .filter((ticket) =>
      ticket.subject?.toLowerCase().includes(ticketQuery.trim().toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); // ✅ Sort descending

  // Get active ticket and its messages
  const activeTicket = tickets.find((ticket) => ticket.ticketNumber === activeTicketId) ?? null;
  const activeMessages = activeTicket?.messages || [];

  // Send message handler
  const handleSendMessage = async (messageText, file = null) => {
    if (!messageText.trim() || !activeTicket) return;

    setIsSending(true);

    try {
      const result = await sendFollowUpMessage(
        activeTicket.ticketNumber,  // ✅ Pass ticketId first
        messageText,
        candidateEmail,
        visaType,
        file,
        userType,
        selectedCandidate
      );

      if (result.success) {
        // Refresh messages
        await fetchAllMessages();
        setDraft("");
      } else {
        // alert(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  // Send message handler
  const handleChangeTicketStatus = async (ticketChosen, choosenstatus, candidateEmail) => {


    try {
      const result = await changeTicketStatus(
        ticketChosen, choosenstatus, candidateEmail
      );
      console.log("results of data", result)
      if (result.status == "success") {
        // Refresh messages
        await fetchAllMessages();
      } else {
        // alert(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // alert("Failed to send message");
    } finally {
    }
  };

  const handleTicketSelect = (ticketNumber) => {
    setActiveTicketId(ticketNumber);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCreateTicket = async (ticketData) => {
    console.log("Ticket created:", ticketData);

    // Refresh messages to show new ticket
    await fetchAllMessages();

    // Show success message
    // alert(`Ticket created successfully! Ticket Number: ${ticketData.ticketNumber}`);
  };

  const handleStatusCardClick = (status) => {
    setActiveFilter(status);
  };

  const STATUS_CARDS = [
    { label: "Open", count: statusCounts.open, icon: "MessageCircle", bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Pending", count: statusCounts.pending, icon: "Clock", bg: "bg-orange-100", color: "text-orange-600" },
    { label: "Resolved", count: statusCounts.resolved, icon: "CircleCheckBig", bg: "bg-green-100", color: "text-green-600" },
    { label: "Closed", count: statusCounts.closed, icon: "X", bg: "bg-gray-100", color: "text-gray-600" },
  ];

  return (
    <>
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            {loggedInUser == "admin" ? (<>
              <h2 className="text-3xl font-bold tracking-tight">Communications Center - Applicants</h2>
              <p className="text-muted-foreground">Manage tickets and communications with applicants</p>

            </>) : (<>
              <h2 className="text-3xl font-bold tracking-tight">Communications </h2>
              <p className="text-muted-foreground">Create tickets and communications with admin</p>

            </>)}
          </div>
          <div className="flex gap-2">
            {loggedInUser == "admin" ? (<>
              <Button variant="outline" onClick={fetchAllMessages} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </>) : (<>
              <Button variant="outline" onClick={fetchAllMessages} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>

              <Button onClick={() => setShowCreateTicket(true)}>
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </>)}

          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_CARDS.map((item, index) => (
            <StatusCard
              key={index}
              item={item}
              onClick={() => { handleStatusCardClick(item.label) }}
            />
          ))}
          {/* {console.log("stattus card",STATUS_CARDS)} */}
        </div>

        {/* Filter Tabs */}
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Main Content: Tickets & Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <TicketsList
              tickets={filteredTickets}
              activeTicketId={activeTicketId}
              onTicketSelect={handleTicketSelect}
              ticketQuery={ticketQuery}
              onSearchChange={setTicketQuery}
              isLoading={isLoading}
              loggedInUser={loggedInUser}
            />
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2 hidden lg:block">
            <ChatPanel
              ticket={activeTicket}
              tickets={filteredTickets}
              messages={activeMessages}
              draft={draft}
              onDraftChange={setDraft}
              onSendMessage={handleSendMessage}
              onImageClick={handleImageClick}
              onAttachmentView={handleAttachmentView}  // ✅ Pass the handler
              isSending={isSending}
              candidateEmail={candidateEmail}
              visaType={visaType}
              userType={userType}
              loggedInUser={loggedInUser}
              selectedCandidate={selectedCandidate}
              setSelectedCandidate={setSelectedCandidate}
              changeTicketStatus={changeTicketStatus}
              fetchAllMessages={fetchAllMessages}
              handleChangeTicketStatus={handleChangeTicketStatus}
            />
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageViewerModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
      {/* ✅ Add Attachment Viewer Modal */}
      {selectedAttachment && (
        <AttachmentViewerModal
          attachment={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        open={showCreateTicket}
        onOpenChange={setShowCreateTicket}
        onSubmit={handleCreateTicket}
        candidateEmail={candidateEmail}
        visaType={visaType}
        loggedInUser={loggedInUser}
      />
    </>
  );
}
