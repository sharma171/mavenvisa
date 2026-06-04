//judgingForm.js
import React, { useState, useEffect, useCallback } from "react";
import { Gavel, Trash2, Save, Plus, Image, FileText, Eye, Download, Clock } from "lucide-react";
import toast from "react-hot-toast";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import { convertFilesToBase64 } from "utils/fileutils";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";
import PDFViewerModal from "./formsPdfViewModal";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

// ✅ Move components outside to prevent re-creation
const Btn = ({ children, variant, className = "", ...props }) => (
  <button
    {...props}
    className={
      variant === "ghost"
        ? `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-destructive hover:text-destructive ${className}`
        : variant === "outline"
          ? `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full ${className}`
          : `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full ${className}`
    }
  >
    {children}
  </button>
);

const Inp = (props) => (
  <input
    {...props}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
  />
);

const Lbl = ({ children, ...props }) => (
  <label
    {...props}
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {children}
  </label>
);

const Textarea = (props) => (
  <textarea
    {...props}
    rows={props.rows || 3}
    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  />
);

const CardWrap = ({ children }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">{children}</div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold tracking-tight ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// ✅ Memoized component with file operation handlers
const RoleCard = React.memo(
  ({ 
    role, 
    index, 
    onUpdate, 
    onRemove, 
    viewFile,
    handleDownloadFile,
    handleViewFile,
    handleDeleteFile,
    viewingFileId,
    downloadingFileId,
    deletingFileId,
    getFileIcon
  }) => {
    return (
      <CardWrap>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Judging Role #{index + 1}</CardTitle>
            <Btn onClick={() => onRemove(index, role)} variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Btn>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Lbl>Organization/Publication *</Lbl>
              <Inp
                placeholder="e.g., Nature Medicine, IEEE Conference"
                value={role.organization || ""}
                onChange={(e) => onUpdate(index, "organization", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Lbl>Role/Position *</Lbl>
              <Inp
                placeholder="e.g., Peer Reviewer, Grant Panel Member, Competition Judge"
                value={role.title || ""}
                onChange={(e) => onUpdate(index, "title", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Lbl>Time Period *</Lbl>
            <Inp
              placeholder="e.g., 2020-present, March 2023, 2019-2022"
              value={role.period || ""}
              onChange={(e) => onUpdate(index, "period", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Lbl>Description & Scope *</Lbl>
            <Textarea
              placeholder="Describe your judging responsibilities..."
              value={role.description || ""}
              onChange={(e) => onUpdate(index, "description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Lbl>Supporting Documents</Lbl>
            <FileUpload
              files={Array.isArray(role.files) ? role.files.filter((f) => f instanceof File) : []}
              onFilesChange={(files) => onUpdate(index, "files", files)}
              maxFiles={5}
              viewFile={viewFile}
              existingFiles={[...(role?.existingFiles || []), ...(role?.documents || [])]}
            />
          </div>

          {/* Display uploaded files with view/download/delete */}
          {role?.file_names?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files</h4>
              <div className="space-y-2">
                {role.file_names.map((file, fileIndex) => {
                  const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                  const fileId = `${role.id || index}-${fileIndex}`;

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
                          onClick={() => handleViewFile(displayFileName, role, index)}
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
                          onClick={() => handleDownloadFile(displayFileName, role, index)}
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
                          onClick={() => handleDeleteFile(displayFileName, role, index)}
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
      </CardWrap>
    );
  },
  // ✅ Custom comparison
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.role.organization === nextProps.role.organization &&
      prevProps.role.title === nextProps.role.title &&
      prevProps.role.period === nextProps.role.period &&
      prevProps.role.description === nextProps.role.description &&
      prevProps.role.files === nextProps.role.files &&
      JSON.stringify(prevProps.role.file_names) === JSON.stringify(nextProps.role.file_names) &&
      prevProps.viewingFileId === nextProps.viewingFileId &&
      prevProps.downloadingFileId === nextProps.downloadingFileId &&
      prevProps.deletingFileId === nextProps.deletingFileId &&
      prevProps.onUpdate === nextProps.onUpdate &&
      prevProps.onRemove === nextProps.onRemove &&
      prevProps.viewFile === nextProps.viewFile
    );
  }
);

export default function JudgingForm({
  data = {},
  isNewApplication = false,
  existingData: propExistingData = [],
  submittedApplicationData,
  setFilePreview,
  currentCriteria,
  deleteCriteria,
  applicationSave,
  setApplicationSave,
  onFormDataChange,
}) {
  const [roles, setRoles] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // File operation states
  const [viewingFileId, setViewingFileId] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');

  const UPLOAD_URL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";
  const existingData = Array.isArray(propExistingData) ? propExistingData : [];
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";
  const application_id = localStorage.getItem("firebaseId");
  const criteria_number = currentCriteria?.criteria_number || "4";
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
      criterion: "judging",
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
      criterion: "judging",
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
      criterion: "judging",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setRoles(prev => 
            prev.map((r, i) => 
              i === index 
                ? { 
                    ...r, 
                    file_names: r.file_names?.filter(f => f !== fileName) || [] 
                  }
                : r
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

  // ✅ Load data only once and store initial state
  useEffect(() => {
    if (isInitialized) return;

    let formattedData = [];

    if (data?.judging?.length) {
      formattedData = data.judging.map((item, idx) => ({
        id: item.id || `judging-${Date.now()}-${idx}`,
        organization: item.organization || "",
        title: item.title || "",
        period: item.period || "",
        description: item.description || "",
        supporting_documentation: item.supporting_documentation || "",
        files: [],
        existingFiles: item.existingFiles || [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    } else if (Array.isArray(existingData) && existingData.length > 0 && !isNewApplication) {
      formattedData = existingData.map((item, idx) => ({
        id: item.id || `judging-${Date.now()}-${idx}`,
        organization: item.organization || "",
        title: item.title || "",
        period: item.period || "",
        description: item.description || "",
        supporting_documentation: item.supporting_documentation || "",
        files: [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    }

    setRoles(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.judging, existingData, isNewApplication, isInitialized]);

  // ✅ Helper function to check if data has changed from initial state
  const hasDataChanged = useCallback((current, initial) => {
    if (!initial) return current.length > 0;

    if (current.length !== initial.length) return true;

    return current.some((item, index) => {
      const initialItem = initial[index] || {};

      if ((item.organization || "") !== (initialItem.organization || "")) return true;
      if ((item.title || "") !== (initialItem.title || "")) return true;
      if ((item.period || "") !== (initialItem.period || "")) return true;
      if ((item.description || "") !== (initialItem.description || "")) return true;
      if ((item.supporting_documentation || "") !== (initialItem.supporting_documentation || "")) return true;

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
      saveAllRoles();
    }
  }, [applicationSave]);

  // ✅ Update onFormDataChange to check for actual changes
  useEffect(() => {
    if (!isInitialized) return;

    const changed = hasDataChanged(roles, initialData);
    setHasChanges(changed);

    if (onFormDataChange) {
      console.log("🔔 Judging form data changed:", changed, "items:", roles.length);
      onFormDataChange(changed);
    }
  }, [roles, initialData, isInitialized, hasDataChanged, onFormDataChange]);

  const addRole = useCallback(() => {
    setRoles((prev) => [
      ...prev,
      {
        id: `judging-${Date.now()}`,
        organization: "",
        title: "",
        period: "",
        description: "",
        supporting_documentation: "",
        files: [],
        documents: [],
        existingFiles: [],
        file_names: [],
      },
    ]);
  }, []);

  const removeRole = useCallback(
    (index, item) => {
      let newItem = structuredClone(item);
      if (!newItem?.item_id) {
        newItem.item_id = item?.id;
      }
      if (!newItem?.criteria_number) {
        newItem.criteria_number = criteria_number;
      }

      setRoles((prev) => prev.filter((_, i) => i !== index));
      deleteCriteria(newItem);
    },
    [criteria_number, deleteCriteria]
  );

  // ✅ Update function to sync data back to parent
  const updateRole = useCallback((index, field, value) => {
    setRoles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const saveAllRoles = async () => {
    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const criterion_data = roles.map((roleData, index) => {
        const fileList = roleData.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: roleData.id || `judging-${index + 1}`,
          organization: roleData.organization || "",
          title: roleData.title || "",
          period: roleData.period || "",
          description: roleData.description || "",
          supporting_documentation: roleData.supporting_documentation || "",
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "judging",
        criterion_data,
        ui_progress: {
          current_step: "judging",
          completed_steps: ["judging"],
          percentage: 30,
        },
      };

      const anyFirebaseId = roles.find((r) => r.firebase_doc_id)?.firebase_doc_id || TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      roles.forEach((roleData) => {
        (roleData.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        roles.forEach((r) => {
          r.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (Array.isArray(resData.uploaded_documents)) {
        roles.forEach((r) => {
          r.existingFiles = [...(r.existingFiles || []), ...resData.uploaded_documents];
          r.files = [];
        });
      }

      setRoles([...roles]);
      setInitialData(JSON.parse(JSON.stringify(roles)));
      toast.success("Criteria Added Successfully");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Something went wrong.";
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
        <Gavel className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Judging the Work of Others</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of serving as a judge of the work of others in the same or an allied field of specialization.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Letters of invitation to serve as peer reviewer</li>
            <li>• Documentation of panel participation or committee service</li>
            <li>• Public listings of judges or reviewers</li>
            <li>• Acknowledgments in published works or conferences</li>
          </ul>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Gavel className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No judging roles added yet. Click "Add Judging Role" to get started.</p>
        </div>
      )}

      {/* ✅ Use role.id as key and pass file operation handlers */}
      {roles.map((role, index) => (
        <RoleCard
          key={role.id || index}
          index={index}
          role={role}
          onUpdate={updateRole}
          onRemove={removeRole}
          viewFile={setFilePreview}
          handleDownloadFile={handleDownloadFile}
          handleViewFile={handleViewFile}
          handleDeleteFile={handleDeleteFile}
          viewingFileId={viewingFileId}
          downloadingFileId={downloadingFileId}
          deletingFileId={deletingFileId}
          getFileIcon={getFileIcon}
        />
      ))}

      <Btn onClick={addRole} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Judging Role
      </Btn>

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
