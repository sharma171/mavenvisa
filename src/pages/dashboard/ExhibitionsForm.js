//exhibitionForm.js
import React, { useState, useEffect, useCallback } from "react";
import { Palette, Trash2, Save, Plus, Image, FileText, Eye, Download, Clock } from "lucide-react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "./formsStyling.css";
import "react-datepicker/dist/react-datepicker.css";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import { convertFilesToBase64 } from "utils/fileutils";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";
import PDFViewerModal from "./formsPdfViewModal";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

export default function ExhibitionsForm({
  data = {},
  existingData: propExistingData = [],
  submittedApplicationData,
  setFilePreview,
  currentCriteria,
  deleteCriteria,
  applicationSave,
  setApplicationSave,
  onFormDataChange,
}) {
  const [exhibitions, setExhibitions] = useState([]);
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

  const criteria_number = currentCriteria?.criteria_number || "7";
  const location = useLocation();
  const newApplication = location?.state?.application;
  const Visa_Type = newApplication || location?.state?.visa_type;

  const UPLOAD_URL =
    "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";

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
      criterion: "exhibitions",
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
      criterion: "exhibitions",
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
      criterion: "exhibitions",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setExhibitions(prev => 
            prev.map((ex, i) => 
              i === index 
                ? { 
                    ...ex, 
                    file_names: ex.file_names?.filter(f => f !== fileName) || [] 
                  }
                : ex
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

  // ✅ Initialize from data - ONLY ONCE
  useEffect(() => {
    if (isInitialized) return;

    let formattedData = [];

    if (Array.isArray(data?.exhibitions) && data.exhibitions.length) {
      formattedData = data.exhibitions.map((item) => ({
        id: item.id,
        title: item.title || "",
        venue: item.venue || "",
        date: item.date ? new Date(item.date) : null,
        description: item.description || "",
        supporting_documentation: item.supporting_documentation || "",
        files: [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        documents: item.documents || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    } else if (Array.isArray(existingData) && existingData.length > 0) {
      formattedData = existingData.map((item) => ({
        title: item.title || "",
        venue: item.venue || "",
        date: item.date ? new Date(item.date) : null,
        description: item.description || "",
        supporting_documentation: item.supporting_documentation || "",
        files: [],
        documents: item.documents || [],
        file_names: item.file_names || [],
        existingFiles: item.existingFiles || [],
        firebase_doc_id: item.firebase_doc_id,
      }));
    }

    setExhibitions(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.exhibitions, existingData, isInitialized]);

  // ✅ Helper function to check if data has changed from initial state
  const hasDataChanged = useCallback((current, initial) => {
    if (!initial) return current.length > 0;

    if (current.length !== initial.length) return true;

    return current.some((item, index) => {
      const initialItem = initial[index] || {};

      if ((item.title || "") !== (initialItem.title || "")) return true;
      if ((item.venue || "") !== (initialItem.venue || "")) return true;
      if ((item.description || "") !== (initialItem.description || "")) return true;
      if ((item.supporting_documentation || "") !== (initialItem.supporting_documentation || "")) return true;

      const currentDate = item.date instanceof Date ? item.date.toISOString() : item.date || "";
      const initialDate = initialItem.date instanceof Date ? initialItem.date.toISOString() : initialItem.date || "";
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
  }, []);

  useEffect(() => {
    if (applicationSave === true) {
      saveAllExhibitions();
    }
  }, [applicationSave]);

  // ✅ Update onFormDataChange to check for actual changes
  useEffect(() => {
    if (!isInitialized) return;

    const changed = hasDataChanged(exhibitions, initialData);
    setHasChanges(changed);

    if (onFormDataChange) {
      console.log("🔔 Exhibitions form data changed:", changed, "items:", exhibitions.length);
      onFormDataChange(changed);
    }
  }, [exhibitions, initialData, isInitialized, hasDataChanged, onFormDataChange]);

  const addExhibition = () => {
    setExhibitions((prev) => [
      ...prev,
      {
        title: "",
        venue: "",
        date: null,
        description: "",
        supporting_documentation: "",
        files: [],
        documents: [],
        file_names: [],
        existingFiles: [],
      },
    ]);
  };

  const removeExhibition = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    setExhibitions((prev) => prev.filter((_, i) => i !== index));
    deleteCriteria(newItem);
  };

  const handleExhibitionChange = useCallback((index, newData) => {
    setExhibitions((prev) => {
      const updated = [...prev];
      updated[index] = newData;
      return updated;
    });
  }, []);

  const saveAllExhibitions = async () => {
    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const criterion_data = exhibitions.map((ex, index) => {
        const fileList = ex.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: ex.id || `exhibition-${index + 1}`,
          title: ex.title || "",
          venue: ex.venue || "",
          date:
            ex.date instanceof Date
              ? ex.date.toISOString().split("T")[0]
              : ex.date || "",
          description: ex.description || "",
          supporting_documentation: ex.supporting_documentation || "",
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "exhibitions",
        criterion_data,
        ui_progress: {
          current_step: "exhibitions",
          completed_steps: ["exhibitions"],
          percentage: 50,
        },
      };

      const anyFirebaseId =
        exhibitions.find((ex) => ex.firebase_doc_id)?.firebase_doc_id || TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      exhibitions.forEach((ex) => {
        (ex.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        localStorage.setItem("firebaseId", resData.firebase_doc_id);
        exhibitions.forEach((ex) => {
          ex.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (Array.isArray(resData.uploaded_documents)) {
        exhibitions.forEach((ex) => {
          ex.existingFiles = [...(ex.existingFiles || []), ...resData.uploaded_documents];
          ex.files = [];
        });
      }

      setExhibitions([...exhibitions]);
      setInitialData(JSON.parse(JSON.stringify(exhibitions)));
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

  const Txt = (props) => (
    <textarea
      {...props}
      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

  const CardWrap = ({ children }) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">{children}</div>
  );
  const CardHeader = ({ children, className = "" }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
  );
  const CardTitle = ({ children, className = "" }) => (
    <h3 className={`font-semibold tracking-tight text-lg ${className}`}>{children}</h3>
  );
  const CardContent = ({ children, className = "" }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Palette className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Display of Work at Exhibitions</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of the display of your work at artistic exhibitions, showcases, or other
            venues for the general public.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc ml-5">
            <li>Exhibition catalogs or programs</li>
            <li>Photographs of displayed works</li>
            <li>Letters from curators or venue directors</li>
            <li>Press coverage or reviews of the exhibition</li>
          </ul>
        </div>
      </div>

      {exhibitions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No exhibitions added yet. Click "Add Exhibition" to get started.</p>
        </div>
      )}

      {exhibitions.map((ex, index) => (
        <ExhibitionCard
          key={ex.id || index}
          index={index}
          ex={ex}
          onChange={handleExhibitionChange}
          removeExhibition={removeExhibition}
          setFilePreview={setFilePreview}
          handleDownloadFile={handleDownloadFile}
          handleViewFile={handleViewFile}
          handleDeleteFile={handleDeleteFile}
          viewingFileId={viewingFileId}
          downloadingFileId={downloadingFileId}
          deletingFileId={deletingFileId}
          getFileIcon={getFileIcon}
          Btn={Btn}
          Inp={Inp}
          Txt={Txt}
          Lbl={Lbl}
          CardWrap={CardWrap}
          CardHeader={CardHeader}
          CardTitle={CardTitle}
          CardContent={CardContent}
        />
      ))}

      <Btn onClick={addExhibition} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Exhibition
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

// Separate card component with local state
function ExhibitionCard({
  ex,
  index,
  onChange,
  removeExhibition,
  setFilePreview,
  handleDownloadFile,
  handleViewFile,
  handleDeleteFile,
  viewingFileId,
  downloadingFileId,
  deletingFileId,
  getFileIcon,
  Btn,
  Inp,
  Txt,
  Lbl,
  CardWrap,
  CardHeader,
  CardTitle,
  CardContent,
}) {
  const [local, setLocal] = useState({ ...ex });

  useEffect(() => {
    setLocal({ ...ex });
  }, [JSON.stringify(ex)]);

  const syncToParent = useCallback(() => {
    onChange(index, local);
  }, [index, local, onChange]);

  return (
    <CardWrap>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>Exhibition #{index + 1}</CardTitle>
          <Btn onClick={() => removeExhibition(index, ex)} variant="ghost" size="sm">
            <Trash2 className="w-4 h-4" />
          </Btn>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 forms-UI">
        <div className="space-y-2">
          <Lbl htmlFor={`ex-title-${index}`}>Exhibition/Work Title *</Lbl>
          <Inp
            id={`ex-title-${index}`}
            placeholder="e.g., Contemporary Digital Art Showcase"
            value={local.title || ""}
            onChange={(e) => setLocal({ ...local, title: e.target.value })}
            onBlur={syncToParent}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Lbl htmlFor={`ex-venue-${index}`}>Venue *</Lbl>
            <Inp
              id={`ex-venue-${index}`}
              placeholder="e.g., Museum of Modern Art, Lincoln Center"
              value={local.venue || ""}
              onChange={(e) => setLocal({ ...local, venue: e.target.value })}
              onBlur={syncToParent}
              style={{marginTop:"0"}}
            />
          </div>

          <div className="space-y-2 input-coloumnform">
            <Lbl htmlFor={`ex-date-${index}`}>Exhibition Date *</Lbl>
            <DatePicker
              id={`ex-date-${index}`}
              selected={
                local.date instanceof Date
                  ? local.date
                  : local.date
                    ? new Date(local.date)
                    : null
              }
              onChange={(date) => {
                const newData = { ...local, date };
                setLocal(newData);
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

        <div className="space-y-2">
          <Lbl htmlFor={`ex-desc-${index}`}>Description &amp; Significance *</Lbl>
          <Txt
            id={`ex-desc-${index}`}
            placeholder="Describe the work displayed, the venue's reputation, and the significance of this exhibition..."
            rows={3}
            value={local.description || ""}
            onChange={(e) => setLocal({ ...local, description: e.target.value })}
            onBlur={syncToParent}
          />
        </div>

        <div className="space-y-2">
          <Lbl>Supporting Documents</Lbl>
          <FileUpload
            files={
              Array.isArray(local.files)
                ? local.files.filter((f) => f instanceof File)
                : []
            }
            onFilesChange={(files) => {
              const filtered = files.filter((f) => f instanceof File);
              const newData = { ...local, files: filtered };
              setLocal(newData);
              onChange(index, newData);
            }}
            existingFiles={[...(local.existingFiles || []), ...(local?.documents || [])]}
            maxFiles={5}
            viewFile={setFilePreview}
          />
        </div>

        {/* Display uploaded files with view/download/delete */}
        {local?.file_names?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <div className="space-y-2">
              {local.file_names.map((file, fileIndex) => {
                const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                const fileId = `${ex.id || index}-${fileIndex}`;

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
                        onClick={() => handleViewFile(displayFileName, ex, index)}
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
                        onClick={() => handleDownloadFile(displayFileName, ex, index)}
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
                        onClick={() => handleDeleteFile(displayFileName, ex, index)}
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
}
