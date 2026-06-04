// CreateTicketModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./Sheet";
import { createTicket, isValidFileType, isValidFileSize } from "./communicationApi";

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const Label = ({ children, htmlFor, className }) => (
  <label
    htmlFor={htmlFor}
    className={cn("text-sm font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
  >
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={cn(
      "flex w-full border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      props.className
    )}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={cn(
      "flex min-h-[80px] w-full border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      props.className
    )}
  />
);

const Select = ({ children, value, onValueChange, className, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between px-3 py-2 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
    >
      {children}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>
);

const Button = ({ children, variant = "default", className, disabled, ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8",
  };

  return (
    <button {...props} disabled={disabled} className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </button>
  );
};

const TICKET_CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "evidence", label: "Evidence Clarification" },
  { value: "technical", label: "Technical Support" },
  { value: "documents", label: "Documents Request" },
  { value: "status", label: "Status Update" },
];

const SUB_CATEGORIES = [
  { value: "awards_prizes", label: "Awards or Prizes" },
  { value: "memberships", label: "Membership in Associations" },
  { value: "media_coverage", label: "Published Material About You" },
  { value: "judging", label: "Judging Work of Others" },
  { value: "original_contributions", label: "Original Contribution" },
  { value: "scholarly_articles", label: "Scholarly Articles" },
  { value: "exhibitions", label: "Exhibitions or Showcases" },
  { value: "leadership_role", label: "Leading or Critical Role" },
  { value: "high_salary", label: "High Salary" },
  { value: "commercial_success", label: "Commercial Success" },
  { value: "critical_role", label: "Critical or Essential Role" }
];

const PRIORITY_OPTIONS = [
  { value: "High", label: "High", description: "Urgent - Requires immediate attention" },
  { value: "Medium", label: "Medium", description: "Normal - Standard response time" },
  { value: "Low", label: "Low", description: "Low - Can be addressed in due course" },
];

export default function CreateTicketModal({ open, onOpenChange, onSubmit, candidateEmail, visaType = "work_visa" }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    priority: "Medium", // Default priority
    message: "",
    file: null,
  });
  const scrollRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Please enter a ticket title");
      return false;
    }

    if (!formData.category) {
      setError("Please select a category");
      return false;
    }

    // ✅ UPDATED: Only validate sub-category for "general" category
    if (formData.category === "general" && !formData.subCategory) {
      setError("Please select a sub-category for general inquiries");
      return false;
    }

    if (!formData.priority) {
      setError("Please select a priority level");
      return false;
    }

    if (!formData.message.trim()) {
      setError("Please enter a message");
      return false;
    }

    if (formData.message.trim().length < 10) {
      setError("Message must be at least 10 characters long");
      return false;
    }

    // Validate file if present
    if (formData.file) {
      if (!isValidFileType(formData.file)) {
        setError("Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, TXT");
        return false;
      }

      if (!isValidFileSize(formData.file, 10)) {
        setError("File size must be less than 10MB");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to create ticket
      const result = await createTicket(formData, candidateEmail, visaType);

      if (result.success) {
        // Show success message
        console.log("Ticket created successfully:", result.data);

        // Call parent onSubmit callback if provided
        if (onSubmit) {
          onSubmit(result.data);
        }

        // Reset form
        resetForm();

        // Close modal
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Failed to create ticket");
      }
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError(err.message || "An error occurred while creating the ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);

      // Validate file type
      if (!isValidFileType(file)) {
        setError("Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, TXT");
        return;
      }

      // Validate file size (10MB limit)
      if (!isValidFileSize(file, 10)) {
        setError("File size must be less than 10MB");
        return;
      }

      setFormData({ ...formData, file });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
    setError(null);
    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };
  useEffect(() => {
    if (formData.category !== "general" && formData.subCategory) {
      setFormData({ ...formData, subCategory: "" });
    }
  }, [formData.category]);

  const resetForm = () => {
    setFormData({
      title: "",
      category: "general",
      subCategory: "",
      priority: "Medium",
      message: "",
      file: null,
    });
    setError(null);

    // Reset file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} style={{ gap: "0.5rem" }}>
      <SheetContent onClose={handleClose}>
        {/* Header */}
        <SheetHeader className="px-6 py-4 pb-4 border-b bg-muted/30">
          <SheetTitle className="text-xl">Create New Ticket</SheetTitle>
          <SheetDescription className="text-base">
            Submit a support ticket to connect with our case team
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          <form onSubmit={handleSubmit} className="space-y-2.5 px-6 pt-3">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Ticket Title */}
            <div className="space-y-2.5">
              <Label htmlFor="ticket-title">Ticket Title *</Label>
              <Input
                id="ticket-title"
                placeholder="Brief description of your issue"
                className="rounded-xl h-10 text-base"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2.5">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                className="rounded-xl h-10 text-base"
                disabled={isSubmitting}
              >
                <option value="">Select category...</option>
                {TICKET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sub-Category - Only show for "general" category */}
            {formData.category === "general" && (
              <div className="space-y-2.5">
                <Label>Select Sub-Category *</Label>
                <Select
                  value={formData.subCategory}
                  onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                  className="rounded-xl h-10 text-base"
                  disabled={isSubmitting}
                >
                  <option value="">Select related criterion...</option>
                  {SUB_CATEGORIES.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the criterion related to your question
                </p>
              </div>
            )}

            {/* Priority Field - NEW */}
            <div className="space-y-2.5">
              <Label>Priority Level *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                className="rounded-xl h-10 text-base"
                disabled={isSubmitting}
              >
                <option value=""
                >Select priority...</option>
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.priority && PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.description}
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2.5">
              <Label htmlFor="ticket-message">Message *</Label>
              <Textarea
                id="ticket-message"
                placeholder="Describe your question or issue in detail"
                className="rounded-xl resize-y resize-none text-base leading-relaxed"
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={isSubmitting}
                onClick={() => {
                  scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.message.length} characters (minimum 10)
              </p>
            </div>

            {/* File Attachment */}
            <div className="space-y-2.5">
              <Label>File Attachment (Optional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.txt"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl h-10"
                    onClick={() => document.getElementById("file-upload").click()}
                    disabled={isSubmitting}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    {formData.file ? "Change File" : "Attach File"}
                  </Button>
                  {!formData.file && (
                    <p className="text-sm text-muted-foreground">
                      Max 10MB • PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT
                    </p>
                  )}
                </div>

                {/* File Preview */}
                {formData.file && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{formData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-800 p-1"
                      disabled={isSubmitting}
                      title="Remove file"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-4 py-3 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl min-w-[140px]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Ticket"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
