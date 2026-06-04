//salaryForm.js
import React, { useState, useEffect, useCallback } from "react";
import { Plus, DollarSign, Save, Trash2, Image, FileText, Eye, Download, Clock } from "lucide-react";
import FileUpload from "components/FileUpload";
import toast from "react-hot-toast";
import { convertFilesToBase64 } from "utils/fileutils";
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
    placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${rows === 3 ? "" : rows === 2 ? "min-h-[80px]" : "min-h-[100px]"
      }`}
  />
);

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

export default function SalaryForm({
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
  const [salaries, setSalaries] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loader, setLoader] = useState(false);
  const [addSalaryClick, setAddSalaryClick] = useState(0);

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

  const criteria_number = currentCriteria?.criteria_number || "9";
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
      criterion: "high_salary",
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
      criterion: "high_salary",
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
      criterion: "high_salary",
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Remove file from local state
          setSalaries(prev =>
            prev.map((s, i) =>
              i === index
                ? {
                  ...s,
                  file_names: s.file_names?.filter(f => f !== fileName) || []
                }
                : s
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

    if (data?.high_salary?.length) {
      formattedData = data.high_salary.map((item) => ({
        id: item?.id,
        current_salary: item?.current_salary || "",
        comparison: item?.comparison || "",
        supporting_documentation: item.supporting_documentation || "",
        documents: item?.documents || [],
        file_names: item?.file_names || [],
        existingFiles: item?.existingFiles || [],
        files: [],
        firebase_doc_id: item?.firebase_doc_id,
      }));
    } else if (existingData.length > 0) {
      const item = existingData[0];
      formattedData = [
        {
          id: item?.id,
          current_salary: item?.current_salary || "",
          comparison: item?.comparison || "",
          supporting_documentation: item?.supporting_documentation || "",
          documents: item?.documents || [],
          file_names: item?.file_names || [],
          existingFiles: item?.existingFiles || [],
          files: [],
          firebase_doc_id: item?.firebase_doc_id,
        },
      ];
    }

    setSalaries(formattedData);
    setInitialData(JSON.parse(JSON.stringify(formattedData)));
    setIsInitialized(true);
  }, [data?.high_salary, existingData, isInitialized]);

  // ✅ Helper function to check if data has changed from initial state
  const hasDataChanged = useCallback((current, initial) => {
    if (!initial) return current.length > 0;

    if (current.length !== initial.length) return true;

    return current.some((item, index) => {
      const initialItem = initial[index] || {};

      if ((item.current_salary || "") !== (initialItem.current_salary || "")) return true;
      if ((item.comparison || "") !== (initialItem.comparison || "")) return true;
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
      saveAllSalaries();
    }
  }, [applicationSave]);

  // ✅ Update onFormDataChange to check for actual changes
  useEffect(() => {
    if (!isInitialized) return;

    const changed = hasDataChanged(salaries, initialData);
    setHasChanges(changed);

    if (onFormDataChange) {
      console.log("🔔 Salary form data changed:", changed, "items:", salaries.length);
      onFormDataChange(changed);
    }
  }, [salaries, initialData, isInitialized, hasDataChanged, onFormDataChange]);

  const addSalary = () => {
    setAddSalaryClick(1);
    setSalaries([
      ...salaries,
      {
        current_salary: "",
        comparison: "",
        supporting_documentation: "",
        documents: [],
        file_names: [],
        existingFiles: [],
        files: [],
      },
    ]);
  };

  const removeSalary = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    setSalaries((prev) => prev.filter((_, i) => i !== index));
    deleteCriteria(newItem);
  };

  const updateSalary = (index, field, value) => {
    const updated = [...salaries];
    updated[index] = { ...updated[index], [field]: value };
    setSalaries(updated);
  };

  const UPLOAD_URL =
    "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";

  const saveAllSalaries = async () => {
    let TemporaryId = localStorage.getItem("firebaseId");
    setLoader(true);

    try {
      const criterion_data = salaries.map((item, index) => {
        const fileList = item.files || [];
        const file_names = fileList.map((file) => file.name);

        return {
          id: item.id || `salary-${index + 1}`,
          current_salary: item.current_salary,
          comparison: item.comparison,
          supporting_documentation: item.supporting_documentation,
          file_names,
        };
      });

      const metaData = {
        user_email: userEmail,
        visa_type: Visa_Type || "EB1A",
        criteria_required: 3,
        criterion_key: "high_salary",
        criterion_data,
        ui_progress: {
          current_step: "high_salary",
          completed_steps: ["high_salary"],
          percentage: 70,
        },
      };

      const anyFirebaseId =
        salaries.find((s) => s.firebase_doc_id)?.firebase_doc_id || TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      salaries.forEach((item) => {
        (item.files || []).forEach((file) => {
          formData.append(file.name, file);
        });
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        salaries.forEach((item) => {
          item.firebase_doc_id = resData.firebase_doc_id;
        });
      }

      if (Array.isArray(resData.uploaded_documents)) {
        salaries.forEach((item) => {
          item.existingFiles = [
            ...(item.existingFiles || []),
            ...resData.uploaded_documents,
          ];
          item.files = [];
        });
      }

      setSalaries([...salaries]);
      setInitialData(JSON.parse(JSON.stringify(salaries)));
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
        <DollarSign className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">High Salary or Remuneration</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence that you have commanded a high salary or significantly high remuneration in relation to others in
            your field.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Employment contracts or offer letters</li>
            <li>• Tax returns or W-2 forms</li>
            <li>• Salary surveys and industry benchmarks</li>
            <li>• Compensation analysis reports</li>
          </ul>
        </div>
      </div>

      {salaries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No salary entries added yet. Click "Add Salary" to get started.</p>
        </div>
      )}

      {salaries.map((salary, index) => (
        <Card key={salary.id || index} className="relative">
          <CardHeader className="pb-4">
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Salary Information
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Provide information about your current compensation and how it compares within your field.
              </p>
            </div>

            {/* <div className="flex justify-between items-start">
                <CardTitle>Salary Information</CardTitle>
                <p className="text-sm text-muted-foreground" > Evidence that you command a high salary or other significantly high remuneration in relation to others in the field </p>
              
            </div> */}
          </CardHeader>

          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`current-salary-${index}`}>Current Annual Salary *</Label>
              <Input
                id={`current-salary-${index}`}
                value={salary.current_salary}
                onChange={(e) => updateSalary(index, "current_salary", e.target.value)}
                placeholder="e.g., $250,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`comparison-${index}`}>Industry Comparison *</Label>
              <Textarea
                id={`comparison-${index}`}
                value={salary.comparison}
                onChange={(e) => updateSalary(index, "comparison", e.target.value)}
                placeholder="Explain how your salary compares to industry standards, include percentile rankings, survey data, or benchmarks..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <FileUpload
                files={Array.isArray(salary?.files) ? salary?.files.filter((f) => f instanceof File) : []}
                onFilesChange={(files) => updateSalary(index, "files", files)}
                existingFiles={[...(salary.existingFiles || []), ...(salary?.documents || [])]}
                maxFiles={5}
                viewFile={setFilePreview}
              />
            </div>

            {/* Display uploaded files with view/download/delete */}
            {salary?.file_names?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Files</h4>
                <div className="space-y-2">
                  {salary.file_names.map((file, fileIndex) => {
                    const displayFileName = typeof file === "string" ? file : file?.file_name || "Uploaded file";
                    const fileId = `${salary.id || index}-${fileIndex}`;

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
                            onClick={() => handleViewFile(displayFileName, salary, index)}
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
                            onClick={() => handleDownloadFile(displayFileName, salary, index)}
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
                            onClick={() => handleDeleteFile(displayFileName, salary, index)}
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

      {salaries.length === 0 && (
        <>
          <Button onClick={addSalary} className="mt-2 w-full" variant="outline" size="sm">
           <Plus className="h-4 w-4 mr-1" />
           Add Salary
         </Button>
        </>
      )}

      <div className="p-4 bg-secondary/10 rounded-lg">
        <h4 className="font-medium mb-2">Tips for Strong Evidence:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use official salary surveys from recognized organizations</li>
          <li>• Include geographic and experience-level adjustments</li>
          <li>• Provide percentile rankings (e.g., "top 10% in field")</li>
          <li>• Consider total compensation including bonuses and equity</li>
        </ul>
      </div>

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
