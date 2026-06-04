import React, { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronDown, MoreVertical, Eye, CheckCircle, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Check, X, FileText, Download, Award, Loader2, ZoomIn, ZoomOut, Trash,
  RotateCw,
  ChevronsLeft,
  ChevronsRight, Link, Info,
  Image,
  PenLine,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import axios from 'axios';

// Create axios instance for file operations
const axiosApi = axios.create({
  // responseType will be set per request
});
const base64ToBlob = (base64Data, contentType = 'application/pdf') => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

function PDFViewerModal({ pdfData, fileName, onClose, onDownload }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef(null);

  if (!pdfData) return null;

  // Helper function to check if file is an image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const isImage = isImageFile(fileName);

  console.log('📄 PDFViewerModal:', {
    fileName,
    isImage,
    pdfDataLength: pdfData?.length,
  });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/80 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-6xl transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold truncate">
              {fileName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isImage ? 'Image File' : 'PDF Document'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted transition-colors shrink-0"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        {/* <div className="flex items-center gap-2 border-b bg-muted/20 px-6 py-3">
          <button
            onClick={handleZoomOut}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            title="Zoom Out"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            title="Zoom In"
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {isImage && (
            <button
              onClick={handleRotate}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </button>
          )}

          <div className="flex-1" />
          <button
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div> */}

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-muted/5 p-4">
          {isImage ? (
            // Image viewer with zoom and rotation
            <div className="flex items-center justify-center min-h-full">
              <img
                src={pdfData}
                alt={fileName}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: "transform 0.2s ease-in-out",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }}
                className="rounded-lg shadow-lg"
                onLoad={() => console.log('✅ Image loaded successfully')}
                onError={(e) => console.error('❌ Image load error:', e)}
              />
            </div>
          ) : (
            // PDF viewer with zoom
            <div
              className="flex items-center justify-center min-h-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: "transform 0.2s"
              }}
            >
              {console.log('📄 Rendering PDF:', pdfData?.substring(0, 50))}
              <iframe
                ref={iframeRef}
                src={pdfData}
                className="w-full h-full min-h-[calc(100vh-145px)] rounded-lg border bg-white shadow-lg"
                title={fileName}
                style={{
                  border: 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}


const ApplicationReview = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [visaFilter, setVisaFilter] = useState('All');
  const [isVisaDropdownOpen, setIsVisaDropdownOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [applicationsData, setApplicationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('criteria');
  const [detailedApplication, setDetailedApplication] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [currentCriteriaIndex, setCurrentCriteriaIndex] = useState(0);
  const [reviewDecision, setReviewDecision] = useState('');
  const [isReviewDropdownOpen, setIsReviewDropdownOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');
  const [currentPdfCriterion, setCurrentPdfCriterion] = useState('');
  const [isViewMode, setIsViewMode] = useState(false);
  const [showRejectAppDialog, setShowRejectAppDialog] = useState(false);
  const [showRejectCriterionDialog, setShowRejectCriterionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [criterionRejectionReason, setCriterionRejectionReason] = useState('');
  const [pendingRejectStatus, setPendingRejectStatus] = useState(null);
  const [pendingRejectCriterion, setPendingRejectCriterion] = useState(null);


  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingCriteriaId, setUpdatingCriteriaId] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [viewingFileId, setViewingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);

  const userEmail = useSelector((state) => state.data?.userData?.user?.email || '');

  const visaDropdownRef = useRef(null);
  const actionMenuRefs = useRef({});
  const reviewDropdownRef = useRef(null);

  const baseURL = 'https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app/';

  const visaTypes = ['All', 'EB-1A', 'O-1A'];

  const reviewDecisionOptions = [
    { value: 'in progress', label: 'In Progress' },
    { value: 'in review', label: 'In Review' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'rejected application', label: 'Rejected Application' }
  ];
  // Icon mapping for different field types
  const getFieldIcon = (fieldKey) => {
    const iconMap = {

      url: Link
    };

    return iconMap[fieldKey] || iconMap.default;
  };



  // ADD missing criteria display names
  const criteriaDisplayNames = {
    'awards': 'Awards or Prizes',
    'memberships': 'Membership in Associations',
    'press': 'Press Coverage',
    'media_coverage': 'Published Material About You',  // ADD THIS
    'judging': 'Judging Work of Others',
    'original_contribution': 'Original Contributions',
    'original_contributions': 'Original Contributions',
    'scholarly_articles': 'Scholarly Articles',
    'critical_role': 'Critical or Essential Role',
    'high_remuneration': 'High Remuneration',
    'high_salary': 'High Salary',  // ADD THIS
    'hotels': 'Awards & Recognition',  // ADD THIS (appears to be awards)
    'leadership_role': 'Leading or Critical Role',
    'exhibitions': 'Exhibitions or Showcases',
    'commercial_success': 'Commercial Success',
  };


  // Visa type mapping
  const visaTypeMapping = {
    'O1A': 'O-1A',
    'O-1A': 'O-1A',
    'EB1A': 'EB-1A',
    'EB-1A': 'EB-1A',
    'EB2': 'EB-2',
    'EB-2': 'EB-2'
  };


  // Get status variant for badge styling
  const getStatusVariant = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved' || statusLower === 'completed') return 'success';
    if (statusLower === 'rejected') return 'destructive';
    if (statusLower === 'under_review' || statusLower === 'under review' || statusLower === 'in progress' || statusLower === 'in_progress') return 'secondary';
    if (statusLower === 'draft') return 'default';
    return 'default';
  };

  // Get visa variant for badge styling
  const getVisaVariant = (visaType) => {
    if (visaType?.includes('EB-1')) return 'primary';
    if (visaType?.includes('O-1')) return 'secondary';
    return 'default';
  };

  // Map API data to component format
  const mapApiDataToComponent = (apiData) => {
    const displayStatus = statusApiToDisplay[apiData.status] ||
      (apiData.status ? apiData.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending');

    const normalizedVisaType = visaTypeMapping[apiData.target_visa_type] || apiData.target_visa_type;

    // Format date
    let formattedDate = 'N/A';
    if (apiData.submitted_date) {
      try {
        const date = new Date(apiData.submitted_date);
        formattedDate = date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '/');
      } catch (e) {
        console.error('Date parsing error:', e);
      }
    }

    return {
      id: apiData.firebase_doc_id,
      applicantName: apiData.applicant_name,
      email: apiData.email,
      fieldOfExpertise: apiData.field_of_expertise || 'N/A',
      visaType: normalizedVisaType,
      submittedDate: formattedDate,
      status: displayStatus,
      visaVariant: getVisaVariant(normalizedVisaType),
      statusVariant: getStatusVariant(apiData.status),
      firebaseDocId: apiData.firebase_doc_id
    };
  };

  // Fetch applicants from API
  const fetchApplicants = async () => {
    if (!userEmail) {
      setError('Admin email not found. Please login again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_name: 'applicant_list',
            admin_email: userEmail
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.response)) {
        const mappedData = result.response.map(mapApiDataToComponent);
        setApplicationsData(mappedData);
        console.log(`Successfully loaded ${result.count} applications`);
      } else {
        throw new Error(result.message || 'Failed to fetch applicants');
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError(error.message || 'Failed to load applications');
      setApplicationsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed application data
  const fetchApplicationDetails = async (firebaseId) => {
    if (!userEmail) {
      toast.error('Admin email not found. Please login again.');
      return;
    }

    setIsLoadingDetails(true);

    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_name: 'applicant_indepth_details',
            admin_email: userEmail,
            firebase_id: firebaseId
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.application) {
        setDetailedApplication(result.application);
        // Set initial review decision based on application status
        setReviewDecision(result.application.application_status || '');
        console.log('Application details loaded:', result.application);
      } else {
        throw new Error(result.message || 'Failed to fetch application details');
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details: ' + error.message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Download file function using axios
  const handleDownloadFile = (fileName, criterionKey) => {
    if (!selectedApplication) return;

    const fileId = `${criterionKey}-${fileName}`;
    setDownloadingFileId(fileId);

    const payload = {
      user_email: selectedApplication.email,
      task: "download_file",
      firebase_doc_id: selectedApplication.firebaseDocId,
      criterion: criterionKey,
      file_name: fileName,
    };

    axiosApi
      .post(baseURL, payload)
      .then((res) => {
        // Create blob from response
        const blob = new Blob([res.data], { type: res.headers['content-type'] });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('File downloaded successfully');
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
        toast.error('Failed to download file: ' + (error.response?.data?.message || error.message));
      })
      .finally(() => {
        setDownloadingFileId(null);
      });
  };

  // View file function using axios opens in new tab
  // Simpler approach - set base64 directly to PDF viewer
  const handleViewFile = (fileName, criterionKey) => {
    if (!selectedApplication) return;

    const fileId = `${criterionKey}-${fileName}`;
    setViewingFileId(fileId);

    const payload = {
      user_email: selectedApplication.email,
      task: "download_file",
      firebase_doc_id: selectedApplication.firebaseDocId,
      criterion: criterionKey,
      file_name: fileName,
    };

    axiosApi
      .post(baseURL, payload)
      .then((res) => {
        if (res.data.status === 'success' && res.data.file) {
          const { base64_content, filename, file_extension } = res.data.file;

          const isPDF = file_extension === '.pdf';
          const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.tif'].includes(file_extension);

          if (isPDF) {
            // Create data URL for PDF
            const pdfDataUrl = `data:application/pdf;base64,${base64_content}`;

            // Open PDF in modal viewer
            setPdfData(pdfDataUrl);
            setCurrentPdfFileName(filename || fileName);
            setCurrentPdfCriterion(criterionKey);
            setPdfViewerOpen(true);

            console.log('✅ PDF opened in modal viewer');
          } else if (isImage) {
            // ✅ FIXED: For images, create data URL and open in MODAL VIEWER
            const imageType = file_extension.substring(1); // Remove the dot
            const imageDataUrl = `data:image/${imageType};base64,${base64_content}`;

            // Open image in modal viewer (same as PDF)
            setPdfData(imageDataUrl);
            setCurrentPdfFileName(filename || fileName);
            setCurrentPdfCriterion(criterionKey);
            setPdfViewerOpen(true);

            console.log('✅ Image opened in modal viewer');
          } else {
            // For other files, convert to blob and download
            const blob = base64ToBlob(base64_content);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
          }

          console.log('File opened successfully');
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch((error) => {
        console.error('❌ Error viewing file:', error);
        toast.error(`Failed to view file: ${error.response?.data?.message || error.message}`);
      })
      .finally(() => {
        // setDownloadingFileId(null);
        setViewingFileId(null);
      });
  };


  // Close PDF viewer and cleanup
  const handleClosePdfViewer = () => {
    // Only revoke if it's a blob URL (starts with 'blob:')
    if (pdfData && pdfData.startsWith('blob:')) {
      window.URL.revokeObjectURL(pdfData);
    }
    setPdfViewerOpen(false);
    setPdfData(null);
    setCurrentPdfFileName('');
    setCurrentPdfCriterion('');
  };


  // Download from PDF viewer
  const handleDownloadFromViewer = () => {
    if (currentPdfFileName && currentPdfCriterion) {
      handleDownloadFile(currentPdfFileName, currentPdfCriterion);
    }
  };
  // 1. UPDATED: Triggers the modal instead of window.confirm
  const handleDeleteFile = (fileName, criterionKey, itemId) => {
    if (!selectedApplication) return;

    // Store details and open modal
    setFileToDelete({ fileName, criterionKey, itemId });
    setIsDeleteModalOpen(true);
  };

  // 2. NEW: Performs the actual delete (moved from handleDeleteFile)
  const onConfirmDeleteFile = async () => {
    if (!selectedApplication || !fileToDelete) return;

    const { fileName, criterionKey, itemId } = fileToDelete;
    const fileId = `${criterionKey}-${fileName}`;

    setDeletingFileId(fileId); // Start loading state

    const payload = {
      user_email: selectedApplication.email,
      task: "delete_file",
      firebase_doc_id: selectedApplication.firebaseDocId,
      criterion: criterionKey,
      file_name: fileName,
      item_id: itemId
    };

    try {
      const response = await axiosApi.post(baseURL, payload);

      if (response.data.status === 'success') {
        toast.success('File deleted successfully');

        // Refresh application details to update file list
        await fetchApplicationDetails(selectedApplication.firebaseDocId);

        // Close modal on success
        setIsDeleteModalOpen(false);
        setFileToDelete(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingFileId(null); // Stop loading state
    }
  };

  // 3. NEW: Close modal handler
  const cancelDeleteFile = () => {
    if (deletingFileId) return; // Prevent closing while API is calling
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };


  // Modified handleUpdateApplicationStatus - check if status is "rejected application"
  const handleUpdateApplicationStatus = async (newStatus) => {
    if (!userEmail || !selectedApplication) return;

    // If rejected application, show popup first
    if (newStatus === 'rejected application') {
      setPendingRejectStatus(newStatus);
      setShowRejectAppDialog(true);
      setIsReviewDropdownOpen(false);
      return; // Don't proceed with API call yet
    }

    setIsUpdatingStatus(true);

    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_email: userEmail,
            task_name: 'applicant_status_update',
            email: selectedApplication.email,
            firebase_id: selectedApplication.firebaseDocId,
            applicant_status: newStatus
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setReviewDecision(newStatus);
        toast.success('Application status updated successfully!');

        // Refresh application details
        await fetchApplicationDetails(selectedApplication.firebaseDocId);

        // Refresh main list
        await fetchApplicants();
      } else {
        throw new Error(result.message || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update status: ' + error.message);
    } finally {
      setIsUpdatingStatus(false);
      setIsReviewDropdownOpen(false);
    }
  };

  // Function to confirm application rejection with reason
  const handleConfirmApplicationRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!userEmail || !selectedApplication || !pendingRejectStatus) return;

    setIsUpdatingStatus(true);

    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_email: userEmail,
            task_name: 'applicant_status_update',
            email: selectedApplication.email,
            firebase_id: selectedApplication.firebaseDocId,
            applicant_status: pendingRejectStatus,
            reason: rejectionReason // Include the reason
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setReviewDecision(pendingRejectStatus);
        toast.success('Application rejected successfully!');

        // Close dialog and reset
        setShowRejectAppDialog(false);
        setRejectionReason('');
        setPendingRejectStatus(null);

        // Refresh application details
        await fetchApplicationDetails(selectedApplication.firebaseDocId);

        // Refresh main list
        await fetchApplicants();
      } else {
        throw new Error(result.message || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update status: ' + error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Modified handleCriterionReview - check if status is "rejected"
  const handleCriterionReview = async (criterionKey, itemId, reviewStatus) => {
    if (!userEmail || !selectedApplication) return;

    // If rejected, show popup first
    if (reviewStatus === 'rejected') {
      setPendingRejectCriterion({ criterionKey, itemId, reviewStatus });
      setShowRejectCriterionDialog(true);
      return; // Don't proceed with API call yet
    }

    const uniqueKey = `${criterionKey}-${itemId}`;
    setUpdatingCriteriaId(uniqueKey);

    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_email: userEmail,
            task_name: 'criteria_admin_review_update',
            doc_id: selectedApplication.firebaseDocId,
            criterion_key: criterionKey,
            id: itemId,
            criteria_admin_review: reviewStatus
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        toast.success(`Criterion ${reviewStatus} successfully!`);

        // Refresh application details
        await fetchApplicationDetails(selectedApplication.firebaseDocId);
      } else {
        throw new Error(result.message || 'Failed to update criterion review');
      }
    } catch (error) {
      console.error('Error updating criterion review:', error);
      toast.error('Failed to update criterion: ' + error.message);
    } finally {
      setUpdatingCriteriaId(null);
    }
  };

  // Function to confirm criterion rejection with reason
  const handleConfirmCriterionRejection = async () => {
    if (!criterionRejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!userEmail || !selectedApplication || !pendingRejectCriterion) return;

    const { criterionKey, itemId, reviewStatus } = pendingRejectCriterion;
    const uniqueKey = `${criterionKey}-${itemId}`;
    setUpdatingCriteriaId(uniqueKey);

    try {
      const response = await fetch(
        'https://fetch-admin-applicant-admin-portal-v1-356312339779.us-east1.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admin_email: userEmail,
            task_name: 'criteria_admin_review_update',
            doc_id: selectedApplication.firebaseDocId,
            criterion_key: criterionKey,
            id: itemId,
            criteria_admin_review: reviewStatus,
            reason: criterionRejectionReason // Include the reason
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        toast.success(`Criterion ${reviewStatus} successfully!`);

        // Close dialog and reset
        setShowRejectCriterionDialog(false);
        setCriterionRejectionReason('');
        setPendingRejectCriterion(null);

        // Refresh application details
        await fetchApplicationDetails(selectedApplication.firebaseDocId);
      } else {
        throw new Error(result.message || 'Failed to update criterion review');
      }
    } catch (error) {
      console.error('Error updating criterion review:', error);
      toast.error('Failed to update criterion: ' + error.message);
    } finally {
      setUpdatingCriteriaId(null);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    if (userEmail) {
      fetchApplicants();
    }
  }, [userEmail]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (visaDropdownRef.current && !visaDropdownRef.current.contains(event.target)) {
        setIsVisaDropdownOpen(false);
      }

      if (reviewDropdownRef.current && !reviewDropdownRef.current.contains(event.target)) {
        setIsReviewDropdownOpen(false);
      }

      if (openActionMenu !== null) {
        const menuRef = actionMenuRefs.current[openActionMenu];
        if (menuRef && !menuRef.contains(event.target)) {
          setOpenActionMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

  // Filter applications
  const filteredApplications = applicationsData.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisa = visaFilter === 'All' || app.visaType === visaFilter;
    return matchesSearch && matchesVisa;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) - 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isVisaDropdownOpen]);

  const getBadgeClasses = (variant) => {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    const variants = {
      primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      default: "text-foreground"
    };

    return `${baseClasses} ${variants[variant]}`;
  };
  // 1. Define the colors and styles for each status
  const STATUS_BADGE_CONFIG = {
    "Pending": {
      className: "bg-gray-500 hover:bg-gray-600 text-white",
    },
    "In Progress": {
      className: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    "In Review": {
      className: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    "On Hold": {
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    "Rejected Application": {
      className: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
      showInfo: true,
    },
    "Approved": {
      className: "bg-green-500 hover:bg-green-600 text-white",
    },
    // Fallbacks for legacy/other statuses
    "Completed": {
      className: "bg-green-500 hover:bg-green-600 text-white",
    }
  };

  // 2. Define the Mapping from API (snake_case) to Badge Keys (Title Case)
  const statusApiToDisplay = {
    'pending': 'Pending',
    'draft': 'Pending',
    'in_progress': 'In Progress',
    'in progress': 'In Progress',
    'in_review': 'In Review',
    'under_review': 'In Review',
    'on_hold': 'On Hold',
    'rejected_application': 'Rejected Application',
    'rejected': 'Rejected Application',
    'approved': 'Approved',
    'completed': 'Completed'
  };

  // 3. The StatusBadge Component Definition
  const StatusBadge = ({ status }) => {
    // Default to 'Pending' styling if status is not found in config
    const config = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG["Pending"];

    return (
      <div className="flex items-center gap-1">
        <span
          className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors ${config.className}`}
        >
          {status || "Pending"}
        </span>

        {/* {config.showInfo && (
          <Info
            className="h-4 w-4 text-destructive cursor-help"
            title="This application has been rejected"
          />
        )} */}
      </div>
    );
  };


  const handleActionClick = (id) => {
    setOpenActionMenu(openActionMenu === id ? null : id);
  };

  const handleViewDetails = async (application) => {
    setSelectedApplication(application);
    setIsDetailSheetOpen(true);
    setOpenActionMenu(null);
    setCurrentCriteriaIndex(0);
    setIsViewMode(false); // Set view mode based on which button was clicked

    // Fetch detailed data
    await fetchApplicationDetails(application.firebaseDocId);
  };
  const handleEditDetails = async (application) => {
    setSelectedApplication(application);
    setIsDetailSheetOpen(true);
    setOpenActionMenu(null);
    setCurrentCriteriaIndex(0);
    setIsViewMode(true); // Set view mode based on which button was clicked

    // Fetch detailed data
    await fetchApplicationDetails(application.firebaseDocId);
  };


  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false);
    setSelectedApplication(null);
    setActiveTab('criteria');
    setDetailedApplication(null);
    setCurrentCriteriaIndex(0);
    setReviewDecision('');
    setIsViewMode(false); // Reset view mode
  };


  const handleApprove = async (application) => {
    console.log('Approve:', application);
    // TODO: Add API call to approve application
    setOpenActionMenu(null);
  };

  const handleReject = async (application) => {
    console.log('Reject:', application);
    // TODO: Add API call to reject application
    setOpenActionMenu(null);
  };
  const criteriaOrder = [
  'awards', 
  'memberships', 
  'media_coverage', 
  'judging', 
  'original_contributions', 
  'scholarly_articles'
];

  // Get current criteria type and items
  const getCurrentCriteria = () => {
    if (!detailedApplication?.criteria) return null;

    const criteriaTypes = Object.keys(detailedApplication.criteria).sort((a, b) => {
      const indexA = criteriaOrder.indexOf(a);
      const indexB = criteriaOrder.indexOf(b);

      // If both are in the list, sort by the list order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      
      // If A is in the list but B isn't, A comes first
      if (indexA !== -1) return -1;
      
      // If B is in the list but A isn't, B comes first
      if (indexB !== -1) return 1;

      // If neither are in the list, keep original order (or sort alphabetically if you prefer)
      return 0; 
    });

    if (criteriaTypes.length === 0) return null;

    const currentType = criteriaTypes[currentCriteriaIndex];
    const items = detailedApplication.criteria[currentType];

    return {
      type: currentType,
      displayName: criteriaDisplayNames[currentType] || currentType,
      items: items || [],
      totalTypes: criteriaTypes.length
    };
  };

  const currentCriteria = getCurrentCriteria();
  const currentTotalApplications = currentCriteria?.totalTypes || 0;
  const handleCriteriaChange = (pageNumber) => {
    // 1. Check if total exists
    if (!currentTotalApplications) return;

    // 2. THE FIX: Strict validation. 
    // If 0, negative, or larger than total, stop immediately ("do nothing").
    if (pageNumber < 1 || pageNumber > currentTotalApplications) return;

    // 3. Update state only if valid
    setCurrentCriteriaIndex(pageNumber - 1);
  };

  // Get all files from all criteria
  const getAllFiles = () => {
    if (!detailedApplication?.criteria) return [];

    const files = [];
    Object.entries(detailedApplication.criteria).forEach(([criteriaType, items]) => {
      items.forEach((item, index) => {
        if (item.file_names && item.file_names.length > 0) {
          item.file_names.forEach((fileName) => {
            files.push({
              name: fileName,
              criteriaType: criteriaDisplayNames[criteriaType] || criteriaType,
              criterionKey: criteriaType,
              itemName: item.award_name || item.title || item.name || `Item ${index + 1}`,
              id: item.id,
              itemId: item.id  // ADD this for delete functionality
            });
          });
        }
      });
    });

    return files;
  };
  // Helper function to get file icon with proper color and size
  const getFileIcon = (fileName) => {
    const fileExtension = fileName ? fileName.split('.').pop().toLowerCase() : '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];

    // Common classes for sizing (matches your original h-5 w-5)
    const iconClasses = "h-5 w-5";

    if (imageExtensions.includes(fileExtension)) {
      return <Image className={`${iconClasses} text-blue-500`} />;
    } else if (fileExtension === 'pdf') {
      return <FileText className={`${iconClasses} text-red-500`} />;
    } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
      return <FileText className={`${iconClasses} text-green-600`} />;
    } else {
      // Default fallback
      return <FileText className={`${iconClasses} text-muted-foreground`} />;
    }
  };

  return (
    <>
      <div className="flex-1">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Application Review</h2>
              <p className="text-muted-foreground">
                Review and evaluate visa applications
              </p>
            </div>
            <button
              onClick={fetchApplicants}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9"
                placeholder="Search by Applicant Name or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* VISA Type Filter */}
            <div className="w-48" ref={visaDropdownRef}>
              <button
                type="button"
                onClick={() => setIsVisaDropdownOpen(!isVisaDropdownOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{visaFilter}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {isVisaDropdownOpen && (
                <div className="absolute mt-1 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
                  {visaTypes.map((type) => (
                    <div
                      key={type}
                      onClick={() => {
                        setVisaFilter(type);
                        setIsVisaDropdownOpen(false);
                      }}
                      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${visaFilter === type ? 'bg-accent' : ''
                        }`}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Applications ({currentApplications.length})
              </h3>
            </div>
            <div className="p-6 pt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-3 text-muted-foreground">Loading applications...</span>
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Applicant Name
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Field of Expertise
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          VISA Type
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Submitted Date
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {currentApplications.length > 0 ? (
                        currentApplications.map((application) => (
                          <>
                            {application.id !== '' && (<>

                              <tr
                                key={application.id}
                                className="border-b transition-colors hover:bg-muted/50"
                              >
                                <td className="p-4 align-middle font-medium">
                                  {application.applicantName}
                                </td>
                                <td className="p-4 align-middle">{application.email}</td>
                                <td className="p-4 align-middle">{application.fieldOfExpertise}</td>
                                <td className="p-4 align-middle">
                                  <div className={getBadgeClasses(application.visaVariant)}>
                                    {application.visaType === "eb1a" ? "EB-1A" : application.visaType === "o1a" ? "O-1A" : application.visaType}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">{application.submittedDate}</td>
                                <td className="p-4 align-middle">
                                  <StatusBadge status={application.status} />
                                </td>
                                <td className="p-4 align-middle text-right">
                                  <div className="relative inline-block" ref={(el) => actionMenuRefs.current[application.id] = el}>
                                    <button
                                      onClick={() => handleActionClick(application.id)}
                                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                      type="button"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {/* Action Menu Dropdown */}
                                    {openActionMenu === application.id && (
                                      <div className="absolute right-10 top-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
                                        <div
                                          onClick={() => handleViewDetails(application)}
                                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          View
                                        </div>
                                        {console.log(application)}
                                        <div
                                          onClick={() => handleEditDetails(application)}
                                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                          <PenLine className="mr-2 h-4 w-4" />
                                          Edit
                                        </div>

                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </>)}
                          </>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-muted-foreground">
                            No applications found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Showing {filteredApplications.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} entries
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">No. of rows</p>
                        <input
                          type="text"
                          // min={1}
                          // max={totalPages}
                          // value={currentPage}
                          placeholder={itemsPerPage}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : 5;
                            setItemsPerPage(val);
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail Sheet */}
      {isDetailSheetOpen && selectedApplication && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/80 transition-opacity duration-300"
            onClick={handleCloseDetailSheet}
          />

          {/* Slide-in Panel */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[75vw] transform flex-col overflow-hidden border-l bg-background shadow-lg transition duration-500 ease-in-out animate-slide-in-from-right">
            {/* Header */}
            <div className="sticky top-0 z-20 border-b bg-background px-6 py-4">
              <div className="flex items-start justify-between gap-4">

                {/* Left: Application Info */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-foreground truncate capitalize">
                      {selectedApplication.applicantName} – {selectedApplication.visaType} Application
                    </h2>


                    <StatusBadge
                      status={
                        statusApiToDisplay[detailedApplication?.application_status] ||
                        (detailedApplication?.application_status
                          ? detailedApplication.application_status
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                          : "Pending") // 3. Default to Pending if null
                      }
                    />
                  </div>

                  <div className="text-sm text-muted-foreground truncate">
                    {selectedApplication.email} • {selectedApplication.fieldOfExpertise}
                  </div>

                  {detailedApplication && (
                    <div className="flex items-center gap-4 text-sm mt-1">
                      {/* <div>
                        <span className="text-muted-foreground">Current Status:</span>{' '}
                        <span className=" text-foreground">
                          {statusApiToDisplay[detailedApplication.application_status].capitalize ||
                            detailedApplication.application_status}
                        </span>
                      </div> */}
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>{' '}
                        <span className="text-foreground">
                          {detailedApplication.last_updated
                            ? new Date(detailedApplication.last_updated).toLocaleDateString(
                              'en-US',
                              { day: '2-digit', month: 'short', year: 'numeric' }
                            )
                            : 'N/A'}
                        </span>
                      </div>

                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">

                  {isViewMode && (
                    <div className="relative" ref={reviewDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsReviewDropdownOpen(!isReviewDropdownOpen)}
                        disabled={isUpdatingStatus}
                        className="flex h-10 min-w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <span className="truncate">
                          {reviewDecision
                            ? reviewDecisionOptions.find(opt => opt.value === reviewDecision)?.label ||
                            reviewDecision
                            : 'Update Application Status'}
                        </span>

                        {isUpdatingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>

                      {isReviewDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-50">
                          {reviewDecisionOptions.map(option => (
                            <div
                              key={option.value}
                              onClick={() => handleUpdateApplicationStatus(option.value)}
                              className={`cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${reviewDecision === option.value ? 'bg-accent' : ''
                                }`}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Close */}
                  <button
                    onClick={handleCloseDetailSheet}
                    className="rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingDetails && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading application details...</p>
                </div>
              </div>
            )}

            {/* Content - Only show when not loading */}
            {!isLoadingDetails && detailedApplication && (
              <>
                {/* Tabs */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="border-b bg-muted p-1 mx-6 mt-6 rounded-md">
                    <div className="grid grid-cols-2">
                      <button
                        onClick={() => setActiveTab('criteria')}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all ${activeTab === 'criteria'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        Criteria Management
                      </button>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all ${activeTab === 'documents'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        Files & Documents ({getAllFiles().length})
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'criteria' ? (
                      <div className="space-y-4">
                        {currentCriteria ? (
                          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Award className="h-5 w-5" />
                                  {currentCriteria.displayName}
                                </h3>
                                {/* Pagination Footer */}
                                <div className="flex items-center justify-between ">
                                  <div className="flex items-center gap-4">
                                    {/* Navigation Controls */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-8 px-2"
                                        onClick={() => setCurrentCriteriaIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentCriteriaIndex === 0}
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="text-sm">Previous</span>
                                      </button>

                                      <span className="text-sm text-muted-foreground">|</span>

                                      <span className="text-sm font-medium whitespace-nowrap">
                                        {currentCriteriaIndex + 1} of {currentCriteria.totalTypes}
                                      </span>

                                      <span className="text-sm text-muted-foreground">|</span>

                                      <button
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-8 px-2"
                                        onClick={() => setCurrentCriteriaIndex(prev => Math.min(currentCriteria.totalTypes - 1, prev + 1))}
                                        disabled={currentCriteriaIndex >= currentCriteria.totalTypes - 1}
                                      >
                                        <span className="text-sm">Next</span>
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>

                                    {/* Go to Page Input */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground whitespace-nowrap">Go to page:</span>
                                      <input
                                        type="text"
                                        // It is highly recommended to control the input so it stays in sync
                                        // value={currentCriteriaIndex + 1}
                                        placeholder={currentCriteriaIndex + 1}
                                        onChange={(e) => {
                                          // Prevent NaN issues if user types non-numbers
                                          const val = Number(e.target.value);

                                          // Only trigger change if it is a valid number
                                          if (!isNaN(val)) {
                                            handleCriteriaChange(val);
                                          }
                                        }}
                                        className="flex h-8 w-16 text-sm text-center rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>


                              {/* Criteria Items */}
                              <div className="space-y-4">
                                {currentCriteria.items.map((item, index) => {
                                  const isUpdating = updatingCriteriaId === `${currentCriteria.type}-${item.id}`;
                                  const reviewStatus = item.criteria_admin_review;

                                  // Helper function to get item display name based on criteria type
                                  const getItemDisplayName = () => {
                                    if (item.award_name) return item.award_name;
                                    if (item.title) return item.title;
                                    if (item.name) return item.name;
                                    if (currentCriteria.type === 'high_salary') return 'Salary Evidence';
                                    return `Item ${index + 1}`;
                                  };

                                  return (
                                    <div
                                      key={item.id || index}
                                      className="p-4 border rounded-lg bg-muted/20"
                                    >
                                      {isViewMode && (
                                        <>
                                          < div className="mb-4 pb-4 border-b" >
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <h4 className="text-sm font-semibold">Criterion Decision</h4>
                                                <p className="text-xs text-muted-foreground">
                                                  Accept or reject this specific criterion
                                                </p>
                                              </div>
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => handleCriterionReview(currentCriteria.type, item.id, 'accepted')}
                                                  disabled={isUpdating || reviewStatus === 'accepted'}
                                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 rounded-md px-3 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
                                                >
                                                  {isUpdating ? (
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                  ) : (
                                                    <Check className="h-4 w-4 mr-1" />
                                                  )}
                                                  Accept Criterion
                                                </button>
                                                <button
                                                  onClick={() => handleCriterionReview(currentCriteria.type, item.id, 'rejected')}
                                                  disabled={isUpdating || reviewStatus === 'rejected'}
                                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 rounded-md px-3 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                                >
                                                  <X className="h-4 w-4 mr-1" />
                                                  Reject Criterion
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      {/* Admin Review Status Banner */}
                                      {reviewStatus === 'accepted' && (
                                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                            <Check className="h-4 w-4" />
                                            <span className="font-medium">Status: Accepted</span>
                                          </div>
                                          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                            This criterion has been reviewed and accepted
                                          </p>
                                        </div>
                                      )}
                                      {reviewStatus === 'rejected' && (
                                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                                          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                            <X className="h-4 w-4" />
                                            <span className="font-medium">Status: Rejected</span>
                                          </div>
                                          <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                                            This criterion has been reviewed and rejected
                                          </p>
                                          <p className='text-xs text-red-500 dark:text-red-600 mt-1'>
                                            Decided on {new Date(item.updated_at).toLocaleDateString(
                                                          'en-US',
                                                          { day: '2-digit', month: 'short', year: 'numeric' }
                                                        )}
                                          </p>
                                        </div>
                                      )}

                                      {/* Item Header */}
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-base mb-1 capitalize">
                                            {getItemDisplayName()}
                                          </h4>
                                          <div className="flex items-center gap-2 mb-2">
                                            {item.criteria_status && (
                                              <div className={getBadgeClasses(getStatusVariant(item.criteria_status))}>
                                                {statusApiToDisplay[item.criteria_status] || item.criteria_status}
                                              </div>
                                            )}
                                            {item.significance_level && (
                                              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                                                {item.significance_level}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Dynamic Fields Based on Criteria Type */}
                                      <div className="space-y-2 mb-3">
                                        {/* AWARDS Fields */}
                                        {currentCriteria.type === 'awards' && (
                                          <>
                                            {item.issuing_organization && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Organization: </span>
                                                {item.issuing_organization}
                                              </p>
                                            )}
                                            {item.date_received && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Date: </span>
                                                {new Date(item.date_received).toLocaleDateString()}
                                              </p>
                                            )}
                                            {item.description && (
                                              <p className="text-sm text-muted">Description : {item.description}</p>
                                            )}
                                            {item.significance_statement && (
                                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                                <p className="text-sm font-medium mb-1">Significance Statement</p>
                                                <p className="text-sm text-muted-foreground">{item.significance_statement}</p>
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {/* MEMBERSHIPS Fields */}
                                        {currentCriteria.type === 'memberships' && (
                                          <>
                                            {item.organization && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Organization: </span>
                                                {item.organization}
                                              </p>
                                            )}
                                            {item.membership_type && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Type: </span>
                                                {item.membership_type}
                                              </p>
                                            )}
                                            {item.date_joined && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Date Joined: </span>
                                                {new Date(item.date_joined).toLocaleDateString()}
                                              </p>
                                            )}
                                            {item.criteria && (
                                              <p className="text-sm text-muted-foreground">{item.criteria}</p>
                                            )}
                                            {item.significance_statement && (
                                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                                <p className="text-sm font-medium mb-1">Significance Statement</p>
                                                <p className="text-sm text-muted-foreground">{item.significance_statement}</p>
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {/* MEDIA COVERAGE Fields */}
                                        {currentCriteria.type === 'media_coverage' && (
                                          <>
                                            {item.publication && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Publication: </span>
                                                {item.publication}
                                              </p>
                                            )}
                                            {item.date && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Date: </span>
                                                {new Date(item.date).toLocaleDateString()}
                                              </p>
                                            )}
                                            {item.circulation && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Circulation: </span>
                                                {item.circulation}
                                              </p>
                                            )}
                                          </>
                                        )}

                                        {/* SCHOLARLY ARTICLES Fields */}
                                        {currentCriteria.type === 'scholarly_articles' && (
                                          <>
                                            {item.journal && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Journal: </span>
                                                {item.journal}
                                              </p>
                                            )}
                                            {item.impact_factor && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Impact Factor: </span>
                                                {item.impact_factor}
                                              </p>
                                            )}
                                            {item.citations !== undefined && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Citations: </span>
                                                {item.citations}
                                              </p>
                                            )}
                                            {item.date && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Date: </span>
                                                {new Date(item.date).toLocaleDateString()}
                                              </p>
                                            )}
                                          </>
                                        )}

                                        {/* JUDGING Fields */}
                                        {currentCriteria.type === 'judging' && (
                                          <>
                                            {item.organization && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Organization: </span>
                                                {item.organization}
                                              </p>
                                            )}
                                            {item.period && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Period: </span>
                                                {item.period}
                                              </p>
                                            )}
                                            {item.description && (
                                              <p className="text-sm text-muted-foreground">{item.description}</p>
                                            )}
                                            {item.supporting_documentation && (
                                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                                <p className="text-sm font-medium mb-1">Supporting Documentation</p>
                                                <p className="text-sm text-muted-foreground">{item.supporting_documentation}</p>
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {/* ORIGINAL CONTRIBUTIONS Fields */}
                                        {currentCriteria.type === 'original_contributions' && (
                                          <>
                                            {item.description && (
                                              <p className="text-sm text-muted-foreground">{item.description}</p>
                                            )}
                                            {item.impact && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Impact: </span>
                                                {item.impact}
                                              </p>
                                            )}
                                            {item.citations !== undefined && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Citations: </span>
                                                {item.citations}
                                              </p>
                                            )}
                                            {item.supporting_documentation && (
                                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                                <p className="text-sm font-medium mb-1">Supporting Documentation</p>
                                                <p className="text-sm text-muted-foreground">{item.supporting_documentation}</p>
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {/* HIGH SALARY Fields */}
                                        {currentCriteria.type === 'high_salary' && (
                                          <>
                                            {item.current_salary && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Current Salary: </span>
                                                ${item.current_salary}
                                              </p>
                                            )}
                                            {item.comparison && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Comparison: </span>
                                                {item.comparison}
                                              </p>
                                            )}
                                            {item.supporting_documentation && (
                                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                                <p className="text-sm font-medium mb-1">Supporting Documentation</p>
                                                <p className="text-sm text-muted-foreground">{item.supporting_documentation}</p>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {item?.url && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {React.createElement(getFieldIcon('url'), { className: "w-4 h-4 shrink-0" })}
                                            <span className="font-medium">URL:</span>
                                            <a className="line-clamp-1" href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                                          </div>
                                        )}
                                        {currentCriteria.type === 'commercial_success' && (
                                          <>
                                            {item.project && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Project: </span>
                                                {item.project}
                                              </p>
                                            )}
                                            {item.revenue && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Revenue: </span>
                                                {item.revenue}
                                              </p>
                                            )}
                                            {item.metrics && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Metrics: </span>
                                                {item.metrics}
                                              </p>
                                            )}
                                            {item.period && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Period: </span>
                                                {item.period}
                                              </p>
                                            )}
                                          </>
                                        )}


                                        {/* HOTELS (appears to be awards with different key) */}
                                        {currentCriteria.type === 'hotels' && (
                                          <>
                                            {item.issuing_organization && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Organization: </span>
                                                {item.issuing_organization}
                                              </p>
                                            )}
                                            {item.date_received && (
                                              <p className="text-sm">
                                                <span className="font-medium text-muted-foreground">Date: </span>
                                                {new Date(item.date_received).toLocaleDateString()}
                                              </p>
                                            )}
                                            {item.description && (
                                              <p className="text-sm text-muted-foreground">{item.description}</p>
                                            )}
                                          </>
                                        )}


                                      </div>

                                      {/* Attached Files */}
                                      {item.file_names && item.file_names.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                          <p className="text-sm font-medium mb-2">
                                            Attached Files ({item.file_names.length})
                                          </p>
                                          <div className="space-y-2">
                                            {item.file_names.map((fileName, fileIndex) => {
                                              const fileId = `${currentCriteria.type}-${fileName}`;
                                              const isViewing = viewingFileId === fileId;
                                              const isDownloading = downloadingFileId === fileId;
                                              const isDeleting = deletingFileId === fileId;

                                              return (
                                                <div
                                                  key={fileIndex}
                                                  className="flex items-center justify-between p-2 bg-background border rounded-md"
                                                >
                                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <FileText className="h-4 w-4 shrink-0" />
                                                    <span className="text-xs truncate">{fileName}</span>
                                                  </div>

                                                  <div className="flex gap-1">
                                                    {/* View Button */}
                                                    <button
                                                      onClick={() => handleViewFile(fileName, currentCriteria.type)}
                                                      disabled={isViewing || isDeleting}
                                                      className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                                                      title="View file"
                                                    >
                                                      {isViewing ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                      ) : (
                                                        <Eye className="h-3 w-3" />
                                                      )}
                                                    </button>

                                                    {/* Download Button */}
                                                    <button
                                                      onClick={() => handleDownloadFile(fileName, currentCriteria.type)}
                                                      disabled={isDownloading || isDeleting}
                                                      className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                                                      title="Download file"
                                                    >
                                                      {isDownloading ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                      ) : (
                                                        <Download className="h-3 w-3" />
                                                      )}
                                                    </button>
                                                    {isViewMode && (
                                                      <>
                                                        {/* Delete Button */}
                                                        < button
                                                          onClick={() => handleDeleteFile(fileName, currentCriteria.type, item.id)}
                                                          disabled={isDownloading || isDeleting}
                                                          className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                                          title="Delete file"
                                                        >
                                                          {isDeleting ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                          ) : (
                                                            <Trash className="h-3 w-3" />
                                                          )}
                                                        </button>
                                                      </>

                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )
                                      }

                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border bg-card p-8 text-center">
                            <p className="text-muted-foreground">No criteria data available</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {activeTab === 'documents' ? (
                          <div className="space-y-6">
                            {/* Check if there are any files at all */}
                            {detailedApplication?.criteria && Object.keys(detailedApplication.criteria).length > 0 ? (
                              Object.entries(detailedApplication.criteria).map(([key, items]) => {
                                // 1. Filter out items that have no files
                                const itemsWithFiles = items.filter(item => item.file_names && item.file_names.length > 0);

                                // If this criteria category has no files, don't render the card
                                if (itemsWithFiles.length === 0) return null;

                                return (
                                  <div key={key} className="rounded-lg border bg-card text-card-foreground shadow-sm">

                                    {/* Card Header */}
                                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                                      <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                                        {/* Dynamic Icon based on key could go here */}
                                        {criteriaDisplayNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                          {itemsWithFiles.reduce((acc, item) => acc + item.file_names.length, 0)} Files
                                        </span>
                                      </h3>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6">
                                      <div className="space-y-3">
                                        {itemsWithFiles.map((item) => (
                                          <React.Fragment key={item.id}>
                                            {item.file_names.map((fileName, fileIndex) => {
                                              const fileId = `${key}-${fileName}`;
                                              const isDownloading = downloadingFileId === fileId;
                                              const isViewing = viewingFileId === fileId;
                                              const isDeleting = deletingFileId === fileId;
                                              const status = item.criteria_admin_review || 'pending';
                                              let badgeClass = "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"; // Default/Pending
                                              if (status === 'accepted' || status === 'approved') badgeClass = "border-transparent bg-green-500 text-white hover:bg-green-600";
                                              if (status === 'rejected') badgeClass = "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80";

                                              return (
                                                <div
                                                  key={`${item.id}-${fileIndex}`}
                                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors"
                                                >
                                                  {/* Left: File Info */}
                                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="h-10 w-10 rounded bg-muted/50 flex items-center justify-center shrink-0">
                                                      {getFileIcon(fileName)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-medium truncate capitalize" title={fileName}>
                                                        {fileName || "Unnamed"}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground truncate">
                                                        Uploaded: {new Date(item.updated_at).toLocaleDateString(
                                                          'en-US',
                                                          { day: '2-digit', month: 'short', year: 'numeric' }
                                                        )}
                                                      </p>
                                                    </div>
                                                  </div>

                                                  {/* Right: Status & Actions */}
                                                  <div className="flex items-center gap-4">
                                                    {/* Status Badge */}
                                                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none capitalize ${badgeClass}`}>
                                                      {status === 'accepted' ? 'Approved' : status}
                                                    </div>
                                                    {/* Action Buttons */}
                                                    <div className="flex gap-1">
                                                      {/* View */}
                                                      <button
                                                        onClick={() => handleViewFile(fileName, key)}
                                                        disabled={isViewing || isDeleting}
                                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                                        title="View Document"
                                                      >
                                                        {isViewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                                      </button>

                                                      {/* Download */}
                                                      <button
                                                        onClick={() => handleDownloadFile(fileName, key)}
                                                        disabled={isDownloading || isDeleting}
                                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                                        title="Download"
                                                      >
                                                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}

                                                      </button>

                                                      {/* Delete (View Mode Only) */}
                                                      {isViewMode && (
                                                        <>
                                                          <button
                                                            onClick={() => handleDeleteFile(fileName, key, item.id)}
                                                            disabled={isDownloading || isDeleting}
                                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-100 hover:text-red-600 h-9 rounded-md px-3"
                                                            title="Delete"
                                                          >
                                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                                                          </button>

                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="rounded-lg border bg-card p-12 text-center">
                                <div className="flex justify-center mb-4">
                                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                </div>
                                <h3 className="text-lg font-medium">No documents found</h3>
                                <p className="text-muted-foreground mt-1">This application does not have any attached files yet.</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // ... Criteria Tab Content (This part remains as it was in the logic above the else) ...
                          null
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div >
          {isDeleteModalOpen && fileToDelete && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={cancelDeleteFile} // Click outside to close
            >
              {/* Modal Content */}
              <div
                onClick={(e) => e.stopPropagation()} // Prevent close on click inside
                className="w-full max-w-md bg-white border border-red-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex flex-col items-center text-center p-6">

                  {/* Icon Circle */}
                  <div className="rounded-full bg-red-50 p-3 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>

                  {/* Header Text */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Delete this file?
                  </h3>

                  <p className="text-sm text-slate-500 mb-6">
                    Are you sure you want to delete <span className="font-medium text-slate-900">"{fileToDelete.fileName}"</span>?
                    This action cannot be undone.
                  </p>

                  {/* Warning Alert Box */}
                  <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-red-900 leading-snug">
                      This file will be permanently removed from the server.
                    </span>
                  </div>

                  {/* Action Buttons */}
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
          {pdfViewerOpen && pdfData && (
            <PDFViewerModal
              pdfData={pdfData}
              fileName={currentPdfFileName}
              onClose={handleClosePdfViewer}
              onDownload={handleDownloadFromViewer}
            />
          )
          }
        </>
      )
      }
      {/* Application Rejection Dialog */}
      {showRejectAppDialog && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => {
            setShowRejectAppDialog(false);
            setRejectionReason('');
            setPendingRejectStatus(null);
          }} />

          {/* Dialog */}
          <div
            role="dialog"
            className="fixed left-[50%] top-[50%] z-[70] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                Reject Application?
              </h2>
              <p className="text-sm text-muted-foreground">
                Please provide a rejection reason.
              </p>
            </div>

            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={isUpdatingStatus}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                onClick={() => {
                  setShowRejectAppDialog(false);
                  setRejectionReason('');
                  setPendingRejectStatus(null);
                }}
                disabled={isUpdatingStatus}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApplicationRejection}
                disabled={isUpdatingStatus || !rejectionReason.trim()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowRejectAppDialog(false);
                setRejectionReason('');
                setPendingRejectStatus(null);
              }}
              disabled={isUpdatingStatus}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </>
      )}
      {/* Criterion Rejection Dialog */}
      {showRejectCriterionDialog && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => {
            setShowRejectCriterionDialog(false);
            setCriterionRejectionReason('');
            setPendingRejectCriterion(null);
          }} />

          {/* Dialog */}
          <div
            role="dialog"
            className="fixed left-[50%] top-[50%] z-[70] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                Reject This Criterion?
              </h2>
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting "{currentCriteria?.displayName || 'this criterion'}".
              </p>
            </div>

            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
              placeholder="Enter rejection reason..."
              value={criterionRejectionReason}
              onChange={(e) => setCriterionRejectionReason(e.target.value)}
              disabled={!!updatingCriteriaId}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                onClick={() => {
                  setShowRejectCriterionDialog(false);
                  setCriterionRejectionReason('');
                  setPendingRejectCriterion(null);
                }}
                disabled={!!updatingCriteriaId}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCriterionRejection}
                disabled={!!updatingCriteriaId || !criterionRejectionReason.trim()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                {updatingCriteriaId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowRejectCriterionDialog(false);
                setCriterionRejectionReason('');
                setPendingRejectCriterion(null);
              }}
              disabled={!!updatingCriteriaId}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default ApplicationReview;
