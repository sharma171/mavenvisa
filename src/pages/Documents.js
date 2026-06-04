// documents.js - UPDATED VERSION WITH CUSTOM DROPDOWN
import React, { useEffect, useState } from "react";
import { FileText, Upload, Download, Eye, Trash2, Search, Calendar, Filter, X, Plus, ChevronDown, Loader2, ChevronsLeft, ChevronRight, ChevronLeft, ChevronsRight, AlertTriangle } from "lucide-react";
import axiosApi from "networking/axiosApi";
import { smartVisaApi } from "../pages/dashboard/smartVisaApi";
import { useDispatch, useSelector } from "react-redux";
import { OverlayModal, ThemeLoader } from "components";
import { getFileIcon, getFileIconByMime } from "utils/fileutils";
import { setAllApplications } from "../redux/sliceData";
import FilePreview from "components/FilePreview";
import toast from "react-hot-toast";


const Card = ({ children }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">{children}</div>
);
const CardContent = ({ children, className = "" }) => <div className={`${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardDescription = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;
const Button = ({ children, className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);
const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize ${className}`}
  >
    {children}
  </span>
);
const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
    {...props}
  />
);


// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        role="combobox"
        aria-controls={`${id}-options`}
        aria-expanded={isOpen}
        aria-autocomplete="none"
        data-state={isOpen ? "open" : "closed"}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 border-0 border-b border-border rounded-none bg-transparent focus:ring-0"
      >
        <span style={{ pointerEvents: 'none' }} className={!value ? 'text-muted-foreground' : ''}>
          {displayText}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={`${id}-options`}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto"
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${value === option.value ? 'bg-accent text-accent-foreground' : ''
                }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const DOCUMENT_CATEGORIES = [
  { label: "All Categories", value: "All Categories" },
  { label: "Awards", value: "awards" },
  { label: "Publications", value: "scholarly_articles" },
  { label: "Media", value: "media_coverage" },
  { label: "Memberships", value: "memberships" },
  { label: "High Salary", value: "high_salary" },
  { label: "Contributions", value: "original_contributions" },
  { label: "Judging", value: "judging" },
  { label: "Leadership", value: "leadership_role" },
  { label: "Exhibitions", value: "exhibitions" },
  { label: "Commercial", value: "commercial_success" },
];

const VISA_TYPE_OPTIONS = [
  { label: "EB1A", value: "EB1A" },
  { label: "O1A", value: "O1A" },
  { label: "Others", value: "others" },
];

const CRITERIA_OPTIONS = [
  { label: "Awards or Prizes", value: "awards_prizes" },
  { label: "Membership in Associations", value: "memberships" },
  { label: "Published Material About You", value: "media_coverage" },
  { label: "Judging Work of Others", value: "judging" },
  { label: "Original Contribution", value: "original_contributions" },
  { label: "Scholarly Articles", value: "scholarly_articles" },
  { label: "Exhibitions or Showcases", value: "exhibitions" },
  { label: "Leading or Critical Role", value: "leadership_role" },
  { label: "High Salary", value: "high_salary" },
  { label: "Commercial Success", value: "commercial_success" },
  { label: "Critical or Essential Role", value: "critical_role" },
  { label: "Others", value: "others" }
];

const STATUS_COLORS = {
  approved: "bg-green-100 text-green-800 border-green-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pending: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};


const formatFileSize = (size) => {
  if (typeof size === "number") {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }
  return size;
};


let baseURL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app/";
let uploadURL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app";


const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentsData, setDocumentsData] = useState({});
  // NEW: Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);

  // FilePreview states
  const [filePreviewObj, setFilePreview] = useState(null);
  const [base64FileContent, setBase64FileContent] = useState(null);
  const [previewFileType, setPreviewFileType] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [itemsPerPage, setItemPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [eoneDocumentskey, setEoneDocumentskey] = useState("");
  const [ooneDocumentsKey, setOoneDocumentsKey] = useState("");
  const [othersDocumentsKey, setOthersDocumentsKey] = useState("");
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const [pdfViewLoader, setPdfViewLoader] = useState(false);
  const [pdfDownloadLoader, setPdfDownloadLoader] = useState(false);
  const [applications, setApplications] = useState([]);

  // Sidebar state
  const [showUploadSidebar, setShowUploadSidebar] = useState(false);

  let userEmailId = userData?.email;

  let documentsSummery = documentsData?.summary;
  let allDocumentsData = documentsData?.documents || [];
  const allApplications = useSelector((state) => state.data.allApplications);


  console.log('🔍 DocumentsPage State:', {
    userEmailId,
    eoneDocumentskey,
    ooneDocumentsKey,
    totalDocuments: documentsSummery?.total_documents,
    filePreviewOpen: !!filePreviewObj
  });


  useEffect(() => {
    if (allApplications && allApplications.length > 0) {
      const eb1aApp = allApplications.find(app => app.visa_type === "EB1A");
      const o1aApp = allApplications.find(app => app.visa_type === "O1A");
      const othersApp = allApplications.find(app => app.visa_type === "others");

      if (eb1aApp) {
        console.log('✅ Found EB1A application:', eb1aApp.application_id);
        setEoneDocumentskey(eb1aApp.application_id);
      }
      if (o1aApp) {
        console.log('✅ Found O1A application:', o1aApp.application_id);
        setOoneDocumentsKey(o1aApp.application_id);
      }
      if (othersApp) {
        console.log('✅ Found O1A application:', othersApp.application_id);
        setOthersDocumentsKey(othersApp.application_id);
      }
    }
  }, [allApplications, applications]);


  useEffect(() => {
    if (eoneDocumentskey || ooneDocumentsKey || othersDocumentsKey) {
      console.log('📥 Fetching documents...');
      fetchAllDocuments();
    }
  }, [eoneDocumentskey, ooneDocumentsKey, othersDocumentsKey, userEmailId]);


  const onUpload = () => {
    setShowUploadSidebar(true);
    // Trigger file picker after sidebar opens
    setTimeout(() => {
      document.getElementById('sidebar-file-upload')?.click();
    }, 100);
  };


  useEffect(() => {
    if (userEmailId !== "") {
      console.log('👤 User email found, fetching applications...');
      dispatch(setAllApplications());
      localStorage.removeItem("firebaseId");
      setLoading(true);
      smartVisaApi
        .getAllApplications(userEmailId)
        .then((result) => {
          if (result && Array.isArray(result.applications) && result.applications.length > 0) {
            console.log('✅ Applications fetched:', result.applications.length);
            setApplications(result.applications);
            dispatch(setAllApplications(result.applications));
          } else {
            console.log('⚠️ No applications found');
            setApplications([]);
          }
        })
        .catch((err) => {
          console.error('❌ Error fetching applications:', err);
          setApplications([]);
        })
        .finally(() => setLoading(false));
    }
  }, [userEmailId]);


  const fetchAllDocuments = async () => {
    if (!userEmailId) return;

    console.log('🔄 Starting fetchAllDocuments...');
    setLoading(true);

    try {
      const requests = [];

      if (eoneDocumentskey) {
        console.log('📤 Adding EB1A request:', eoneDocumentskey);
        requests.push(
          axiosApi.post(baseURL, {
            user_email: userEmailId,
            task: "indepth_details",
            firebase_doc_id: eoneDocumentskey,
          })
        );
      }

      if (ooneDocumentsKey) {
        console.log('📤 Adding O1A request:', ooneDocumentsKey);
        requests.push(
          axiosApi.post(baseURL, {
            user_email: userEmailId,
            task: "indepth_details",
            firebase_doc_id: ooneDocumentsKey,
          })
        );
      }
      if (othersDocumentsKey) {
        console.log('📤 Adding O1A request:', othersDocumentsKey);
        requests.push(
          axiosApi.post(baseURL, {
            user_email: userEmailId,
            task: "indepth_details",
            firebase_doc_id: othersDocumentsKey,
          })
        );
      }

      const results = await Promise.all(requests);
      console.log('✅ API responses received:', results.length);

      const combinedData = {
        summary: {
          total_documents: 0,
          total_applications: results.length,
        },
        documents: []
      };

      results.forEach((res, idx) => {
        console.log(`📄 Processing result ${idx + 1}:`, res.data?.application?.visa_type);

        if (res?.data?.application) {
          const application = res.data.application;
          const criteria = application.criteria || {};

          const appDocuments = {
            application_id: application.document_id,
            visa_type: application.visa_type,
            application_status: application.application_status,
            criteria_documents: {}
          };

          Object.entries(criteria).forEach(([categoryKey, items]) => {
            if (!Array.isArray(items) || items.length === 0) return;

            const categoryTitle = categoryKey
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());

            const categoryDocuments = [];

            items.forEach((item) => {
              if (item.files && Array.isArray(item.files) && item.files.length > 0) {
                console.log(`📎 Found ${item.files.length} files in item:`, item.id);
                item.files.forEach((fileObj) => {
                  categoryDocuments.push({
                    document_id: fileObj.file_id || `${item.id}_${fileObj.file_name}`,
                    filename: fileObj.file_name,
                    original_filename: fileObj.file_name,
                    mime_type: fileObj.mime_type || getMimeTypeFromFileName(fileObj.file_name),
                    size_bytes: fileObj.size_bytes || 0,
                    uploaded_at: fileObj.uploaded_at || item.created_at || new Date().toISOString(),
                    status: fileObj.file_status || item.criteria_status || 'pending',
                    criterion_id: item.id,
                    storage_key: fileObj.storage_key,
                    file_path: fileObj.file_path,
                    uploaded_by: fileObj.uploaded_by,
                    metadata: {
                      award_name: item.award_name,
                      title: item.title,
                      organization: item.organization || item.issuing_organization,
                      description: item.description,
                      date: item.date || item.date_received || item.date_joined,
                      significance_level: item.significance_level,
                      citations: item.citations,
                      impact_factor: item.impact_factor,
                      project: item.project,
                      revenue: item.revenue,
                      current_salary: item.current_salary,
                      period: item.period,
                      venue: item.venue
                    }
                  });
                });
              }

              if (item.file_names && Array.isArray(item.file_names) && item.file_names.length > 0) {
                const filesArrayNames = (item.files || []).map(f => f.file_name);

                item.file_names.forEach((fileName, index) => {
                  if (fileName && !filesArrayNames.includes(fileName)) {
                    console.log(`📎 Found file_name (legacy):`, fileName);
                    categoryDocuments.push({
                      document_id: `${item.id}_file_${index}`,
                      filename: fileName,
                      original_filename: fileName,
                      mime_type: getMimeTypeFromFileName(fileName),
                      size_bytes: 0,
                      uploaded_at: item.created_at || new Date().toISOString(),
                      status: item.criteria_status || 'pending',
                      criterion_id: item.id,
                      metadata: {
                        award_name: item.award_name,
                        title: item.title,
                        organization: item.organization || item.issuing_organization,
                        description: item.description,
                        date: item.date || item.date_received || item.date_joined,
                        significance_level: item.significance_level,
                        citations: item.citations,
                        impact_factor: item.impact_factor,
                        project: item.project,
                        revenue: item.revenue,
                        current_salary: item.current_salary,
                        period: item.period,
                        venue: item.venue
                      }
                    });
                  }
                });
              }
            });

            if (categoryDocuments.length > 0) {
              appDocuments.criteria_documents[categoryKey] = {
                category_name: categoryKey,
                criteria_title: categoryTitle,
                documents: categoryDocuments
              };

              combinedData.summary.total_documents += categoryDocuments.length;
            }
          });

          combinedData.documents.push(appDocuments);
        }
      });

      console.log('✅ Final Combined Data:', {
        totalDocuments: combinedData.summary.total_documents,
        totalApplications: combinedData.summary.total_applications
      });

      setDocumentsData(combinedData);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };


  const getMimeTypeFromFileName = (fileName) => {
    if (!fileName) return 'application/octet-stream';

    const ext = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  };


  const flattenedDocs = allDocumentsData.flatMap(
    ({ application_id, visa_type, application_status, criteria_documents }) =>
      Object.values(criteria_documents).flatMap(({ category_name, criteria_title, documents }) =>
        documents.map((doc) => ({
          application_id,
          visa_type,
          application_status,
          category_name,
          criteria_title,
          ...doc,
          ...(doc.metadata || {})
        }))
      )
  );


  const filteredDocuments = flattenedDocs.filter((doc) => {
    const matchesSearch =
      String(doc.filename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(doc.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      doc.category_name === selectedCategory;

    const matchesStatus = selectedStatus === "All Status" || doc.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });


  console.log('📊 Filtered Documents:', filteredDocuments.length);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocPage = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  }





  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('📤 Files selected for upload:', files.length);

    const filesWithMeta = files.map((file, index) => {
      let type = "unknown";
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") type = "pdf";
      else if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) type = "image";
      else if (["ppt", "pptx"].includes(ext)) type = "presentation";

      return {
        id: "uploaded_" + Date.now() + "_" + index,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type,
        fileObj: file,
        visaType: "",
        criteriaKey: ""
      };
    });

    setUploadedFiles((prev) => [...prev, ...filesWithMeta]);
    e.target.value = null;
  };


  const handleDeleteFile = (id) => {
    console.log('🗑️ Deleting uploaded file:', id);
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileVisaType = (id, visaType) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, visaType } : file))
    );
  };

  const updateFileCriteria = (id, criteriaKey) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, criteriaKey } : file))
    );
  };


  const onClickDownload = (doc, isView) => {
    console.log('🔍 onClickDownload called:', {
      filename: doc.filename,
      isView,
      mimeType: doc.mime_type
    });

    if (!userEmailId) {
      toast.error("User email not found");
      return;
    }

    const firebaseDocId = doc.visa_type === "EB1A" ? eoneDocumentskey : ooneDocumentsKey;
    console.log('📄 Firebase Doc ID:', firebaseDocId);

    if (!firebaseDocId) {
      toast.error("Application ID not found");
      return;
    }

    const payload = {
      user_email: userEmailId,
      task: "download_file",
      firebase_doc_id: firebaseDocId,
      criterion: doc.category_name,
      file_name: doc.filename,
    };

    console.log('📤 API Payload:', payload);
    if (isView) {
      setPdfViewLoader(doc.document_id);
    }
    else {
      setPdfDownloadLoader(doc.document_id);
    }

    axiosApi
      .post(baseURL, payload)
      .then((res) => {
        console.log('✅ API Response received');
        const base64Content = res?.data?.file?.base64_content;

        if (!base64Content) {
          console.error('❌ No base64_content in response');
          toast.error("File content not found");
          return;
        }

        console.log('📦 Base64 Content Length:', base64Content.length);
        console.log('🎯 MIME Type:', doc.mime_type);

        if (isView) {
          console.log('👁️ Opening file preview...');
          setBase64FileContent(base64Content);
          setPreviewFileType(doc.mime_type || 'application/pdf');
          setPreviewFileName(doc.filename);
          setFilePreview({
            content: base64Content,
            filename: doc.filename,
            mime_type: doc.mime_type,
            isOpen: true
          });

          console.log('✅ FilePreview states set successfully');
          return;
        }

        console.log('💾 Starting download...');
        try {
          const cleanBase64 = base64Content.replace(/^data:.*;base64,/, "").replace(/\s/g, "");
          const byteCharacters = atob(cleanBase64);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: doc.mime_type || 'application/octet-stream' });

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = doc.original_filename || doc.filename || "download";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);

          console.log('✅ Download successful');
          toast.success("File downloaded successfully");
        } catch (err) {
          console.error("❌ Download error:", err);
          toast.error("Failed to download file");
        }
      })
      .catch((err) => {
        console.error("❌ API error:", err);
        console.error("Error details:", err.response?.data);
        toast.error(err?.response?.data?.message || "Failed to fetch document");
      })
      .finally(() => {
        setLoading(false);
        console.log('🏁 Request completed');
        setPdfViewLoader(false);
        setPdfDownloadLoader(false);
      });
  };


  const handleClosePreview = () => {
    console.log('🚪 Closing file preview');
    setBase64FileContent(null);
    setPreviewFileType(null);
    setPreviewFileName("");
    setFilePreview(null);
  };


  // 1. REPLACED: Opens the modal instead of window.confirm
  const onClickDelete = (doc) => {
    setFileToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  // 2. NEW: Performs the actual API call
  const onConfirmDeleteFile = async () => {
    if (!fileToDelete || !userEmailId) return;

    setDeletingFileId(fileToDelete.document_id); // Start loading button

    const payload = {
      action: "delete_document",
      email: userEmailId,
      document_id: fileToDelete.document_id,
    };

    try {
      const res = await axiosApi.post(baseURL, payload);
      console.log('✅ Document deleted successfully');
      toast.success(res.data?.message || "Document deleted successfully.");

      // Close modal first
      setIsDeleteModalOpen(false);
      setFileToDelete(null);

      // Then refresh the list
      fetchAllDocuments();
    } catch (err) {
      console.error('❌ Delete error:', err);
      toast.error(err?.response?.data?.message || "An error occurred while deleting the document.");
    } finally {
      setDeletingFileId(null);
    }
  };

  // 3. NEW: Closes the modal
  const cancelDeleteFile = () => {
    if (deletingFileId) return; // Prevent closing while deleting
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };


  const onClickUploadDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No files selected to upload.");
      return;
    }

    // Validate all files have visa type and criteria
    const invalidFiles = uploadedFiles.filter(f => !f.visaType || !f.criteriaKey);
    if (invalidFiles.length > 0) {
      toast.error("Please select VISA Type and Criteria for all files.");
      return;
    }

    setUploading(true);
    console.log('📤 Starting upload for', uploadedFiles.length, 'files...');

    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of uploadedFiles) {
        try {
          const formData = new FormData();

          const metaData = {
            user_email: userEmailId,
            visa_type: file.visaType,
            criterion_key: file.criteriaKey,
            criterion_data: [],
            ...(file.visaType === "O1A" && ooneDocumentsKey && { firebase_doc_id: ooneDocumentsKey }),
            ...(file.visaType === "EB1A" && eoneDocumentskey && { firebase_doc_id: eoneDocumentskey }),
            ...(file.visaType === "others" && othersDocumentsKey && { firebase_doc_id: othersDocumentsKey })
          };


          formData.append('meta_data', JSON.stringify(metaData));
          formData.append('file', file.fileObj);

          console.log('📤 Uploading:', file.name, 'to', file.visaType, '-', file.criteriaKey);

          const response = await axiosApi.post(uploadURL, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('✅ Upload success:', file.name, response.data);
          successCount++;
        } catch (err) {
          console.error('❌ Upload failed:', file.name, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file(s)!`);
        setUploadedFiles([]);
        setShowUploadSidebar(false);
        fetchAllDocuments();
      }

      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} file(s).`);
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };


  if (loading) {
    return <ThemeLoader show={loading} />;
  }


  return (
    <div className="space-y-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Document Manager
          </h2>
          <p className="text-muted-foreground">
            Manage and organize your application documents
          </p>
        </div>

        <button
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New
        </button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by name, criterion, or visa type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {DOCUMENT_CATEGORIES.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="All Status">All Status</option>
              <option value="approved">Approved</option>
              <option value="under_review">Under Review</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight">All Documents</CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentDocPage.length} document{currentDocPage.length !== 1 ? 's' : ''} {currentDocPage.length !== documentsSummery?.total_documents ? `(${documentsSummery?.total_documents || 0} total)` : ''}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Document Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Criteria Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">VISA Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Uploaded Date</th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="[&_tr:last-child]:border-0">
                {currentDocPage.map((doc, index) => (
                  <tr key={doc.document_id || index} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-2">
                        {getFileIconByMime(doc.mime_type)}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate max-w-[200px]" title={doc.filename || 'Unknown File'}>
                            {doc.filename || 'Unknown File'}
                          </span>
                          {/* <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.size_bytes)}
                          </span> */}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 align-middle">
                      <span className="capitalize">
                        {String(doc.category_name || "").replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                        {/* {doc.visa_type || "N/A"} */}
                        {doc.visa_type === "EB1A" ? "EB-1A" : doc.visa_type === "O1A" ? "O-1A" : doc.visa_type}
                      </div>
                    </td>

                    <td className="p-4 align-middle">
                      {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    <td className="p-4 align-middle text-center">
                      <div
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors capitalize",
                          doc.status === "approved"
                            ? "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80"
                            : doc.status === "under_review" || doc.status === "pending"
                              ? "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
                              : doc.status === "rejected"
                                ? "border-transparent bg-red-100 text-red-800 hover:bg-red-100/80"
                                : "border-transparent bg-muted text-muted-foreground"
                        ].join(" ")}
                      >
                        {String(doc.status || "pending").replace("_", " ")}
                      </div>
                    </td>

                    <td className="p-4 align-middle text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="View Document"
                          onClick={() => onClickDownload(doc, true)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {(pdfViewLoader == doc.document_id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (

                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Download Document"
                          onClick={() => onClickDownload(doc)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {(pdfDownloadLoader == doc.document_id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Delete Document"
                          onClick={() => onClickDelete(doc)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm h-9 rounded-md px-3 hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No documents found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-3 py-4 pt-8 border-t">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {filteredDocuments.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredDocuments.length)} of {filteredDocuments.length} entries
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">No. of rows</p>
                  <input
                    type="number"
                    // min={1}
                    // max={totalPages}
                    placeholder={itemsPerPage}
                    // value={currentPage}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : 1;
                      setItemPerPage(val);
                    }}
                    className="h-8 w-[60px] rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Total Documents</h3>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{documentsSummery?.total_documents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {documentsSummery?.total_applications || 0} application{documentsSummery?.total_applications !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Under Review</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {flattenedDocs.filter(d => d.status === 'under_review').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Approved</h3>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {flattenedDocs.filter(d => d.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully approved</p>
          </div>
        </div>
      </div>

      {/* Upload Sidebar */}
      {showUploadSidebar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setShowUploadSidebar(false)}
            style={{ marginTop: "0" }}
          />

          {/* Sidebar */}
          <div
            role="dialog"
            className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right w-full sm:max-w-lg flex flex-col"
            data-state="open"
            style={{ marginTop: "0" }}
          >
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-foreground text-xl font-semibold">Files & Documents</h2>
              <p className="text-sm text-muted-foreground">Manage and organize your application documentation</p>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col mt-4 space-y-4 overflow-hidden">
              {/* Upload More Button */}
              <div>
                <input
                  type="file"
                  id="sidebar-file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.ppt,.pptx,.doc,.docx"
                />
                <label
                  htmlFor="sidebar-file-upload"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload More Documents
                </label>
              </div>

              {/* Files List */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {uploadedFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">No files selected</p>
                    <p className="text-xs">Click "Upload More Documents" to add files</p>
                  </div>
                ) : (
                  uploadedFiles.map((file) => (
                    <div key={file.id} className="rounded-lg border border-border bg-card p-4">
                      {/* File Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getFileIcon(file.type)}
                          <span className="font-medium text-foreground truncate max-w-[250px]" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Custom Dropdowns */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* VISA Type Dropdown */}
                        <CustomDropdown
                          id={`visa-${file.id}`}
                          value={file.visaType}
                          onChange={(value) => updateFileVisaType(file.id, value)}
                          options={VISA_TYPE_OPTIONS}
                          placeholder="Select VISA Type"
                        />

                        {/* Criteria Dropdown */}
                        <CustomDropdown
                          id={`criteria-${file.id}`}
                          value={file.criteriaKey}
                          onChange={(value) => updateFileCriteria(file.id, value)}
                          options={CRITERIA_OPTIONS}
                          placeholder="Criteria Name"
                        />
                      </div>

                      {/* File size */}
                      <div className="mt-4 text-xs text-muted-foreground">
                        Size: {file.size}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowUploadSidebar(false);
                    setUploadedFiles([]);
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={onClickUploadDocuments}
                  disabled={uploading || uploadedFiles.length === 0}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Documents
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowUploadSidebar(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && fileToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={cancelDeleteFile}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-red-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex flex-col items-center text-center p-6">

              {/* Icon */}
              <div className="rounded-full bg-red-50 p-3 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Delete this file?
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-slate-900">"{fileToDelete.filename}"</span>?
                This action cannot be undone.
              </p>

              {/* Warning Box */}
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left flex gap-3">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs text-red-900 leading-snug">
                  This file will be permanently removed from the server.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={cancelDeleteFile}
                  disabled={!!deletingFileId}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                >
                  No, Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirmDeleteFile}
                  disabled={!!deletingFileId}
                  className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingFileId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {filePreviewObj && filePreviewObj.isOpen && base64FileContent && (
        <FilePreview
          base64File={base64FileContent}
          fileType={previewFileType}
          setBase64File={handleClosePreview}
          setFileType={setPreviewFileType}
          fileMeta={{
            currentFileName: previewFileName,
            allFileNames: [previewFileName]
          }}
          docObject={{
            file_name: previewFileName,
            doc_type: 'document',
            file_extension: previewFileType
          }}
          isLoading={loading}
          hideClose={false}
        />
      )}
    </div>
  );
};


export default DocumentsPage;
