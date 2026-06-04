//AwardsForms.jsx
import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, Image, File, X, Eye, Download, Clock } from "lucide-react";
import { Plus, Trophy, Trash2, Save } from "lucide-react";
import FileUpload from "components/FileUpload";
import toast from "react-hot-toast";
import { convertFilesToBase64 } from "utils/fileutils";
import DatePicker from "react-datepicker";
import "./formsStyling.css";
import "react-datepicker/dist/react-datepicker.css";
import { ThemeLoader } from "components";
import axiosApi from "networking/axiosApi";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import PDFViewerModal from "./formsPdfViewModal";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold tracking-tight text-lg ${className}`}>{children}</h3>
);

const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  let base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  if (variant === "ghost") {
    base += " text-destructive hover:text-destructive";
  } else if (variant === "outline") {
    base += " border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2";
    if (size === "sm") {
      base += " text-sm";
    }
  } else {
    base += " bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2";
  }
  if (size === "sm") {
    base += " h-9 px-3";
  } else if (size === "md") {
    base += " h-10";
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = "text", id }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
  />
);

const Label = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1"
  >
    {children}
  </label>
);

const Textarea = ({ value, onChange, placeholder, rows = 3, id }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
    placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      rows === 3 ? "" : rows === 2 ? "min-h-[80px]" : "min-h-[100px]"
    }`}
  />
);

const SelectTrigger = ({ children, onClick, className = "", ariaExpanded }) => (
  <button
    type="button"
    role="combobox"
    aria-expanded={ariaExpanded}
    onClick={onClick}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const SelectValue = ({ placeholder, value }) => <span className="line-clamp-1">{value || placeholder}</span>;

const SelectContent = ({ children, isOpen, onSelect }) =>
  isOpen ? (
    <div
      role="listbox"
      className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onClick: () => onSelect(child.props.value),
        })
      )}
    </div>
  ) : null;

const SelectItem = ({ children, value, onClick }) => (
  <div
    role="option"
    tabIndex={-1}
    className="relative cursor-pointer select-none py-1.5 px-4 hover:bg-accent hover:text-accent-foreground"
    onClick={onClick}
  >
    {children}
  </div>
);

const Select = ({ value, onValueChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleSelect = (val) => {
    onValueChange(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <SelectTrigger onClick={() => setIsOpen((open) => !open)} ariaExpanded={isOpen}>
        <SelectValue placeholder="Select Significance Level" value={value} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </SelectTrigger>
      <SelectContent isOpen={isOpen} onSelect={handleSelect}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </div>
  );
};

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

const AwardsForm = (props) => {
  let {
    data,
    onChange,
    submittedApplicationData,
    setFilePreview,
    currentCriteria,
    deleteCriteria,
    applicationSave,
    setApplicationSave,
    onFormDataChange,
  } = props;

  const [awards, setAwards] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loader, setloader] = useState(false);

  // File operation states
  const [viewingFileId, setViewingFileId] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');

  const application_id = localStorage.getItem("firebaseId");
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";
  const criteria_number = currentCriteria?.criteria_number || "1";
  const location = useLocation();
  const newApplication = location?.state?.application;
  const Visa_Type = newApplication || location?.state?.visa_type;
  const UPLOAD_URL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app";

  // Helper function to get file icon with proper color
  const getFileIcon = (fileName) => {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    
    if (imageExtensions.includes(fileExtension)) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (fileExtension === 'pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  // Handle file download
  const handleDownloadFile = (fileName, item, index) => {
    const fileId = `${item.id || index}-${item.file_names?.indexOf(fileName) || 0}`;
    setDownloadingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "download_file",
      firebase_doc_id: item.firebase_doc_id || application_id,
      criterion: "awards",
      file_name: fileName,
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((res) => {
        const fileData = res.data?.file;

        if (fileData && fileData.base64_content) {
          const byteCharacters = atob(fileData.base64_content);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileData.file_name || fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success('File downloaded successfully');
        } else {
          toast.error("Invalid file data received");
        }
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
        toast.error("File not found");
      })
      .finally(() => {
        setDownloadingFileId(null);
      });
  };

  // Handle file view
  const handleViewFile = (fileName, item, index) => {
    const fileId = `${item.id || index}-${item.file_names?.indexOf(fileName) || 0}`;
    setViewingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "download_file",
      firebase_doc_id: item.firebase_doc_id || application_id,
      criterion: "awards",
      file_name: fileName,
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((res) => {
        const fileData = res.data?.file;

        if (fileData && fileData.base64_content) {
          setCurrentPdfData(fileData.base64_content);
          setCurrentPdfFileName(fileData.file_name || fileName);
          setPdfViewerOpen(true);
        } else {
          toast.error("Invalid file data received");
        }
      })
      .catch((error) => {
        console.error('Error viewing file:', error);
        toast.error("File not found");
      })
      .finally(() => {
        setViewingFileId(null);
      });
  };

  // Handle file delete
  const handleDeleteFile = (fileName, item, index) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    const fileId = `${item.id || index}-${item.file_names?.indexOf(fileName) || 0}`;
    setDeletingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "delete_file",
      firebase_doc_id: item.firebase_doc_id || application_id,
      criterion: "awards",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setAwards(prev => 
            prev.map((a, i) => 
              i === index 
                ? { 
                    ...a, 
                    file_names: a.file_names?.filter(f => f !== fileName) || [] 
                  }
                : a
            )
          );
        } else {
          throw new Error(response.data.message || 'Failed to delete file');
        }
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file: ' + (error.response?.data?.message || error.message));
      })
      .finally(() => {
        setDeletingFileId(null);
      });
  };

  // ✅ Initialize awards from data - ONLY ONCE
  useEffect(() => {
    if (isInitialized) return;

    let formattedData = [];

    if (data?.awards_prizes?.length) {
      formattedData = data.awards_prizes.map((item) => ({
        id: item?.id,
        award_name: item?.award_name || item?.name || item?.title || "",
        issuing_organization: item?.issuing_organization || item?.organization || "",
        date_received: item?.date_received
          ? new Date(item.date_received)
          : item?.date
          ? new Date(item.date)
          : null,
        description: item?.description || "",
        significance_level: item?.significance_level || "national",
        significance_statement: item?.significance_statement || "",
        url: item?.url || "",
        files: [],
        existingFiles: item?.existingFiles || [],
        file_names: item?.file_names || item?.files || [],
        documents: item?.documents || [],
        firebase_doc_id: item?.firebase_doc_id,
      }));
    }

    setAwards(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.awards_prizes, isInitialized]);

  // ✅ Helper function to check if data has changed from initial state
  const hasDataChanged = (current, initial) => {
    if (!initial) return current.length > 0;

    if (current.length !== initial.length) return true;

    return current.some((item, index) => {
      const initialItem = initial[index] || {};

      if ((item.award_name || "") !== (initialItem.award_name || "")) return true;
      if ((item.issuing_organization || "") !== (initialItem.issuing_organization || "")) return true;
      if ((item.description || "") !== (initialItem.description || "")) return true;
      if ((item.significance_level || "") !== (initialItem.significance_level || "")) return true;
      if ((item.significance_statement || "") !== (initialItem.significance_statement || "")) return true;
      if ((item.url || "") !== (initialItem.url || "")) return true;

      const currentDate = item.date_received instanceof Date 
        ? item.date_received.toISOString() 
        : item.date_received || "";
      const initialDate = initialItem.date_received instanceof Date 
        ? initialItem.date_received.toISOString() 
        : initialItem.date_received || "";
      if (currentDate !== initialDate) return true;

      if (Array.isArray(item.files) && item.files.length > 0) return true;

      const currentExistingCount =
        (item.existingFiles?.length || 0) +
        (item.documents?.length || 0) +
        (item.file_names?.length || 0);
      const initialExistingCount =
        (initialItem.existingFiles?.length || 0) +
        (initialItem.documents?.length || 0) +
        (initialItem.file_names?.length || 0);
      if (currentExistingCount !== initialExistingCount) return true;

      return false;
    });
  };

  useEffect(() => {
    if (applicationSave === true) {
      saveAllAwards();
    }
  }, [applicationSave]);

  useEffect(() => {
    onChange({ awards });
  }, [awards, onChange]);

  useEffect(() => {
    if (!isInitialized) return;

    const changed = hasDataChanged(awards, initialData);
    setHasChanges(changed);

    if (onFormDataChange) {
      console.log("🔔 Awards form data changed:", changed, "items:", awards.length);
      onFormDataChange(changed);
    }
  }, [awards, initialData, isInitialized, onFormDataChange]);

  const addAward = () => {
    setAwards([
      ...awards,
      {
        award_name: "",
        issuing_organization: "",
        date_received: null,
        description: "",
        files: [],
        existingFiles: [],
        documents: [],
        file_names: [],
        significance_level: "national",
        significance_statement: "",
        url: "",
      },
    ]);
  };

  const removeAward = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    setAwards(awards.filter((_, i) => i !== index));
    deleteCriteria(newItem);
  };

  const updateAward = (index, field, value) => {
    const updated = [...awards];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setAwards(updated);
  };

  const saveAllAwards = async () => {
    let TemporaryId = localStorage.getItem("firebaseId");
    setloader(true);

    try {
      const criterionData = awards.map((award, idx) => {
        const fileList = award.files || [];
        const fileNames = fileList.map((file) => file.name);

        return {
          id: award.id || `award-${idx + 1}`,
          award_name: award.award_name,
          issuing_organization: award.issuing_organization,
          date_received:
            award.date_received instanceof Date
              ? award.date_received.toISOString().split("T")[0]
              : award.date_received || "",
          description: award.description || "",
          file_names: fileNames,
          significance_level: award.significance_level || "national",
          significance_statement: award.significance_statement || "",
          url: award.url || "",
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "awards",
        criterion_data: criterionData,
        ui_progress: {
          current_step: "awards",
          completed_steps: ["awards"],
          percentage: 10,
        },
      };

      const anyFirebaseId = awards.find((a) => a.firebase_doc_id)?.firebase_doc_id || TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      awards.forEach((award) => {
        (award.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        localStorage.setItem("firebaseId", resData.firebase_doc_id);
        console.log("Firebase ID saved to localStorage:", resData.firebase_doc_id);

        awards.forEach((award) => {
          award.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (resData.application_id) {
        console.log("Application ID:", resData.application_id);
      }

      if (Array.isArray(resData.uploaded_documents)) {
        awards.forEach((award) => {
          award.existingFiles = [...(award.existingFiles || []), ...resData.uploaded_documents];
          award.files = [];
        });
      }

      setAwards([...awards]);
      setInitialData(JSON.parse(JSON.stringify(awards)));
      toast.success("Criteria Added Successfully");
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setloader(false);
      setApplicationSave(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Trophy className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Awards &amp; Prizes Evidence</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Documentation of nationally or internationally recognized prizes or awards for excellence in your field.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc ml-5">
            <li>Award certificates and official documentation</li>
            <li>Selection criteria and competition details</li>
            <li>Media coverage or press releases about the award</li>
            <li>Letters from awarding organizations</li>
          </ul>
        </div>
      </div>

      {awards.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="lucide lucide-trophy w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No awards added yet. Click "Add Award" to get started.</p>
        </div>
      )}

      {awards.map((award, index) => (
        <Card key={award.id || index} className="relative">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle>Award #{index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent text-destructive hover:text-destructive"
                onClick={() => removeAward(index, award)}
                aria-label={`Remove Award ${index + 1}`}
                title={`Remove Award ${index + 1}`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </CardHeader>

          <div className="p-6 pt-0 space-y-4 forms-UI">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`award-name-${index}`}>Award Name *</Label>
                <Input
                  id={`award-name-${index}`}
                  value={award.award_name}
                  onChange={(e) => updateAward(index, "award_name", e.target.value)}
                  placeholder="e.g., Nobel Prize in Physics"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`award-organization-${index}`}>Organization *</Label>
                <Input
                  id={`award-organization-${index}`}
                  value={award.issuing_organization}
                  onChange={(e) => updateAward(index, "issuing_organization", e.target.value)}
                  placeholder="e.g., The Nobel Foundation"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`award-date-${index}`}>Date Received</Label>
                <DatePicker
                  id={`award-date-${index}`}
                  selected={award.date_received}
                  onChange={(date) => updateAward(index, "date_received", date)}
                  showYearDropdown
                  showMonthDropdown
                  showIcon
                  scrollableYearDropdown
                  yearDropdownItemNumber={80}
                  calendarIconClassName="calenderIconRight"
                  filterDate={(date) => date <= new Date()}
                  minDate={new Date("1950-01-01")}
                  maxDate={new Date()}
                  dateFormat="MM/dd/yyyy"
                  inputMode="numeric"
                  pattern="[0-9\\-]*"
                  placeholderText="MM/DD/YYYY"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>

              <div>
                <Label htmlFor={`award-significance-${index}`}>Significance Level</Label>
                <Select
                  value={award.significance_level || "national"}
                  onValueChange={(val) => updateAward(index, "significance_level", val)}
                  className="capitalised"
                  style={{ textTransform: "capitalize" }}
                  options={[
                    { value: "international", label: "International" },
                    { value: "national", label: "National" },
                    { value: "regional", label: "Regional" },
                    { value: "industry", label: "Industry" },
                    { value: "local", label: "Local" },
                  ]}
                  id={`award-significance-${index}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`award-description-${index}`}>Description *</Label>
              <Textarea
                id={`award-description-${index}`}
                value={award.description}
                onChange={(e) => updateAward(index, "description", e.target.value)}
                placeholder="Description *"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor={`award-significance-statement-${index}`}>Significance Statement</Label>
              <Textarea
                id={`award-significance-statement-${index}`}
                value={award.significance_statement}
                onChange={(e) => updateAward(index, "significance_statement", e.target.value)}
                placeholder="Significance Statement"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor={`award-url-${index}`}>URL</Label>
              <Input
                id={`award-url-${index}`}
                type="url"
                placeholder="URL"
                value={award.url}
                onChange={(e) => updateAward(index, "url", e.target.value)}
              />
            </div>

            <div>
              <Label>Supporting Documentation</Label>
              <FileUpload
                viewFile={setFilePreview}
                files={award.files}
                onFilesChange={(files) => updateAward(index, "files", files)}
                existingFiles={award.existingFiles}
                maxFiles={5}
                acceptedFileTypes={[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]}
              />
            </div>

            {/* Display uploaded files with view/download/delete */}
            {award?.file_names?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Files</h4>
                <div className="space-y-2">
                  {award.file_names.map((file, fileIndex) => {
                    const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                    const fileId = `${award.id || index}-${fileIndex}`;

                    return (
                      <div key={fileIndex} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(displayFileName)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{displayFileName}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {/* View Button */}
                          <button
                            className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                            title="View file"
                            onClick={() => handleViewFile(displayFileName, award, index)}
                            disabled={viewingFileId === fileId}
                          >
                            {viewingFileId === fileId ? (
                              <Clock className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>

                          {/* Download Button */}
                          <button
                            className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                            title="Download file"
                            onClick={() => handleDownloadFile(displayFileName, award, index)}
                            disabled={downloadingFileId === fileId}
                          >
                            {downloadingFileId === fileId ? (
                              <Clock className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete file"
                            onClick={() => handleDeleteFile(displayFileName, award, index)}
                            disabled={deletingFileId === fileId}
                          >
                            {deletingFileId === fileId ? (
                              <Clock className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      <Button onClick={addAward} className="mt-2 w-full" variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Add Award
      </Button>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfViewerOpen}
        onClose={() => {
          setPdfViewerOpen(false);
          setCurrentPdfData(null);
          setCurrentPdfFileName('');
        }}
        pdfBase64={currentPdfData}
        fileName={currentPdfFileName}
        onDownload={() => {
          if (currentPdfData) {
            const byteCharacters = atob(currentPdfData);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentPdfFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('File downloaded successfully');
          }
        }}
      />

      <ThemeLoader show={loader} />
    </div>
  );
};

export default AwardsForm;
