//contributionForm.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Lightbulb, Trash2, Save, Plus, Image, FileText, Eye, Download, Clock } from "lucide-react";
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

// ✅ Move component styles outside to prevent re-creation
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
const ContributionCard = React.memo(
  ({ 
    contribution, 
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
            <CardTitle className="text-lg">Contribution #{index + 1}</CardTitle>
            <Btn onClick={() => onRemove(index, contribution)} variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Btn>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Lbl>Contribution Title *</Lbl>
            <Inp
              placeholder="e.g., Novel Algorithm for Real-time Data Processing"
              value={contribution.title || ""}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Lbl>Technical Description *</Lbl>
            <Textarea
              placeholder="Describe the technical innovation, methodology, or creative work..."
              value={contribution.description || ""}
              onChange={(e) => onUpdate(index, "description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Lbl>Impact & Significance *</Lbl>
            <Textarea
              placeholder="Explain how this contribution has been adopted, referenced, or has advanced the field..."
              value={contribution.impact || ""}
              onChange={(e) => onUpdate(index, "impact", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Lbl>Citations/References</Lbl>
              <Inp
                type="number"
                placeholder="Number of citations"
                value={contribution.citations ?? 0}
                onChange={(e) => onUpdate(index, "citations", Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Lbl>Supporting Documents</Lbl>
            <FileUpload
              files={Array.isArray(contribution.files) ? contribution.files.filter((f) => f instanceof File) : []}
              onFilesChange={(files) => onUpdate(index, "files", files)}
              existingFiles={[...(contribution.existingFiles || []), ...(contribution?.documents || [])]}
              maxFiles={5}
              viewFile={viewFile}
            />
          </div>

          {/* Display uploaded files with view/download/delete */}
          {contribution?.file_names?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files</h4>
              <div className="space-y-2">
                {contribution.file_names.map((file, fileIndex) => {
                  const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                  const fileId = `${contribution.id || index}-${fileIndex}`;

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
                          onClick={() => handleViewFile(displayFileName, contribution, index)}
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
                          onClick={() => handleDownloadFile(displayFileName, contribution, index)}
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
                          onClick={() => handleDeleteFile(displayFileName, contribution, index)}
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
  // ✅ Custom comparison function
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.contribution.title === nextProps.contribution.title &&
      prevProps.contribution.description === nextProps.contribution.description &&
      prevProps.contribution.impact === nextProps.contribution.impact &&
      prevProps.contribution.citations === nextProps.contribution.citations &&
      prevProps.contribution.files === nextProps.contribution.files &&
      JSON.stringify(prevProps.contribution.file_names) === JSON.stringify(nextProps.contribution.file_names) &&
      prevProps.viewingFileId === nextProps.viewingFileId &&
      prevProps.downloadingFileId === nextProps.downloadingFileId &&
      prevProps.deletingFileId === nextProps.deletingFileId &&
      prevProps.onUpdate === nextProps.onUpdate &&
      prevProps.onRemove === nextProps.onRemove &&
      prevProps.viewFile === nextProps.viewFile
    );
  }
);

export default function ContributionsForm({
  data = {},
  isNewApplication = false,
  existingData: propExistingData = [],
  submittedApplicationData,
  setFilePreview,
  currentCriteria,
  deleteCriteria,
  applicationSave,
  setApplicationSave,
  onFormDataChange
}) {
  const [contributions, setContributions] = useState([]);
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

  const existingData = Array.isArray(propExistingData) ? propExistingData : [];
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";
  const application_id = localStorage.getItem("firebaseId");

  const criteria_number = currentCriteria?.criteria_number || "5";
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
      criterion: "original_contributions",
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
      criterion: "original_contributions",
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
      criterion: "original_contributions",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setContributions(prev => 
            prev.map((c, i) => 
              i === index 
                ? { 
                    ...c, 
                    file_names: c.file_names?.filter(f => f !== fileName) || [] 
                  }
                : c
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

    if (data?.original_contributions?.length) {
      formattedData = data.original_contributions.map((item, idx) => ({
        id: item.id || `contribution-${Date.now()}-${idx}`,
        title: item.title || "",
        description: item.description || "",
        impact: item.impact || "",
        citations: item.citations || 0,
        supporting_documentation: item.supporting_documentation || "",
        files: [],
        existingFiles: item.existingFiles || [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    } else if (!isNewApplication && Array.isArray(existingData) && existingData.length > 0) {
      formattedData = existingData.map((item, idx) => ({
        id: item.id || `contribution-${Date.now()}-${idx}`,
        title: item.title || "",
        description: item.description || "",
        impact: item.impact || "",
        supporting_documentation: item.supporting_documentation || "",
        citations: item.citations || 0,
        files: [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    }

    setContributions(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.original_contributions, existingData, isNewApplication, isInitialized]);

  // ✅ Helper function to check if data has changed from initial state
  const hasDataChanged = useCallback((current, initial) => {
    if (!initial) return current.length > 0;

    if (current.length !== initial.length) return true;

    return current.some((item, index) => {
      const initialItem = initial[index] || {};

      if ((item.title || "") !== (initialItem.title || "")) return true;
      if ((item.description || "") !== (initialItem.description || "")) return true;
      if ((item.impact || "") !== (initialItem.impact || "")) return true;
      if ((item.supporting_documentation || "") !== (initialItem.supporting_documentation || "")) return true;

      if ((item.citations || 0) !== (initialItem.citations || 0)) return true;

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
      saveAllContributions();
    }
  }, [applicationSave]);

  // ✅ Update onFormDataChange to check for actual changes
  useEffect(() => {
    if (!isInitialized) return;

    const changed = hasDataChanged(contributions, initialData);
    setHasChanges(changed);

    if (onFormDataChange) {
      console.log("🔔 Contributions form data changed:", changed, "items:", contributions.length);
      onFormDataChange(changed);
    }
  }, [contributions, initialData, isInitialized, hasDataChanged, onFormDataChange]);

  const addContribution = useCallback(() => {
    setContributions((prev) => [
      ...prev,
      {
        id: `contribution-${Date.now()}`,
        title: "",
        description: "",
        impact: "",
        supporting_documentation: "",
        citations: 0,
        files: [],
        documents: [],
        existingFiles: [],
        file_names: [],
      },
    ]);
  }, []);

  const removeContribution = useCallback(
    (index, item) => {
      let newItem = structuredClone(item);
      if (!newItem?.item_id) {
        newItem.item_id = item?.id;
      }
      if (!newItem?.criteria_number) {
        newItem.criteria_number = criteria_number;
      }

      setContributions((prev) => prev.filter((_, i) => i !== index));
      deleteCriteria(newItem);
    },
    [criteria_number, deleteCriteria]
  );

  const updateContribution = useCallback((index, field, value) => {
    setContributions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const UPLOAD_URL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";

  const saveAllContributions = async () => {
    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const criterion_data = contributions.map((contributionData, index) => {
        const fileList = contributionData.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: contributionData.id || `contribution-${index + 1}`,
          title: contributionData.title || "",
          description: contributionData.description || "",
          impact: contributionData.impact || "",
          citations: contributionData.citations || 0,
          supporting_documentation: contributionData.supporting_documentation || "",
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "original_contributions",
        criterion_data,
        ui_progress: {
          current_step: "original_contributions",
          completed_steps: ["original_contributions"],
          percentage: 40,
        },
      };

      const anyFirebaseId = contributions.find((c) => c.firebase_doc_id)?.firebase_doc_id || TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      contributions.forEach((c) => {
        (c.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        contributions.forEach((c) => {
          c.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (Array.isArray(resData.uploaded_documents)) {
        contributions.forEach((c) => {
          c.existingFiles = [...(c.existingFiles || []), ...resData.uploaded_documents];
          c.files = [];
        });
      }

      setContributions([...contributions]);
      setInitialData(JSON.parse(JSON.stringify(contributions)));
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
        <Lightbulb className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Original Contributions of Major Significance</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of original scientific, scholarly, artistic, athletic, or business-related contributions of major
            significance to the field.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Patents, publications, or products showing originality</li>
            <li>• Evidence of adoption or implementation by others</li>
            <li>• Citation analysis and impact metrics</li>
            <li>• Letters from experts explaining significance</li>
          </ul>
        </div>
      </div>

      {contributions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No contributions added yet. Click "Add Contribution" to get started.</p>
        </div>
      )}

      {contributions.map((c, index) => (
        <ContributionCard
          key={c.id || index}
          index={index}
          contribution={c}
          onUpdate={updateContribution}
          onRemove={removeContribution}
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

      <Btn onClick={addContribution} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Contribution
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
