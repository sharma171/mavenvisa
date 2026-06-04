// mediaform.js
import React, { useState, useEffect, useCallback } from "react";
import { Newspaper, Trash2, Save, Plus, Image, FileText, Eye, Download, Clock } from "lucide-react";
import toast from "react-hot-toast";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import DatePicker from "react-datepicker";
import "./formsStyling.css";
import "react-datepicker/dist/react-datepicker.css";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";
import PDFViewerModal from "./formsPdfViewModal";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

export default function MediaForm({
  data = {},
  draftData = {},
  isNewApplication = false,
  existingData: propExistingData = [],
  saving: propSaving = false,
  submittedApplicationData,
  setFilePreview,
  currentCriteria,
  deleteCriteria,
  applicationSave,
  setApplicationSave,
  onFormDataChange
}) {
  const [coverage, setCoverage] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // File operation states
  const [viewingFileId, setViewingFileId] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');
  
  const UPLOAD_URL =
    "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";
  const [loader, setLoader] = useState(false);
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";
  const application_id = localStorage.getItem("firebaseId");
  const saving = !!propSaving;

  const criteria_number = currentCriteria?.criteria_number || "3";
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
      criterion: "media_coverage",
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
      criterion: "media_coverage",
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
      criterion: "media_coverage",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setCoverage(prev => 
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

  // ✅ Initialize coverage from data / draft / existing - ONLY ONCE
  useEffect(() => {
    if (isInitialized) return;

    let formattedData = [];

    if (data?.media_coverage?.length) {
      formattedData = data.media_coverage.map((item) => ({
        id: item.id,
        title: item.title || "",
        publication: item.publication || "",
        date: item.date ? new Date(item.date) : null,
        circulation: item.circulation || "",
        url: item.url || "",
        files: [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        documents: item.documents || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    } else if (draftData && Object.keys(draftData).length > 0) {
      formattedData = [
        {
          publication: draftData.organization || "",
          title: draftData.title || "",
          date: draftData.date ? new Date(draftData.date) : null,
          circulation: "",
          url: draftData.url || "",
          files: [],
          documents: [],
          file_names: [],
          existingFiles: [],
        },
      ];
    } else if (
      !isNewApplication &&
      Array.isArray(propExistingData) &&
      propExistingData.length > 0
    ) {
      formattedData = propExistingData.map((item) => ({
        publication: item.publication || "",
        title: item.title || "",
        date: item.date ? new Date(item.date) : null,
        circulation: item.circulation || "",
        url: item.url || "",
        files: [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    }

    setCoverage(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.media_coverage, draftData, propExistingData, isNewApplication, isInitialized]);

  // ✅ Helper function to check if data has changed from initial state
  const hasDataChanged = useCallback((current, initial) => {
    if (!initial) return current.length > 0;
    
    if (current.length !== initial.length) return true;
    
    return current.some((item, index) => {
      const initialItem = initial[index] || {};
      
      if ((item.title || "") !== (initialItem.title || "")) return true;
      if ((item.publication || "") !== (initialItem.publication || "")) return true;
      if ((item.circulation || "") !== (initialItem.circulation || "")) return true;
      if ((item.url || "") !== (initialItem.url || "")) return true;
      
      const currentDate = item.date instanceof Date ? item.date.toISOString() : item.date || "";
      const initialDate = initialItem.date instanceof Date ? initialItem.date.toISOString() : initialItem.date || "";
      if (currentDate !== initialDate) return true;
      
      if (Array.isArray(item.files) && item.files.length > 0) return true;
      
      const currentExistingCount = (item.existingFiles?.length || 0) + (item.documents?.length || 0) + (item.file_names?.length || 0);
      const initialExistingCount = (initialItem.existingFiles?.length || 0) + (initialItem.documents?.length || 0) + (initialItem.file_names?.length || 0);
      if (currentExistingCount !== initialExistingCount) return true;
      
      return false;
    });
  }, []);

  // ✅ Update onFormDataChange to check for actual changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const changed = hasDataChanged(coverage, initialData);
    setHasChanges(changed);
    
    if (onFormDataChange) {
      console.log("🔔 Media coverage form data changed:", changed, "items:", coverage.length);
      onFormDataChange(changed);
    }
  }, [coverage, initialData, isInitialized, hasDataChanged, onFormDataChange]);

  useEffect(() => {
    if (applicationSave === true) {
      saveAllCoverage();
    }
  }, [applicationSave]);

  const addCoverage = () => {
    setCoverage((prev) => [
      ...prev,
      {
        publication: "",
        title: "",
        date: null,
        circulation: "",
        url: "",
        files: [],
        documents: [],
        file_names: [],
        existingFiles: [],
      },
    ]);
  };

  const removeCoverage = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    setCoverage((prev) => prev.filter((_, i) => i !== index));
    deleteCriteria(newItem);
  };

  const handleCoverageChange = useCallback((index, newData) => {
    setCoverage((prev) => {
      const updated = [...prev];
      updated[index] = newData;
      return updated;
    });
  }, []);

  const saveCoverage = async (item, index) => {
    if (!item.publication || !item.title || !item.date) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const fileList = item.files || [];
      const file_names = fileList.map((file) => file.name);

      const criterionItem = {
        id: item.id || `media-${index + 1}`,
        title: item.title,
        publication: item.publication,
        date:
          item.date instanceof Date
            ? item.date.toISOString().split("T")[0]
            : item.date,
        circulation: item.circulation,
        url: item.url,
        file_names,
      };

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "media_coverage",
        criterion_data: [criterionItem],
        ui_progress: {
          current_step: "media_coverage",
          completed_steps: ["media_coverage"],
          percentage: 30,
        },
      };

      if (item.firebase_doc_id || TemporaryId) {
        metaData.firebase_doc_id = item.firebase_doc_id || TemporaryId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));
      fileList.forEach((file) => formData.append(file.name, file));

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        item.firebase_doc_id = resData.firebase_doc_id;
      }

      if (Array.isArray(resData.uploaded_documents)) {
        item.existingFiles = [
          ...(item.existingFiles || []),
          ...resData.uploaded_documents,
        ];
      }

      item.files = [];
      const updated = [...coverage];
      updated[index] = item;
      setCoverage(updated);

      toast.success(resData.message || "Media coverage saved successfully");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoader(false);
    }
  };

  async function saveAllCoverage() {
    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const criterion_data = coverage.map((item, index) => {
        const fileList = item.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: item.id || `media-${index + 1}`,
          title: item.title || "",
          publication: item.publication || "",
          date:
            item.date instanceof Date
              ? item.date.toISOString().split("T")[0]
              : item.date || "",
          circulation: item.circulation || "",
          url: item.url || "",
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "media_coverage",
        criterion_data,
        ui_progress: {
          current_step: "media_coverage",
          completed_steps: ["media_coverage"],
          percentage: 30,
        },
      };

      const anyFirebaseId =
        coverage.find((c) => c.firebase_doc_id)?.firebase_doc_id ||
        TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      coverage.forEach((item) => {
        (item.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        coverage.forEach((c) => {
          c.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (Array.isArray(resData.uploaded_documents)) {
        coverage.forEach((c) => {
          c.existingFiles = [
            ...(c.existingFiles || []),
            ...resData.uploaded_documents,
          ];
          c.files = [];
        });
      }

      setCoverage([...coverage]);
      setInitialData(JSON.parse(JSON.stringify(coverage)));
      toast.success("Criteria Added Successfully");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoader(false);
      setApplicationSave(false);
    }
  }

  const Btn = ({ children, ...props }) => (
    <button
      {...props}
      className={
        props.variant === "ghost"
          ? "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-destructive hover:text-destructive"
          : props.variant === "outline"
            ? "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            : "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
      }
    >
      {children}
    </button>
  );

  const Inp = (props) => (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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

  const Card = ({ children, className = "" }) => (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {children}
    </div>
  );

  const CardHeader = ({ children, className = "" }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );

  const CardTitle = ({ children, className = "" }) => (
    <h3 className={`font-semibold tracking-tight text-lg ${className}`}>
      {children}
    </h3>
  );

  const CardContent = ({ children, className = "" }) => (
    <div className={`p-6 pt-0 space-y-4 ${className}`}>{children}</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Newspaper className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">
            Published Material About You
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Articles, interviews, or features about you and your work in
            professional publications, major trade publications, or major media.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc ml-5">
            <li>Copies of articles, press clippings, or online features</li>
            <li>Publication circulation data or website analytics</li>
            <li>Translations if articles are in foreign languages</li>
            <li>Context about the publication&apos;s reputation and reach</li>
          </ul>
        </div>
      </div>

      {coverage.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No media coverage added yet. Click "Add Media Coverage" to get started.</p>
        </div>
      )}

      {coverage.map((item, index) => (
        <CoverageCard
          key={item.id || index}
          item={item}
          index={index}
          onChange={handleCoverageChange}
          removeCoverage={removeCoverage}
          setFilePreview={setFilePreview}
          saving={saving}
          saveCoverage={saveCoverage}
          handleDownloadFile={handleDownloadFile}
          handleViewFile={handleViewFile}
          handleDeleteFile={handleDeleteFile}
          viewingFileId={viewingFileId}
          downloadingFileId={downloadingFileId}
          deletingFileId={deletingFileId}
          getFileIcon={getFileIcon}
          Btn={Btn}
          Inp={Inp}
          Lbl={Lbl}
          Card={Card}
          CardHeader={CardHeader}
          CardTitle={CardTitle}
          CardContent={CardContent}
        />
      ))}

      <Btn onClick={addCoverage} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Media Coverage
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

// Separate card component with its own local state
function CoverageCard({
  item,
  index,
  onChange,
  removeCoverage,
  setFilePreview,
  saving,
  saveCoverage,
  handleDownloadFile,
  handleViewFile,
  handleDeleteFile,
  viewingFileId,
  downloadingFileId,
  deletingFileId,
  getFileIcon,
  Btn,
  Inp,
  Lbl,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
}) {
  const [localData, setLocalData] = useState({ ...item });

  useEffect(() => {
    setLocalData({ ...item });
  }, [JSON.stringify(item)]);

  const syncToParent = useCallback(() => {
    onChange(index, localData);
  }, [index, localData, onChange]);

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle>Media Coverage #{index + 1}</CardTitle>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => removeCoverage(index, item)}
            aria-label={`Remove Media Coverage ${index + 1}`}
            title={`Remove Media Coverage ${index + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </Btn>
        </div>
      </CardHeader>

      <CardContent className="forms-UI">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Lbl htmlFor={`media-publication-${index}`}>
              Publication/Media Outlet *
            </Lbl>
            <Inp
              id={`media-publication-${index}`}
              placeholder="e.g., The New York Times, Nature, IEEE Spectrum"
              value={localData.publication || ""}
              onChange={(e) =>
                setLocalData((prev) => ({
                  ...prev,
                  publication: e.target.value,
                }))
              }
              onBlur={syncToParent}
            />
          </div>

          <div className="space-y-2 coloumnform">
            <Lbl htmlFor={`media-date-${index}`} style={{ height: "18.4px" }}>
              Publication Date *
            </Lbl>

            <DatePicker
              id={`media-date-${index}`}
              selected={
                localData.date instanceof Date
                  ? localData.date
                  : localData.date
                    ? new Date(localData.date)
                    : null
              }
              onChange={(date) => {
                const newData = { ...localData, date };
                setLocalData(newData);
                onChange(index, newData);
              }}
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
        </div>

        <div className="space-y-2 mt-4">
          <Lbl htmlFor={`media-title-${index}`}>Article Title *</Lbl>
          <Inp
            id={`media-title-${index}`}
            value={localData.title || ""}
            onChange={(e) =>
              setLocalData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            onBlur={syncToParent}
          />
        </div>

        <div className="space-y-2 mt-4">
          <Lbl htmlFor={`media-circulation-${index}`}>Circulation/Reach</Lbl>
          <Inp
            id={`media-circulation-${index}`}
            value={localData.circulation || ""}
            onChange={(e) =>
              setLocalData((prev) => ({
                ...prev,
                circulation: e.target.value,
              }))
            }
            onBlur={syncToParent}
          />
        </div>

        <div className="space-y-2 mt-4">
          <Lbl htmlFor={`media-url-${index}`}>URL</Lbl>
          <Inp
            id={`media-url-${index}`}
            type="url"
            value={localData.url || ""}
            onChange={(e) =>
              setLocalData((prev) => ({
                ...prev,
                url: e.target.value,
              }))
            }
            onBlur={syncToParent}
          />
        </div>

        <div className="space-y-2 mt-4">
          <Lbl>Upload Documents</Lbl>
          <FileUpload
            viewFile={setFilePreview}
            files={
              Array.isArray(localData.files)
                ? localData.files.filter((f) => f instanceof File)
                : []
            }
            onFilesChange={(files) => {
              const filtered = files.filter((f) => f instanceof File);
              const newData = { ...localData, files: filtered };
              setLocalData(newData);
              onChange(index, newData);
            }}
            existingFiles={[
              ...(localData.existingFiles || []),
              ...(localData.documents || []),
            ]}
            maxFiles={5}
          />
        </div>

        {/* Display uploaded files with view/download/delete */}
        {localData?.file_names?.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <div className="space-y-2">
              {localData.file_names.map((file, fileIndex) => {
                const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                const fileId = `${item.id || index}-${fileIndex}`;

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
                        onClick={() => handleViewFile(displayFileName, item, index)}
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
                        onClick={() => handleDownloadFile(displayFileName, item, index)}
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
                        onClick={() => handleDeleteFile(displayFileName, item, index)}
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
}
