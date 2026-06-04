//membershipForm.js
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Users, Save, Eye, Download, Clock } from "lucide-react";
import { Upload, FileText, Image, File, X } from "lucide-react";
import FileUpload from "components/FileUpload";
import DatePicker from "react-datepicker";
import "./formsStyling.css";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import axiosApi from "networking/axiosApi";
import { convertFilesToBase64 } from "utils/fileutils";
import { ThemeLoader } from "components";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import PDFViewerModal from "./formsPdfViewModal";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

function Button({ children, className = "", variant, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  const variants = {
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
    ghost: "hover:bg-accent h-9 rounded-md px-3",
    destructive: "text-destructive hover:text-destructive",
    default: "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
  };
  let classes = `${base} ${variants[variant] || variants.default} ${className}`;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

// Inline Input Component
function Input({ className = "", ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
      {...props}
    />
  );
}

// Inline Label Component
function Label({ children, className = "", ...props }) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

// Inline Textarea Component
function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

// Inline Card Components
function Card({ children, className = "" }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}
function CardHeader({ children, className = "" }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}
function CardTitle({ children, className = "" }) {
  return <h3 className={`font-semibold tracking-tight text-lg ${className}`}>{children}</h3>;
}
function CardContent({ children, className = "" }) {
  return <div className={`p-6 pt-0 space-y-2 ${className}`}>{children}</div>;
}

export default function MembershipsForm(props) {
  let {
    data,
    draftData = {},
    onChange,
    submittedApplicationData,
    setFilePreview,
    currentCriteria,
    deleteCriteria,
    applicationSave,
    setApplicationSave,
    onFormDataChange
  } = props;

  const [memberships, setMemberships] = useState([]);
  const [loader, setloader] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // File operation states
  const [viewingFileId, setViewingFileId] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');

  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const UPLOAD_URL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";

  const application_id = localStorage.getItem("firebaseId");
  const criteria_number = currentCriteria?.criteria_number || "2";
  const location = useLocation();
  const newApplication = location?.state?.application;
  const Visa_Type = newApplication || location?.state?.visa_type;
  const userEmail = userData?.email || "";

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
      criterion: "memberships",
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
      criterion: "memberships",
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
      criterion: "memberships",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setMemberships(prev => 
            prev.map((m, i) => 
              i === index 
                ? { 
                    ...m, 
                    file_names: m.file_names?.filter(f => f !== fileName) || [] 
                  }
                : m
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

  // Update the initialization useEffect
  useEffect(() => {
    if (isInitialized) return;

    if (data && data.memberships && data.memberships.length > 0) {
      const formatted = data.memberships.map((m) => ({
        id: m.id,
        name: m.name || m.membership_type || "",
        organization: m.organization || "",
        membership_type: m.membership_type || m.name || "",
        date_joined: m.date || m.date_joined || "",
        date: m.date || m.date_joined || "",
        criteria: m.description || m.criteria || "",
        description: m.description || m.criteria || "",
        supporting_documentation: Array.isArray(m.supporting_documentation)
          ? m.supporting_documentation
          : typeof m.supporting_documentation === "string" && m.supporting_documentation.trim()
            ? m.supporting_documentation.split(",").map((doc) => doc.trim()).filter(Boolean)
            : [],
        files: [],
        existingFiles: m.existingFiles || [],
        file_names: m.file_names || [],
        documents: m.documents || [],
        firebase_doc_id: m.firebase_doc_id,
      }));
      setMemberships(formatted);
      setInitialData(JSON.parse(JSON.stringify(formatted)));
      setIsInitialized(true);
    } else if (draftData && Object.keys(draftData).length > 0) {
      const draftFormatted = [{
        organization: draftData.organization || "",
        membership_type: draftData.title || "",
        date_joined: draftData.date || "",
        criteria: draftData.description || "",
        supporting_documentation: draftData.supporting_documentation
          ? draftData.supporting_documentation.split(",").map((doc) => doc.trim()).filter(Boolean)
          : [],
        files: [],
        file_names: [],
      }];
      setMemberships(draftFormatted);
      setInitialData(JSON.parse(JSON.stringify(draftFormatted)));
      setIsInitialized(true);
    } else {
      setInitialData([]);
      setIsInitialized(true);
    }
  }, [data, draftData, isInitialized]);

  useEffect(() => {
    if (onChange) {
      onChange({ memberships });
    }
  }, [memberships]);

  useEffect(() => {
    if (applicationSave === true) {
      saveAllMemberships();
    }
  }, [applicationSave]);

  // Add helper function to check if data has changed
  const hasDataChanged = (current, initial) => {
    if (!initial) return current.length > 0;

    if (current.length !== initial.length) return true;

    return current.some((item, index) => {
      const initialItem = initial[index] || {};

      if (item.organization !== initialItem.organization) return true;
      if (item.membership_type !== initialItem.membership_type) return true;
      if (item.date_joined !== initialItem.date_joined) return true;
      if (item.criteria !== initialItem.criteria) return true;

      if (Array.isArray(item.files) && item.files.length > 0) return true;

      const currentExistingCount = (item.existingFiles?.length || 0) + (item.documents?.length || 0) + (item.file_names?.length || 0);
      const initialExistingCount = (initialItem.existingFiles?.length || 0) + (initialItem.documents?.length || 0) + (initialItem.file_names?.length || 0);
      if (currentExistingCount !== initialExistingCount) return true;

      return false;
    });
  };

  useEffect(() => {
    if (!isInitialized) return;

    const changed = hasDataChanged(memberships, initialData);
    setHasChanges(changed);

    if (onFormDataChange) {
      console.log("🔔 Memberships form data changed:", changed, "items:", memberships.length);
      onFormDataChange(changed);
    }
  }, [memberships, initialData, isInitialized, onFormDataChange]);

  // Membership handlers
  const addMembership = () => {
    console.log("➕ Adding membership. Current count:", memberships.length);
    setMemberships((cur) => {
      const newMemberships = [
        ...cur,
        {
          organization: "",
          membership_type: "",
          date_joined: "",
          criteria: "",
          supporting_documentation: [],
          files: [],
          file_names: [],
        },
      ];
      console.log("✅ New memberships count:", newMemberships.length);
      return newMemberships;
    });
  };

  const removeMembership = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    deleteCriteria(newItem);
    setMemberships((cur) => cur.filter((_, i) => i !== index));
  };

  const updateMembership = (index, field, value) => {
    setMemberships((cur) => {
      const up = [...cur];
      if (field === "supporting_documentation") {
        up[index][field] = (value || "").split(",").map((doc) => doc.trim());
      } else if (field === "files") {
        up[index][field] = value;
      } else {
        up[index][field] = value;
      }
      return up;
    });
  };

  async function saveAllMemberships() {
    if (!memberships.length) {
      toast.error("Please add at least one membership before saving.");
      return;
    }

    const invalid = memberships.find(
      (m) => !(m.organization || "").trim() || !(m.membership_type || "").trim()
    );
    if (invalid) {
      toast.error("Please fill in required fields for all memberships before saving.");
      return;
    }

    let TemporaryId = localStorage.getItem("firebaseId");
    setloader(true);

    try {
      const criterion_data = memberships.map((membership, index) => {
        const fileList = membership.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: membership.id || `membership-${index + 1}`,
          organization: membership.organization || "",
          membership_type: membership.membership_type || "",
          date_joined:
            membership.date_joined instanceof Date
              ? membership.date_joined.toISOString().split("T")[0]
              : membership.date_joined || "",
          criteria: membership.criteria || "",
          supporting_documentation: Array.isArray(membership.supporting_documentation)
            ? membership.supporting_documentation.join(", ")
            : typeof membership.supporting_documentation === "string"
              ? membership.supporting_documentation
              : "",
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "memberships",
        criterion_data,
        ui_progress: {
          current_step: "memberships",
          completed_steps: ["memberships"],
          percentage: 15,
        },
      };

      const anyFirebaseId =
        memberships.find((m) => m.firebase_doc_id)?.firebase_doc_id || TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      memberships.forEach((membership) => {
        (membership.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        memberships.forEach((m) => {
          m.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (Array.isArray(resData.uploaded_documents)) {
        memberships.forEach((m) => {
          m.existingFiles = [...(m.existingFiles || []), ...resData.uploaded_documents];
          m.files = [];
        });
      }

      setMemberships([...memberships]);
      setInitialData(JSON.parse(JSON.stringify(memberships)));
      toast.success("Criteria Added Successfully");

    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error(err, "error");
    } finally {
      setloader(false);
      setApplicationSave(false);
    }
  }

  console.log("📊 MembershipsForm render:", {
    membershipsCount: memberships.length,
    isInitialized,
    hasData: data?.memberships?.length,
    hasDraft: Object.keys(draftData).length
  });

  return (
    <div className="space-y-6">
      <ThemeLoader show={loader} />

      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Users className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Professional Memberships</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Memberships in associations that require outstanding achievements judged by experts in the field.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Membership certificates or letters</li>
            <li>• Organization bylaws showing exclusive criteria</li>
            <li>• Evidence of selection process and peer review</li>
            <li>• Lists of notable members or recognition standards</li>
          </ul>
        </div>
      </div>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No memberships added yet. Click "Add Membership" to get started.</p>
        </div>
      )}

      {memberships.map((membership, index) => {
        return (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Membership #{index + 1}</CardTitle>
                <Button
                  onClick={() => removeMembership(index, membership)}
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`org-${index}`}>Organization Name *</Label>
                  <Input
                    id={`org-${index}`}
                    value={membership.organization}
                    onChange={(e) => updateMembership(index, "organization", e.target.value)}
                    placeholder="e.g., American Medical Association"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`type-${index}`}>Membership Type *</Label>
                  <Input
                    id={`type-${index}`}
                    value={membership.membership_type || ""}
                    onChange={(e) => updateMembership(index, "membership_type", e.target.value)}
                    placeholder="e.g., Fellow, Board Member, Distinguished Member"
                  />
                </div>
              </div>

              <div className="space-y-2 input-coloumnform forms-UI">
                <Label htmlFor={`join-date-${index}`}>Date Joined *</Label>
                <DatePicker
                  id={`join-date-${index}`}
                  selected={membership.date_joined ? new Date(membership.date_joined) : null}
                  onChange={(date) => updateMembership(index, "date_joined", date)}
                  showYearDropdown
                  showMonthDropdown
                  showIcon
                  calendarIconClassName="calenderIconRight"
                  toggleCalendarOnIconClick
                  scrollableYearDropdown
                  yearDropdownItemNumber={80}
                  filterDate={(date) => date <= new Date()}
                  minDate={new Date("1950-01-01")}
                  maxDate={new Date()}
                  dateFormat="MM/dd/yyyy"
                  inputMode="numeric"
                  placeholderText="MM/DD/YYYY"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`criteria-${index}`}>Selection Criteria & Process *</Label>
                <Textarea
                  id={`criteria-${index}`}
                  value={membership.criteria || ""}
                  onChange={(e) => updateMembership(index, "criteria", e.target.value)}
                  placeholder="Describe the selection criteria, process, and why this demonstrates extraordinary ability..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <FileUpload
                  viewFile={setFilePreview}
                  files={membership?.files}
                  onFilesChange={(files) => updateMembership(index, "files", files)}
                  existingFiles={[...(membership.existingFiles || []), ...(membership?.documents || [])]}
                  maxFiles={5}
                />
              </div>

              {/* Display uploaded files with view/download/delete */}
              {membership?.file_names?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Documentation</h4>
                  <div className="space-y-2">
                    {membership.file_names.map((file, fileIndex) => {
                      const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                      const fileId = `${membership.id || index}-${fileIndex}`;

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
                              onClick={() => handleViewFile(displayFileName, membership, index)}
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
                              onClick={() => handleDownloadFile(displayFileName, membership, index)}
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
                              onClick={() => handleDeleteFile(displayFileName, membership, index)}
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
            </CardContent>
          </Card>
        );
      })}

      <Button onClick={addMembership} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Membership
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
    </div>
  );
}
