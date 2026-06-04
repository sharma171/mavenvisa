//leadershipForm.js
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, FilePlus, Crown, Image, FileText, Eye, Download, Clock } from "lucide-react";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import { convertFilesToBase64 } from "utils/fileutils";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";
import PDFViewerModal from "./formsPdfViewModal";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

export default function MembershipForm({
  data = {},
  existingData: propExistingData = [],
  submittedApplicationData,
  setFilePreview,
  currentCriteria,
  deleteCriteria,
  applicationSave,
  setApplicationSave,
  onFormDataChange
}) {
  const [memberships, setMemberships] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loader, setLoader] = useState(false);
  
  // File operation states
  const [viewingFileId, setViewingFileId] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');

  const existingData = Array.isArray(propExistingData) ? propExistingData : [];
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";
  const application_id = localStorage.getItem("firebaseId");

  const criteria_number = currentCriteria?.criteria_number || "8";
  const location = useLocation();
  const newApplication = location?.state?.application;
  const Visa_Type = newApplication || location?.state?.visa_type;

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
      criterion: "leadership_role",
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
      criterion: "leadership_role",
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
      criterion: "leadership_role",
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

  // ... (rest of your existing code: useEffects, hasDataChanged, etc.)

  useEffect(() => {
    if (isInitialized) return;

    let formattedData = [];

    if (Array.isArray(data?.leadership_role) && data.leadership_role.length) {
      formattedData = data.leadership_role.map((item) => ({
        id: item.id,
        organization: item.organization || "",
        title: item.title || "",
        period: item.period || "",
        responsibilities: item.responsibilities || "",
        achievements: item.achievements || "",
        files: [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    } else if (Array.isArray(existingData) && existingData.length > 0) {
      formattedData = existingData.map((item) => ({
        organization: item.organization || "",
        title: item.title || "",
        period: item.period || "",
        responsibilities: item.responsibilities || "",
        achievements: item.achievements || "",
        documents: item.documents || [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        files: [],
      }));
    }

    setMemberships(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.leadership_role, existingData, isInitialized]);

  const hasDataChanged = useCallback((current, initial) => {
    if (!initial) return current.length > 0;
    if (current.length !== initial.length) return true;
    
    return current.some((item, index) => {
      const initialItem = initial[index] || {};
      
      if ((item.organization || "") !== (initialItem.organization || "")) return true;
      if ((item.title || "") !== (initialItem.title || "")) return true;
      if ((item.period || "") !== (initialItem.period || "")) return true;
      if ((item.responsibilities || "") !== (initialItem.responsibilities || "")) return true;
      if ((item.achievements || "") !== (initialItem.achievements || "")) return true;
      
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
  }, []);

  useEffect(() => {
    if (applicationSave === true) {
      saveAllLeadership();
    }
  }, [applicationSave]);

  useEffect(() => {
    if (!isInitialized) return;
    
    const changed = hasDataChanged(memberships, initialData);
    setHasChanges(changed);
    
    if (onFormDataChange) {
      console.log("🔔 Leadership form data changed:", changed, "items:", memberships.length);
      onFormDataChange(changed);
    }
  }, [memberships, initialData, isInitialized, hasDataChanged, onFormDataChange]);

  const addMembership = () => {
    setMemberships((prev) => [
      ...prev,
      {
        organization: "",
        title: "",
        period: "",
        responsibilities: "",
        achievements: "",
        documents: [],
        file_names: [],
        existingFiles: [],
        files: [],
      },
    ]);
  };

  const removeMembership = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    setMemberships((prev) => prev.filter((_, i) => i !== index));
    deleteCriteria(newItem);
  };

  const UPLOAD_URL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";

  const saveAllLeadership = async () => {
    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const criterion_data = memberships.map((membership, index) => {
        const fileList = membership.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: membership.id || `leadership-${index + 1}`,
          organization: membership.organization,
          title: membership.title,
          period: membership.period,
          responsibilities: membership.responsibilities,
          achievements: membership.achievements,
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "leadership_role",
        criterion_data,
        ui_progress: {
          current_step: "leadership_role",
          completed_steps: ["leadership_role"],
          percentage: 60,
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
        err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoader(false);
      setApplicationSave(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Crown className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Leading or Critical Role</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence that you have been employed in a leading or critical role for organizations and establishments that
            have a distinguished reputation.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Organizational charts showing your position</li>
            <li>• Job descriptions and scope of responsibilities</li>
            <li>• Letters from executives about your critical role</li>
            <li>• Evidence of organizational reputation and achievements</li>
          </ul>
        </div>
      </div>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No Leadership added yet. Click "Add Leadership" to get started.</p>
        </div>
      )}

      {memberships.map((membership, index) => (
        <div key={membership.id || index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Leadership Role #{index + 1}</h3>
              <button
                onClick={() => removeMembership(index, membership)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization *</label>
                  <input
                    value={membership.organization}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, organization: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., IEEE, ACM"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position/Title *</label>
                  <input
                    value={membership.title}
                    onChange={(e) =>
                      setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, title: e.target.value } : m)))
                    }
                    placeholder="e.g., Member, Chairperson"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period *</label>
                <input
                  value={membership.period}
                  onChange={(e) =>
                    setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, period: e.target.value } : m)))
                  }
                  placeholder="e.g., Jan 2020 - Present"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Key Responsibilities *</label>
                <textarea
                  value={membership.responsibilities}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, responsibilities: e.target.value } : m))
                    )
                  }
                  placeholder="Describe your responsibilities and contributions..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Key Achievements *</label>
                <textarea
                  value={membership.achievements}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, achievements: e.target.value } : m))
                    )
                  }
                  placeholder="List notable achievements or recognitions..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Documents</label>
                <FileUpload
                  files={Array.isArray(membership?.files) ? membership?.files.filter((f) => f instanceof File) : []}
                  onFilesChange={(files) =>
                    setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, files } : m)))
                  }
                  existingFiles={[...(membership.existingFiles || []), ...(membership?.documents || [])]}
                  maxFiles={5}
                  viewFile={setFilePreview}
                />
              </div>

              {/* Display uploaded files with view/download/delete */}
              {membership?.file_names?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files</h4>
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
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addMembership}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <FilePlus className="w-4 h-4 mr-2" />
        Add Leadership
      </button>

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
}
