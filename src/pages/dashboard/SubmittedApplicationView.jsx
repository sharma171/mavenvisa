//submittedApplicationView
import React, { useEffect, useState } from "react";
import PDFViewerModal from './PDFViewerModal';
import {
  ArrowLeft, Plus, FileText, Building, CircleCheckBig, Clock, Eye, Calendar,
  Text, SignalHigh, StickyNote, FileTextIcon, File, Download, Trash, X,
  ZoomIn, ZoomOut, Award, Users, Newspaper, Briefcase, DollarSign,
  TrendingUp, Hash, Link, Globe, BookOpen, BadgeCheck,
  Loader2,
  Image,
  AlertTriangle,
  Trash2
} from "lucide-react";
import axiosApi from "networking/axiosApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ApplicationsModalView from "./ApplicationsModalView";
import { ThemeLoader } from "components";
import toast from "react-hot-toast";

const BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";

const CARD_CLASS = "rounded-lg border bg-card text-card-foreground shadow-sm";

let apiBaseUrl = "https://get-all-applications-frontend-v1-356312339779.us-east1.run.app/";
const APPLICATIONS_API_URL =
  "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

const SubmittedApplicationView = ({ onBack, applicationId }) => {
  // const [applicationsData, setApplicationsData] = useState({});
  const [singleApplicationsData, setSingleApplicationsData] = useState({});

  const [downloadLoader, setDownloadLoader] = useState(false);
  const [viewLoader, setViewLoader] = useState(false);
  const [visaCriteriaData, setVisaCriteriaData] = useState();
  const [selectedVisaType, setSelectedVisaType] = useState("");
  const [applicationView, setApplicationView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [fullApplicationData, setFullApplicationData] = useState([]);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [viewingFileId, setViewingFileId] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');
  const [expandedCriteria, setExpandedCriteria] = useState({});

  // --- NEW: Delete Modal States ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // --- NEW: Cancel Delete ---
  const cancelDeleteFile = () => {
    if (deletingFileId) return; // Prevent closing while deleting
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  // --- NEW: Confirm Delete (API Call) ---
  const onConfirmDeleteFile = () => {
    if (!fileToDelete || !userEmail) return;

    const { fileName, item, idx, criterion } = fileToDelete;

    // Construct unique ID for loading state
    const fileId = `${item.id}-${idx}`;
    setDeletingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "delete_file",
      firebase_doc_id: application_id,
      criterion: criterion.category_name === "awards_prizes"
        ? "awards"
        : criterion.category_name.toLowerCase().replaceAll(" ", "_"),
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');
          // Close modal
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
          // Refresh details
          getApplicationsDetails();
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


  const navigate = useNavigate();

  // const application = applicationsData?.applications?.[0];
  const application_id = applicationId;

  const userData = useSelector((state) => state?.data?.userData);
  let user = userData?.user || {};
  let userEmail = user?.email;
  const singleApplicationData = singleApplicationsData?.application || {};
  const statistics = singleApplicationData?.statistics || {};
  let criteria_data = singleApplicationData?.criteria_data || {};
  criteria_data = Object.values(criteria_data) || [];


  // useEffect(() => {
  //   getAllApplicationsDetails();
  // }, [userEmail]);

  useEffect(() => {
    const handler = setTimeout(() => {
      getApplicationsDetails();
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [userEmail, application_id, applicationView]);

  const getApplicationsDetails = () => {
    if (!userEmail || !application_id) {
      return;
    }

    const payload = {
      user_email: userEmail,
      task: "indepth_details",
      firebase_doc_id: application_id, // this is the doc id from dashboard
    };

    setLoading(true);

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((res) => {
        const app = res.data?.application || {};
        setSelectedVisaType(app.visa_type);
        setFullApplicationData(app);

        // Map new API shape to what this component expects
        const mapped = {
          application: {
            // keep a stable id for this view; use document_id or firebase_doc_id
            application_id: app.document_id || application_id,
            visa_type: app.visa_type,
            application_status: app.application_status,
            statistics: {
              criteria_submitted: app.criteria_completed || 0,
              total_items: Object.values(app.criteria || {}).reduce(
                (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
                0
              ),
            },
            // criteria_data: object keyed by criterion with items[] arrays
            criteria_data: Object.entries(app.criteria || {}).reduce(
              (acc, [criterionKey, itemsArray]) => {
                const items = Array.isArray(itemsArray) ? itemsArray : [];
                acc[criterionKey] = {
                  title: criterionKey,
                  // you can add a nicer name if you have a mapping
                  items,
                };
                return acc;
              },
              {}
            ),
          },
        };

        setSingleApplicationsData(mapped);
        // getVisaCriteria();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Icon mapping for different field types
  const getFieldIcon = (fieldKey) => {
    const iconMap = {
      // Publications & Media
      publication: Newspaper,
      circulation: TrendingUp,

      // Organizations
      issuing_organization: Building,
      organization: Building,

      // Memberships
      membership_type: BadgeCheck,
      criteria: FileText,

      // Dates
      date_joined: Calendar,
      date_received: Calendar,
      date: Calendar,
      period: Calendar,

      // Awards & Recognition
      significance_level: Award,
      significance_statement: FileText,
      award_name: Award,

      // Projects & Business
      project: Briefcase,
      revenue: DollarSign,
      metrics: TrendingUp,

      // Salary related
      current_salary: DollarSign,
      salary_comparison: TrendingUp,
      salary_currency: DollarSign,
      salary_period: Calendar,
      comparison: TrendingUp,

      // Locations & Events
      venue: Building,

      // Impact & Metrics
      impact: SignalHigh,
      citations: Hash,
      impact_factor: SignalHigh,

      // Links
      url: Link,

      // Default
      default: StickyNote
    };

    return iconMap[fieldKey] || iconMap.default;
  };

  useEffect(() => {
    if (selectedVisaType) {
      getVisaCriteria()
    }
  }, [selectedVisaType])
  const getVisaCriteria = () => {
    if (!userEmail || !singleApplicationsData) {
      return;
    }

    const payload = {
      "action": "get_visa_criteria",
      "visa_type": selectedVisaType
    };

    setLoading(true);

    axiosApi
      .post("https://get-all-applications-frontend-v1-356312339779.us-east1.run.app", payload)
      .then((res) => {
        const visaResData = res || {};
        console.log("resData", visaResData.data);
        setVisaCriteriaData(visaResData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };




  // const getAllApplicationsDetails = () => {
  //   if (!userEmail) {
  //     return;
  //   }

  //   let payload = {
  //     action: "get_applications",
  //     email: userEmail,
  //     include_summary: true,
  //   };

  //   setLoading(true);
  //   axiosApi
  //     .post(apiBaseUrl, payload)
  //     .then((res) => {
  //       setApplicationsData(res?.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  // which fields + labels to show for each criterion type
  // const CRITERIA_FIELD_CONFIG = {
  //   awards: [
  //     { key: "award_name", label: "Award", icon: StickyNote },
  //     { key: "issuing_organization", label: "Issuing Organization", icon: Building },
  //     { key: "significance_level", label: "Significance level", icon: SignalHigh },
  //     { key: "significance_statement", label: "Significance statement", icon: StickyNote },
  //     { key: "date_received", label: "Date received", icon: Calendar, isDate: true },
  //   ],
  //   memberships: [
  //     { key: "organization", label: "Organization", icon: Building },
  //     { key: "membership_type", label: "Membership type", icon: StickyNote },
  //     { key: "criteria", label: "Criteria", icon: StickyNote },
  //     { key: "date_joined", label: "Date joined", icon: Calendar, isDate: true },
  //     { key: "supporting_documentation", label: "Supporting documentation", icon: Text },
  //   ],
  //   scholarly_articles: [
  //     { key: "title", label: "Title", icon: StickyNote },
  //     { key: "journal", label: "Journal", icon: Building },
  //     { key: "impact_factor", label: "Impact factor", icon: SignalHigh },
  //     { key: "citations", label: "Citations", icon: SignalHigh },
  //     { key: "date", label: "Date", icon: Calendar, isDate: true },
  //     { key: "url", label: "URL", icon: Text },
  //   ],
  //   media_coverage: [
  //     { key: "title", label: "Title", icon: StickyNote },
  //     { key: "publication", label: "Publication", icon: Building },
  //     { key: "circulation", label: "Circulation", icon: SignalHigh },
  //     { key: "date", label: "Date", icon: Calendar, isDate: true },
  //     { key: "url", label: "URL", icon: Text },
  //   ],
  //   judging: [
  //     { key: "title", label: "Title", icon: StickyNote },
  //     { key: "organization", label: "Organization", icon: Building },
  //     { key: "period", label: "Period", icon: Calendar },
  //     { key: "supporting_documentation", label: "Supporting documentation", icon: Text },
  //   ],
  //   leadership_role: [
  //     { key: "title", label: "Title", icon: StickyNote },
  //     { key: "organization", label: "Organization", icon: Building },
  //     { key: "period", label: "Period", icon: Calendar },
  //     { key: "responsibilities", label: "Responsibilities", icon: Text },
  //     { key: "achievements", label: "Achievements", icon: Text },
  //   ],
  //   exhibitions: [
  //     { key: "title", label: "Title", icon: StickyNote },
  //     { key: "venue", label: "Venue", icon: Building },
  //     { key: "date", label: "Date", icon: Calendar, isDate: true },
  //     { key: "supporting_documentation", label: "Supporting documentation", icon: Text },
  //   ],
  //   commercial_success: [
  //     { key: "project", label: "Project", icon: StickyNote },
  //     { key: "period", label: "Period", icon: Calendar },
  //     { key: "revenue", label: "Revenue", icon: SignalHigh },
  //     { key: "metrics", label: "Metrics", icon: SignalHigh },
  //   ],
  //   original_contributions: [
  //     { key: "title", label: "Title", icon: StickyNote },
  //     { key: "impact", label: "Impact", icon: SignalHigh },
  //     { key: "citations", label: "Citations", icon: SignalHigh },
  //     { key: "supporting_documentation", label: "Supporting documentation", icon: Text },
  //   ],
  //   high_salary: [
  //     { key: "current_salary", label: "Current salary", icon: SignalHigh },
  //     { key: "comparison", label: "Comparison", icon: SignalHigh },
  //     { key: "supporting_documentation", label: "Supporting documentation", icon: Text },
  //   ],
  // };

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


  const renderCriteriaItems = (data = [], criterion) => {
    const criterionKey = criterion.category_name; // Unique key for this criterion
    const isExpanded = expandedCriteria[criterionKey] || false;
    const itemsToShow = isExpanded ? data : data.slice(0, 1); // Show only first item or all
    const hasMoreItems = data.length > 1;

    // Toggle expansion for this criterion
    const toggleExpanded = () => {
      setExpandedCriteria(prev => ({
        ...prev,
        [criterionKey]: !prev[criterionKey]
      }));
    };

    // Handle file download
    const handleDownloadFile = (fileName, item) => {
      setApplicationView(false); // Added this line
      setDownloadLoader(true);
      const fileId = `${item.id}-${item.file_names.indexOf(fileName)}`;
      setDownloadingFileId(fileId);

      const payload = {
        user_email: userEmail,
        task: "download_file",
        firebase_doc_id: application_id,
        criterion: criterion.category_name === "awards_prizes"
          ? "awards"
          : criterion.category_name.toLowerCase().replaceAll(" ", "_"),
        file_name: fileName,
      };

      axiosApi
        .post(APPLICATIONS_API_URL, payload)
        .then((res) => {
          const fileData = res.data?.file;

          if (fileData && fileData.base64_content) {
            // Convert base64 to blob
            const byteCharacters = atob(fileData.base64_content);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileData.file_name || fileName;
            document.body.appendChild(a);
            a.click();

            // Cleanup
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
          setApplicationView(false); // Added this line
          setDownloadLoader(false);
        });
    };


    // Handle file view
    const handleViewFile = (fileName, item) => {
      setViewLoader(true);
      setApplicationView(false); // Added this line
      const fileId = `${item.id}-${item.file_names.indexOf(fileName)}`;
      setViewingFileId(fileId);



      const payload = {
        user_email: userEmail,
        task: "download_file",
        firebase_doc_id: application_id,
        criterion: criterion.category_name === "awards_prizes"
          ? "awards"
          : criterion.category_name.toLowerCase().replaceAll(" ", "_"),
        file_name: fileName,
      };

      axiosApi
        .post(APPLICATIONS_API_URL, payload)
        .then((res) => {
          const fileData = res.data?.file;

          if (fileData && fileData.base64_content) {
            // Set the PDF data for the viewer
            setCurrentPdfData(fileData.base64_content);
            setCurrentPdfFileName(fileData.file_name || fileName);
            setPdfViewerOpen(true);
          } else {
            toast.error("Invalid PDF data received");
          }
        })
        .catch((error) => {
          console.error('Error viewing file:', error);
          toast.error("File not found");
        })
        .finally(() => {
          setViewingFileId(null);
          setApplicationView(false); // Added this line
          setLoading(false);
          setViewLoader(false)
        });
    };

    const handleDeleteFile = (fileName, item, idx) => {
      setApplicationView(false);
      // Store all necessary data to perform delete later
      setFileToDelete({ fileName, item, idx, criterion });
      setIsDeleteModalOpen(true);
    };

    // Helper function to find the criterion key for an item
    const findCriterionKey = (item) => {
      // Loop through criteria_data to find which criterion contains this item
      for (const [key, value] of Object.entries(criteria_data)) {
        if (value.items && value.items.some(i => i.id === item.id)) {
          return key;
        }
      }
      return null;
    };

    return (
      <>
        {itemsToShow.map((item, index) => {
          return (<>

            <div key={index} className="border rounded-lg p-4 space-y-3 bg-background min-h-[300px] flex flex-col justify-between">
              <div>
                {/* {console.log("elements", item)} */}
                <div className="space-y-2">
                  <div className="flex-1 space-y-2 flex items-center justify-between"
                    onClick={() => { setApplicationView(criterion); console.log(criterion) }}
                  >
                    {/* Main heading: award, title, org, project, fallback */}
                    {item?.award_name || item?.title || item?.project || item?.organization || item?.current_salary ? (
                      <h4 className="font-medium text-lg line-clamp-1">
                        {item.award_name || item.title || item.project || item.organization || item?.current_salary && (<>Salary Info</>)}
                      </h4>
                    ) : (
                      <div />
                    )}
                    {index == 0 && (<>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground text-nowrap">Click to view</span>
                      </div>
                    </>)}

                  </div>
                  <>
                    {item?.criteria_admin_review == "rejected" ? (<>
                      {item.description !== "" && (<>
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-xs"
                          onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                          <p className="text-red-700 dark:text-red-400">
                            <span className="font-semibold">Reason:</span> {item.description}
                          </p>
                        </div>
                      </>)}

                    </>) : (<></>)}
                  </>

                  {item?.circulation && (
                    <>
                      {item?.publication && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"
                          onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                          {React.createElement(getFieldIcon('publication'), { className: "w-4 h-4 shrink-0" })}
                          <span className="font-medium">Publication:</span>
                          <span className="line-clamp-1">{item.publication}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"
                        onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                        {React.createElement(getFieldIcon('circulation'), { className: "w-4 h-4 shrink-0" })}
                        <span className="font-medium">Circulation:</span>
                        <span className="line-clamp-1">{item.circulation}</span>
                      </div>
                    </>
                  )}


                  {/* Memberships */}
                  {item?.achievements && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('award_name'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Achievements:</span>
                      <span className="line-clamp-1">{item.achievements}</span>
                    </div>
                  )}
                  {/* Memberships */}
                  {item?.period && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('period'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Period:</span>
                      <span className="line-clamp-1">{item.period}</span>
                    </div>
                  )}

                  {/* Awards */}
                  {item?.issuing_organization ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('issuing_organization'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Organization:</span>
                      <span className="line-clamp-1">{item.issuing_organization}</span>
                    </div>
                  ) : (
                    <>
                      {item?.organization && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"
                          onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                          {React.createElement(getFieldIcon('organization'), { className: "w-4 h-4 shrink-0" })}
                          <span className="font-medium">Organization:</span>
                          <span className="truncate flex-1 min-w-0 line-clamp-1">{item.organization}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Memberships */}
                  {item?.membership_type && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('membership_type'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Membership type:</span>
                      <span className="line-clamp-1">{item.membership_type}</span>
                    </div>
                  )}

                  {item?.responsibilities && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('impact_factor'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Responsibilities:</span>
                      <span className="line-clamp-1">{item.responsibilities}</span>
                    </div>
                  )}

                  {item?.date_joined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('date_joined'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Date Joined:</span>
                      <span className="line-clamp-1">{item.date_joined}</span>
                    </div>
                  )}

                  {item?.date_received && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('date_received'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Date received:</span>
                      <span className="line-clamp-1">{item.date_received}</span>
                    </div>
                  )}

                  {item?.significance_level && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('significance_level'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Significance level:</span>
                      <span className="line-clamp-1">{item.significance_level}</span>
                    </div>
                  )}

                  {item?.significance_statement && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('significance_statement'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium text-nowrap">Significance statement:</span>
                      <span className="line-clamp-1">{item.significance_statement}</span>
                    </div>
                  )}

                  {item?.criteria && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('criteria'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Criteria:</span>
                      <span className="line-clamp-1">{item.criteria}</span>
                    </div>
                  )}

                  {/* Commercial success */}
                  {item?.project && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('project'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Project:</span>
                      <span className="line-clamp-1">{item.project}</span>
                    </div>
                  )}

                  {item?.revenue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('revenue'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Revenue:</span>
                      <span className="line-clamp-1">{item.revenue}</span>
                    </div>
                  )}

                  {item?.metrics && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('metrics'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Metrics:</span>
                      <span className="line-clamp-1">{item.metrics}</span>
                    </div>
                  )}

                  {item?.current_salary && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('current_salary'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Current salary:</span>
                      <span className="line-clamp-1">{item.current_salary}</span>
                    </div>
                  )}

                  {item?.salary_comparison && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('salary_comparison'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Salary Comparison:</span>
                      <span className="line-clamp-1">{item.salary_comparison}</span>
                    </div>
                  )}

                  {item?.salary_currency && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('salary_currency'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Salary Currency:</span>
                      <span className="line-clamp-1">{item.salary_currency}</span>
                    </div>
                  )}

                  {item?.salary_period && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('salary_period'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Salary Period:</span>
                      <span className="line-clamp-1">{item.salary_period}</span>
                    </div>
                  )}

                  {item?.comparison && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('comparison'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Comparison:</span>
                      <span className="line-clamp-1">{item.comparison}</span>
                    </div>
                  )}

                  {item?.evidence_count !== "" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('venue'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Evidence Count:</span>
                      <span className="line-clamp-1">{item.evidence_count}</span>
                    </div>
                  )}
                  {item?.venue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('venue'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Venue:</span>
                      <span className="line-clamp-1">{item.venue}</span>
                    </div>
                  )}

                  {item?.impact && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('impact'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Impact:</span>
                      <span className="line-clamp-1">{item.impact}</span>
                    </div>
                  )}
                  {item?.impact_factor && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('impact'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Impact Factor:</span>
                      <span className="line-clamp-1">{item.impact_factor}</span>
                    </div>
                  )}
                  {item?.journal && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('citations'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Journal:</span>
                      <span className="line-clamp-1">{item.journal}</span>
                    </div>
                  )}

                  {item?.citations !== undefined && item?.citations !== null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('citations'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">Citations:</span>
                      <span className="line-clamp-1">{item.citations}</span>
                    </div>
                  )}

                  {item?.url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      {React.createElement(getFieldIcon('url'), { className: "w-4 h-4 shrink-0" })}
                      <span className="font-medium">URL:</span>
                      <span className="line-clamp-1">{item.url}</span>
                    </div>
                  )}

                  {item.file_names && item.file_names.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">
                        Uploaded Files ({item.file_names.length})
                      </p>
                      <div className="space-y-2">
                        {item.file_names.map((fileName, idx) => (
                          fileName !== null && (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-background border rounded-md"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(fileName)}
                                <span className="text-xs truncate">{fileName}</span>
                              </div>
                              <div className="flex gap-1">
                                {/* View Button */}
                                <button
                                  className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                                  title="View file"
                                  onClick={() => handleViewFile(fileName, item)}
                                  disabled={viewingFileId === `${item.id}-${idx}`}
                                >
                                  {viewLoader && viewingFileId === `${item.id}-${idx}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}

                                </button>

                                {/* Download Button */}
                                <button
                                  className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                                  title="Download file"
                                  onClick={() => handleDownloadFile(fileName, item)}
                                  disabled={downloadingFileId === `${item.id}-${idx}`}
                                >
                                  {downloadLoader && downloadingFileId === `${item.id}-${idx}` ? (
                                    <Clock className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-3 w-3"
                                    >
                                      <path d="M12 15V3"></path>
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                      <path d="m7 10 5 5 5-5"></path>
                                    </svg>
                                  )}
                                </button>

                                {/* Delete Button */}
                                <button
                                  className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                  title="Delete file"
                                  onClick={() => handleDeleteFile(fileName, item, idx)}
                                  disabled={deletingFileId === `${item.id}-${idx}`}
                                >
                                  {deletingFileId === `${item.id}-${idx}` ? (
                                    <Clock className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-3 w-3"
                                    >
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                      <path d="M3 6h18"></path>
                                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}






                  {item?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 fs-14"
                      onClick={() => { setApplicationView(criterion); console.log(criterion) }}>
                      <strong className="text-nowrap">Description : </strong>{item.description}
                    </p>
                  )}
                </div >

              </div>
              <div className="space-y-3">
                <div className="shrink-0 bg-border h-[1px] w-full " />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Created:{" "}
                    {new Date(item.created_at).toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span>ID: {item?.id}</span>
                </div>
              </div>
            </div>
          </>)
        })}
        {/* Show More / Show Less Button */}
        {hasMoreItems && (
          <div className="flex justify-center mt-4" onClick={toggleExpanded}>
            {/* <button
              onClick={toggleExpanded}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            > */}
            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal ">


              {isExpanded ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                  <span className="text-muted">
                    Show Less
                  </span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>

                  <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal">

                    Show More ({data.length - 1} more item{data.length - 1 !== 1 ? 's' : ''})
                  </span>
                </>
              )}
            </div>
            {/* </button> */}
          </div>
        )}
        {applicationView ? (
          <ApplicationsModalView
            applicationView={applicationView}
            setApplicationView={setApplicationView}
            fullApplicationData={fullApplicationData} setFullApplicationData={setFullApplicationData}
          />
        ) : null}

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
            // Trigger download from the modal
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

      </>
    );
  };



  const KEY_MAP = {
    awards_prizes: "awards",
    // add more mismatches here if needed
  };

  const renderAllApplications = () => {
    const criteriaDefinitions = visaCriteriaData?.data?.criteria || [];
    const criteriaObj = singleApplicationData?.criteria_data || {};

    const mergedCriteria = criteriaDefinitions.map((def) => {
      const uiKey = def.category_name;                 // e.g. "awards_prizes"
      const apiKey = KEY_MAP[uiKey] || uiKey;          // e.g. "awards" for awards_prizes
      const dataForKey = criteriaObj[apiKey] || {};
      const items = dataForKey.items || [];

      return {
        ...def,                                       // criteria_number, category_name, title, description
        items,                                        // evidence items from application
      };
    });

    return mergedCriteria.map((criterion) => {
      const itemsData = criterion.items || [];

      // Only render if there are items
      if (itemsData.length === 0) return null;

      return (

        <div
          key={criterion.criteria_number}
          className={`rounded-lg border text-card-foreground shadow-sm cursor-pointer hover:shadow-md transition-shadow ${itemsData[0]?.criteria_admin_review == "rejected" ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" : "bg-muted/20"}`}
          style={{ marginBottom: "auto" }}
        // onClick={() => { setApplicationView(criterion); console.log(criterion) }}
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center gap-2 justify-between">
              <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center gap-2">
                <span className="line-clamp-1">
                  {criterion.criteria_number}. {criterion.title}
                </span>
                {/* <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 whitespace-nowrap">
                  {itemsData.length} items
                </div> */}
              </h3>
              <div className="flex items-center gap-2">
                {/* {console.log("mainitems",itemsData[0].criteria_admin_review)} */}
                {itemsData[0]?.criteria_admin_review == "rejected" ? (<>
                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent 
                  bg-destructive text-destructive-foreground hover:bg-destructive/80 text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-circle-x w-3 h-3 mr-1"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>
                      Rejected by Admin
                    </div>
                  </div>

                </>) : (<>
                  {itemsData[0].criteria_admin_review == "accepted" ? (<>
                    <div className="flex flex-col items-end gap-1">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent 
                  bg-green-500 hover:bg-green-600 text-white text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-circle-check-big w-3 h-3 mr-1"
                        >
                          <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                          <path d="m9 11 3 3L22 4" />
                        </svg>
                        Accepted
                      </div>
                    </div>

                  </>) : (<>

                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground capitalize">
                      <Clock className="w-3 h-3 mr-1 shrink-0" />
                      {itemsData[0].criteria_admin_review || itemsData[0].criteria_status}
                    </div>

                  </>)}
                </>)}
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            {/* Pass criterion as second parameter */}
            <div className="space-y-4">{renderCriteriaItems(itemsData, criterion)}</div>
          </div>
        </div>
      );
    }).filter(Boolean); // Remove null values
  };


  function DashboardCards() {
    const cards = [
      {
        id: "total",
        title: "Total Items",
        value: () => statistics?.total_items || 0,
        icon: FileText,
        iconClass: "w-8 h-8 text-muted-foreground",
        extraClass: " cursor-pointer hover:shadow-md transition-shadow",
      },
      {
        id: "criteria",
        title: "No. of Changes",
        value: () => statistics?.criteria_submitted || 0,
        icon: Building,
        iconClass: "w-8 h-8 text-muted-foreground",
      },
      {
        id: "approved",
        title: "Approved",
        value: () => 0,
        icon: CircleCheckBig,
        iconClass: "w-8 h-8 text-green-600",
        valueClass: "text-2xl font-bold text-green-600",
      },
      {
        id: "drafts",
        title: "Drafts",
        value: () => 0,
        icon: Clock,
        iconClass: "w-8 h-8 text-yellow-600",
        valueClass: "text-2xl font-bold text-yellow-600",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className={CARD_CLASS + (c.extraClass ? c.extraClass : "")}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{c.title}</p>
                    <p className={c.valueClass || "text-2xl font-bold"}>{c.value()}</p>
                  </div>
                  <Icon className={c.iconClass} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-8xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button onClick={onBack} className={BUTTON_CLASS + " hover:bg-accent hover:text-accent-foreground"}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Your Applications</h1>
              <p className="text-muted-foreground">Review and manage your submitted criteria responses</p>
            </div>

            <button
              onClick={() => navigate("/newvisaform")}
              className={BUTTON_CLASS + " bg-primary text-primary-foreground hover:bg-primary/90"}
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Application
            </button>
          </div>

          {DashboardCards()}

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold tracking-tight text-lg flex items-center justify-between">
                <span>Application Status</span>
                {fullApplicationData.application_status === "rejected application" ? (<>

                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors 
                      focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent 
                      hover:bg-primary/80 bg-red-500 text-white">
                    Rejected Application
                  </div>
                </>) : (<>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors 
                      focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent 
                      hover:bg-primary/80 bg-primary text-white">
                    {fullApplicationData.application_status
                      ? fullApplicationData.application_status.charAt(0).toUpperCase() + fullApplicationData.application_status.slice(1)
                      : ""}

                  </div>

                </>)}
              </h3>
              <p className="text-sm text-muted-foreground">

                Status changed on {new Date(fullApplicationData.last_updated).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}

                {fullApplicationData.application_status_reason !== "" && fullApplicationData.application_status === "rejected application" && (<>
                  <span className="block text-destructive mt-1">
                    Reason: {fullApplicationData.application_status_reason}
                  </span>
                </>)}

              </p>
            </div>
            {fullApplicationData.application_status === "rejected application" && (<>
              <div className="p-6 pt-0">
                <div className="rounded-lg p-3 mb-4 bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-square-pen w-4 h-4 text-green-600"
                    >
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                    </svg>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      You can edit your application while status is "Rejected Application"
                    </span>
                  </div>
                </div>
              </div>
            </>)}

            <div className="p-6 pt-0">

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Status History</h4>
                <div className="space-y-2">
                  {/* In Progress */}
                  <div className="flex items-start gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 text-white"></div>
                      <div className="w-px h-6 bg-border mt-1"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Created</span>
                        <span className="text-muted-foreground text-xs">{new Date(fullApplicationData.created_at).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* In Review */}
                  <div className="flex items-start gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 text-white"></div>
                      <div className="w-px h-6 bg-border mt-1"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{fullApplicationData.application_status
                          ? fullApplicationData.application_status.charAt(0).toUpperCase() + fullApplicationData.application_status.slice(1)
                          : ""}</span>
                        <span className="text-muted-foreground text-xs">{new Date(fullApplicationData.last_updated).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}</span>
                      </div>
                      {fullApplicationData.application_status === "in review" && (<>
                        <p className="text-xs text-orange-600 mt-0.5 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-info w-3 h-3"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          Editing was locked during this status
                        </p>
                      </>)}
                      {fullApplicationData.application_status === "on hold" && (<>
                        <p className="text-xs text-orange-600 mt-0.5 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-info w-3 h-3"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          Editing was locked during this status
                        </p>
                      </>)}

                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>


          {/* Criteria Details */}
          <div className="space-y-6 mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <h2 className="text-xl font-semibold">Application Criteria</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{renderAllApplications()}</div>
          </div>
        </div>
        <ThemeLoader show={loading} />
      </div>
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
                Are you sure you want to delete <span className="font-medium text-slate-900">"{fileToDelete.fileName}"</span>?
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
      {applicationView ? (
        <ApplicationsModalView applicationView={applicationView} setApplicationView={setApplicationView} fullApplicationData={fullApplicationData} setFullApplicationData={setFullApplicationData} />
      ) : (
        <></>
      )}
    </>
  );
};

export default SubmittedApplicationView;
