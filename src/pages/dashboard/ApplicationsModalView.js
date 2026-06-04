//ApplicationsModalView
import React, { useState, useEffect } from "react";
import { Plus, Pen, Trash2, X, PenLine, File as FileIcon, Image, Eye, Clock, Download, FileText as FileTextIcon } from "lucide-react";
import PDFViewerModal from './PDFViewerModal'; // Make sure the path is correct
import { OverlayModal } from "components";
import FileUpload from "components/FileUpload";
import axiosApi from "networking/axiosApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ThemeLoader } from "components";

function formatDate(dt) {
  if (!dt) return "Invalid Date";
  try {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
}

// Maps category_name to their specific field structures
const CATEGORY_FIELD_MAPPINGS = {
  awards_prizes: {
    name: "award_name",
    organisation: "issuing_organization",
    // organization: "issuing_organization",
    date: "date_received",
    significance_level: "significance_level",
    significance_statement: "significance_statement",
    description: "description",
    url: "url",
  },
  memberships: {
    organization: "organization",
    type: "membership_type",
    date_joined: "date_joined",
    significance_level: "significance_level",
    criteria: "criteria",
    significance_statement: "significance_statement",
    url: "url",
  },
  media_coverage: {
    publication: "publication",
    title: "title",
    date: "date",
    type: "media_type",
    circulation: "circulation",
    significance_level: "significance_level",
    description: "description",
    significance_statement: "significance_statement",
    url: "url",
  },
  judging: {
    organization: "organization",
    role: "role",
    event_name: "event_name",
    event_type: "event_type",
    significance_level: "significance_level",
    period: "period",
    description: "description",
    selection_basis: "selection_basis",
    significance_statement: "significance_statement",
    url: "url",
  },
  original_contributions: {
    title: "title",
    type: "contribution_type",
    field: "field",
    role: "role",
    description: "description",
    impact: "impact",
    citations: "citations",
    significance_level: "significance_level",
    significance_statement: "significance_statement",
    url: "url",
  },
  scholarly_articles: {
    title: "title",
    journal: "journal",
    date: "date",
    citations: "citations",
    impact_factor: "impact_factor",
    url: "url",
  },
  exhibitions: {
    title: "title",
    venue: "venue",
    date: "date",
    description: "description",
  },
  leadership_role: {
    organization: "organization",
    title: "title",
    period: "period",
    responsibilities: "responsibilities",
    achievements: "achievements",
    url: "url",
  },
  critical_role: {
    organization: "organization",
    title: "title",
    period: "period",
    responsibilities: "responsibilities",
    achievements: "achievements",
    url: "url",
  },
  high_salary: {
    salary: "current_salary",
    comparison: "salary_comparison",
    currency: "salary_currency",
    period: "salary_period",
    supporting_docs_list: "salary_supporting_docs_list",
  },
  commercial_success: {
    project: "project",
    revenue: "revenue",
    metrics: "metrics",
    period: "period",
  },
};

const VISA_CRITERIA_CONFIG = {
  EB1A: [
    {
      key: "awards_prizes",
      title: "Awards or Prizes",
      description: "Receipt of lesser nationally or internationally recognized prizes or awards for excellence in your field",
      field: [
        { field_type: "input", id: "award-name", placeholder: "Award Name *", label: "Award Name" },
        { field_type: "input", id: "award-organisation", placeholder: "e.g., The Nobel Foundation", label: "Issuing Organization" },
        { field_type: "datepicker", id: "award-date", placeholder: "MM/DD/YYYY", label: "Date Received" },
        {
          field_type: "select",
          id: "award-significance-level",
          placeholder: "Select significance level",
          label: "Significance Level",
          options: [
            { value: "international", label: "International" },
            { value: "national", label: "National" },
            { value: "regional", label: "Regional" },
            { value: "industry", label: "Industry" },
            { value: "local", label: "Local" },
          ],
        },
        { field_type: "textarea", id: "award-description", placeholder: "Description *", label: "Description" },
        { field_type: "textarea", id: "award-significance-statement", placeholder: "Significance Statement", label: "Significance Statement" },
        { field_type: "input", id: "award-url", placeholder: "Enter URL here", label: "Award URL/Link" },
        { field_type: "fileupload", id: "award-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "memberships",
      title: "Membership in Associations",
      description: "Membership in associations in the field which demand outstanding achievements of their members",
      field: [
        { field_type: "input", id: "membership-organization", placeholder: "e.g., American Medical Association", label: "Organization" },
        { field_type: "input", id: "membership-type", placeholder: "e.g., Fellow, Board Member, Distinguished Member", label: "Membership Type" },
        { field_type: "datepicker", id: "membership-date-joined", placeholder: "MM/DD/YYYY", label: "Date Joined" },
        {
          field_type: "select",
          id: "membership-significance-level",
          placeholder: "Select significance level",
          label: "Significance Level",
          options: [
            { value: "international", label: "International" },
            { value: "national", label: "National" },
            { value: "regional", label: "Regional" },
            { value: "industry", label: "Industry" },
            { value: "local", label: "Local" },
          ],
        },
        { field_type: "textarea", id: "membership-criteria", placeholder: "Selection criteria & process *", label: "Selection Criteria" },
        { field_type: "textarea", id: "membership-significance-statement", placeholder: "Significance Statement (why this shows extraordinary ability)", label: "Significance Statement" },
        { field_type: "input", id: "membership-url", placeholder: "Official URL of association/membership (if any)", label: "URL" },
        { field_type: "fileupload", id: "membership-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "media_coverage",
      title: "Published Material About You",
      description: "Published material about you in professional or major trade publications or other major media",
      field: [
        { field_type: "input", id: "media-publication", placeholder: "e.g., The New York Times, Nature, IEEE Spectrum", label: "Publication/Media Outlet" },
        { field_type: "input", id: "media-title", placeholder: "e.g., 'Profile of Dr. X's Breakthrough Research'", label: "Article Title" },
        { field_type: "datepicker", id: "media-date", placeholder: "MM/DD/YYYY", label: "Publication Date" },
        { field_type: "input", id: "media-type", placeholder: "e.g., Feature article, Interview, TV segment", label: "Media Type" },
        { field_type: "input", id: "media-circulation", placeholder: "e.g., 1.2M monthly readers, 500K views", label: "Circulation/Reach" },
        {
          field_type: "select",
          id: "media-significance-level",
          placeholder: "Select significance level",
          label: "Significance Level",
          options: [
            { value: "international", label: "International" },
            { value: "national", label: "National" },
            { value: "regional", label: "Regional" },
            { value: "industry", label: "Industry" },
            { value: "local", label: "Local" },
          ],
        },
        { field_type: "textarea", id: "media-description", placeholder: "Briefly describe what the article covers and how it highlights your work...", label: "Description" },
        { field_type: "textarea", id: "media-significance-statement", placeholder: "Explain why this coverage is significant and how it demonstrates your extraordinary ability...", label: "Significance Statement" },
        { field_type: "input", id: "media-url", placeholder: "URL to the article or media page (if available)", label: "URL" },
        { field_type: "fileupload", id: "media-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "judging",
      title: "Judging Work of Others",
      description: "Evidence that you have been asked to judge the work of others, either individually or on a panel",
      field: [
        { field_type: "input", id: "judging-organization", placeholder: "e.g., Nature Medicine, IEEE Conference, Grant Agency", label: "Organization" },
        { field_type: "input", id: "judging-role", placeholder: "e.g., Peer Reviewer, Grant Panel Member, Jury Chair", label: "Role" },
        { field_type: "input", id: "judging-event-name", placeholder: "e.g., ABC International Conference, XYZ Awards", label: "Event Name" },
        { field_type: "input", id: "judging-event-type", placeholder: "e.g., Journal peer review, Grant review, Competition jury", label: "Event Type" },
        {
          field_type: "select",
          id: "judging-significance-level",
          placeholder: "Select significance level",
          label: "Significance Level",
          options: [
            { value: "international", label: "International" },
            { value: "national", label: "National" },
            { value: "regional", label: "Regional" },
            { value: "industry", label: "Industry" },
            { value: "local", label: "Local" },
          ],
        },
        { field_type: "input", id: "judging-period", placeholder: "e.g., 2020–present, March 2023, 2019–2022", label: "Period" },
        { field_type: "textarea", id: "judging-description", placeholder: "Describe your judging responsibilities and scope *", label: "Description" },
        { field_type: "textarea", id: "judging-selection-basis", placeholder: "Explain why you were selected as a judge (reputation, expertise, prior achievements)...", label: "Selection Basis" },
        { field_type: "textarea", id: "judging-significance-statement", placeholder: "Explain why this judging activity is significant and how it demonstrates extraordinary ability...", label: "Significance Statement" },
        { field_type: "input", id: "judging-url", placeholder: "URL to event/judges list/call for reviewers (if available)", label: "URL" },
        { field_type: "fileupload", id: "judging-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "original_contributions",
      title: "Original Contributions",
      description: "Evidence of your original scientific, scholarly, artistic, athletic, or business-related contributions of major significance to the field",
      field: [
        { field_type: "input", id: "contribution-title", placeholder: "e.g., Novel Algorithm for Real-time Data Processing", label: "Title" },
        { field_type: "input", id: "contribution-type", placeholder: "e.g., Patent, Algorithm, Product, Standard", label: "Type" },
        { field_type: "input", id: "contribution-field", placeholder: "e.g., Machine Learning, Oncology, UX Design", label: "Field" },
        { field_type: "input", id: "contribution-role", placeholder: "e.g., Lead Inventor, First Author, Principal Designer", label: "Your Role" },
        { field_type: "textarea", id: "contribution-description", placeholder: "Technical description of the contribution *", label: "Description" },
        { field_type: "textarea", id: "contribution-impact", placeholder: "Impact & significance (adoption, advancement of field) *", label: "Impact" },
        { field_type: "input", id: "contribution-citations", placeholder: "Number of citations / references", label: "Citations" },
        {
          field_type: "select",
          id: "contribution-significance-level",
          placeholder: "Select significance level",
          label: "Significance Level",
          options: [
            { value: "international", label: "International" },
            { value: "national", label: "National" },
            { value: "regional", label: "Regional" },
            { value: "industry", label: "Industry" },
            { value: "local", label: "Local" },
          ],
        },
        { field_type: "textarea", id: "contribution-significance-statement", placeholder: "Explain why this contribution is of major significance to the field...", label: "Significance Statement" },
        { field_type: "input", id: "contribution-url", placeholder: "URL to paper/product/patent (if any)", label: "URL" },
        { field_type: "fileupload", id: "contribution-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "scholarly_articles",
      title: "Scholarly Articles",
      description: "Evidence of your authorship of scholarly articles in professional or major trade publications or other major media",
      field: [
        { field_type: "input", id: "pub-title", placeholder: "Enter the full title of your publication", label: "Article Title" },
        { field_type: "input", id: "pub-journal", placeholder: "e.g., Nature, Science, IEEE Transactions", label: "Journal/Publication" },
        { field_type: "datepicker", id: "pub-date", placeholder: "MM/DD/YYYY", label: "Publication Date" },
        { field_type: "input", id: "pub-citations", placeholder: "Number of citations", label: "Citations" },
        { field_type: "input", id: "pub-impact-factor", placeholder: "e.g., 42.8", label: "Impact Factor" },
        { field_type: "input", id: "pub-url", placeholder: "https://doi.org/10.xxxx/xxxxx", label: "DOI/URL" },
        { field_type: "fileupload", id: "pub-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "exhibitions",
      title: "Exhibitions or Showcases",
      description: "Evidence that your work has been displayed at artistic exhibitions or showcases",
      field: [
        { field_type: "input", id: "exhibition-title", placeholder: "e.g., Contemporary Digital Art Showcase", label: "Exhibition Title" },
        { field_type: "input", id: "exhibition-venue", placeholder: "e.g., Museum of Modern Art, Lincoln Center", label: "Venue" },
        { field_type: "datepicker", id: "exhibition-date", placeholder: "MM/DD/YYYY", label: "Exhibition Date" },
        { field_type: "textarea", id: "exhibition-description", placeholder: "Describe the work displayed, the venue's reputation, and the significance of this exhibition...", label: "Description" },
        { field_type: "fileupload", id: "exhibition-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "leadership_role",
      title: "Leading or Critical Role",
      description: "Evidence of your performance of a leading or critical role in distinguished organizations",
      field: [
        { field_type: "input", id: "leadership-organization", placeholder: "e.g., IEEE, ACM, Company Name", label: "Organization" },
        { field_type: "input", id: "leadership-title", placeholder: "e.g., Chairperson, Head of Division, Director", label: "Position/Title" },
        { field_type: "input", id: "leadership-period", placeholder: "e.g., Jan 2020 - Present", label: "Period" },
        { field_type: "textarea", id: "leadership-responsibilities", placeholder: "Key responsibilities and scope *", label: "Responsibilities" },
        { field_type: "textarea", id: "leadership-achievements", placeholder: "Key achievements and impact *", label: "Achievements" },
        { field_type: "input", id: "leadership-url", placeholder: "Link to org profile, announcement or role description (if any)", label: "URL" },
        { field_type: "fileupload", id: "leadership-files", label: "Supporting Documents" },
      ],
    },
    {
      key: "high_salary",
      title: "High Salary",
      description: "Evidence that you command a high salary or other significantly high remuneration in relation to others in the field",
      field: [
        { field_type: "input", id: "current-salary", placeholder: "e.g., $250,000 (annual)", label: "Current Salary" },
        { field_type: "textarea", id: "salary-comparison", placeholder: "Explain how your salary compares to industry standards (percentile, benchmarks, surveys) *", label: "Salary Comparison" },
        { field_type: "input", id: "salary-currency", placeholder: "Currency (e.g., USD, INR)", label: "Currency" },
        { field_type: "input", id: "salary-period", placeholder: "Period (e.g., Annual, Monthly)", label: "Period" },
        // { field_type: "textarea", id: "salary-supporting-docs-list", placeholder: "List of supporting documents (contracts, tax docs, survey references)", label: "Supporting Documents List" },
        { field_type: "fileupload", id: "salary-files", label: "Upload Documents" },
      ],
    },
    {
      key: "commercial_success",
      title: "Commercial Success",
      description: "Evidence of commercial successes in the performing arts",
      field: [
        { field_type: "input", id: "commercial-project", placeholder: "e.g., Album 'Breakthrough', Film 'Innovation Story'", label: "Project" },
        { field_type: "input", id: "commercial-revenue", placeholder: "e.g., $2.5M box office, 100K+ units sold", label: "Revenue" },
        { field_type: "textarea", id: "commercial-metrics", placeholder: "Describe chart positions, streaming numbers, audience reach, awards, or other success indicators...", label: "Success Metrics" },
        { field_type: "input", id: "commercial-period", placeholder: "e.g., 2023, Q1-Q2 2023", label: "Period" },
        { field_type: "fileupload", id: "commercial-files", label: "Supporting Documents" },
      ],
    },
  ],
  O1A: [
    {
      key: "awards_prizes",
      title: "Awards or Prizes",
      description: "Receipt of nationally or internationally recognized prizes or awards for excellence in your field",
      field: [
        { field_type: "input", id: "o1-award-name", placeholder: "e.g., National Science Medal", label: "Award Name" },
        { field_type: "input", id: "o1-award-organisation", placeholder: "Awarding organization", label: "Issuing Organization" },
        { field_type: "datepicker", id: "o1-award-date", placeholder: "MM/DD/YYYY", label: "Date Received" },
        {
          field_type: "select",
          id: "o1-award-significance-level",
          placeholder: "Select significance level",
          label: "Significance Level",
          options: [
            { value: "international", label: "International" },
            { value: "national", label: "National" },
            { value: "regional", label: "Regional" },
            { value: "industry", label: "Industry" },
            { value: "local", label: "Local" },
          ],
        },
        { field_type: "textarea", id: "o1-award-description", placeholder: "Description *", label: "Description" },
        { field_type: "input", id: "o1-award-url", placeholder: "Enter URL here", label: "URL" },
        { field_type: "fileupload", id: "o1-award-files", label: "Supporting Documents" },
      ],
    },
    // Add other O1A criteria similarly...
  ],
};

export default function ApplicationsModalView({ applicationView, setApplicationView, fullApplicationData, setFullApplicationData }) {
  const [items, setItems] = useState(applicationView?.items || []);
  const [loading, setLoading] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ supporting: [] });


  // Add these new state variables for file operations
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [viewingFileId, setViewingFileId] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfData, setCurrentPdfData] = useState(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState('');
  const APPLICATIONS_API_URL = "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";

  const UPLOAD_URL = "https://upload-criteria-details-all-visa-type-v1-356312339779.us-east1.run.app/";

  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";

  const location = useLocation();
  const newApplication = location?.state?.application;
  const Visa_Type = newApplication || location?.state?.visa_type || "EB1A";

  const completeDataTOView = applicationView || {};

  const onClose = () => {
    setApplicationView(false);
  };

  // Get current visa type from applicationView or default to EB1A
  const currentVisaType = Visa_Type;
  // Handle file download
  const handleDownloadFile = (fileName, item) => {
    const fileId = `${item.id}-${item.file_names?.indexOf(fileName) || 0}`;
    setDownloadingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "download_file",
      firebase_doc_id: localStorage.getItem('firebaseId'),
      criterion: applicationView?.category_name === "awards_prizes"
        ? "awards"
        : applicationView?.category_name.toLowerCase().replaceAll(" ", "_"),
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
      });
  };

  // Handle file view
  const handleViewFile = (fileName, item) => {
    const fileId = `${item.id}-${item.file_names?.indexOf(fileName) || 0}`;
    setViewingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "download_file",
      firebase_doc_id: localStorage.getItem('firebaseId'),
      criterion: applicationView?.category_name === "awards_prizes"
        ? "awards"
        : applicationView?.category_name.toLowerCase().replaceAll(" ", "_"),
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
      });
  };

  // Handle file delete with confirmation
  const handleDeleteFile = (fileName, item, idx) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    const fileId = `${item.id}-${idx}`;
    setDeletingFileId(fileId);

    const payload = {
      user_email: userEmail,
      task: "delete_file",
      firebase_doc_id: localStorage.getItem('firebaseId'),
      criterion: applicationView?.category_name === "awards_prizes"
        ? "awards"
        : applicationView?.category_name.toLowerCase().replaceAll(" ", "_"),
      file_name: fileName,
      item_id: item.id
    };

    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((response) => {
        if (response.data.status === 'success') {
          toast.success('File deleted successfully');

          // Update the items state to remove the deleted file
          setItems(prev => prev.map(prevItem => {
            if (prevItem.id === item.id) {
              const updatedFileNames = prevItem.file_names.filter((_, i) => i !== idx);
              return { ...prevItem, file_names: updatedFileNames };
            }
            return prevItem;
          }));
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


  // Find the field config for this category
  const getFieldConfig = () => {
    const visaCriteria = VISA_CRITERIA_CONFIG[currentVisaType] || VISA_CRITERIA_CONFIG.EB1A;
    return visaCriteria.find((c) => c.key === applicationView?.category_name)?.field || [];
  };

  // Build criterionItem dynamically from config
  const buildCriterionItem = (editingId, applicationView, form, fileList) => {
    const file_names = fileList.map((file) => file.name);
    const categoryKey = applicationView.category_name;
    const fieldMapping = CATEGORY_FIELD_MAPPINGS[categoryKey] || {};

    // Start with base fields
    const criterionItem = {
      id: editingId || `${categoryKey}-${Date.now()}`,
      file_names,
    };

    // Add all mapped fields from form
    Object.entries(fieldMapping).forEach(([formKey, apiKey]) => {
      // Try multiple possible form keys
      const value = form[formKey] || form[apiKey] || form[formKey.replace(/_/g, "-")] || "";

      if (value) {
        criterionItem[apiKey] = value;
      }
    });

    return criterionItem;
  };

  // Render dynamic form fields
  const renderDynamicFields = () => {
    const fields = getFieldConfig();

    return fields.map((field, idx) => {
      const fieldId = field.id;

      // Extract the key part from field.id (e.g., "award-name" -> "name")
      const formKey = fieldId
        .replace(/^(award|membership|media|judging|contribution|pub|exhibition|leadership|current|commercial|o1)-/, "")
        .replace(/-/g, "_");

      if (field.field_type === "input") {
        return (
          <div key={idx} className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{field.label || field.placeholder}</label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={form[formKey] || ""}
              onChange={(e) => setForm((p) => ({ ...p, [formKey]: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
            />
          </div>
        );
      }

      if (field.field_type === "datepicker") {
        return (
          <div key={idx} className="space-y-2">
            <label className="text-sm font-medium">{field.label || field.placeholder}</label>
            <input
              type="date"
              value={form[formKey] || ""}
              onChange={(e) => setForm((p) => ({ ...p, [formKey]: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
            />
          </div>
        );
      }

      if (field.field_type === "select") {
        return (
          <div key={idx} className="space-y-2">
            <label className="text-sm font-medium">{field.label || field.placeholder}</label>
            <select
              value={form[formKey] || ""}
              onChange={(e) => setForm((p) => ({ ...p, [formKey]: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      if (field.field_type === "textarea") {
        return (
          <div key={idx} className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{field.label || field.placeholder}</label>
            <textarea
              rows="3"
              placeholder={field.placeholder}
              value={form[formKey] || ""}
              onChange={(e) => setForm((p) => ({ ...p, [formKey]: e.target.value }))}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        );
      }

      if (field.field_type === "fileupload") {
        return (
          <div key={idx} className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{field.label || "Supporting Documents"}</label>
            <FileUpload
              files={
                Array.isArray(form?.supporting)
                  ? form.supporting.filter((f) => f instanceof window.File)
                  : []
              }
              onFilesChange={(files) => handleFileUpload(files)}
              maxFiles={5}
            />

            {form.supporting.filter((f) => f instanceof window.File).length > 0 ? (<>

            </>) : (<>
              {form.supporting && form.supporting.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files</h4>
                  <div className="space-y-2">
                    {form.supporting.map((fileName, fileIndex) => {
                      // Determine file name
                      const displayFileName = typeof fileName === "string"
                        ? fileName
                        : fileName?.file_name || fileName?.filename || "Uploaded file";

                      // Determine if file is an image or document
                      const fileExtension = displayFileName.split('.').pop()?.toLowerCase();
                      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
                      const isImage = imageExtensions.includes(fileExtension);

                      return (
                        <div
                          key={fileIndex}
                          className="flex items-center justify-between p-2 bg-background border rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isImage ? (
                              <Image className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : (
                              <FileTextIcon className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            <span className="text-xs truncate">{displayFileName}</span>
                          </div>

                          <div className="flex gap-1">
                            {/* View Button */}
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                              title="View file"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // For editing form, we need to get the item being edited
                                const currentItem = items.find(i => i.id === editingId);
                                if (currentItem) {
                                  handleViewFile(displayFileName, currentItem);
                                }
                              }}
                              disabled={viewingFileId === `${editingId}-${fileIndex}`}
                            >
                              {viewingFileId === `${editingId}-${fileIndex}` ? (
                                <Clock className="h-3 w-3 animate-spin" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </button>

                            {/* Download Button */}
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                              title="Download file"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentItem = items.find(i => i.id === editingId);
                                if (currentItem) {
                                  handleDownloadFile(displayFileName, currentItem);
                                }
                              }}
                              disabled={downloadingFileId === `${editingId}-${fileIndex}`}
                            >
                              {downloadingFileId === `${editingId}-${fileIndex}` ? (
                                <Clock className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete file"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const confirmDelete = window.confirm(
                                  `Are you sure you want to delete "${displayFileName}"? This action cannot be undone.`
                                );

                                if (confirmDelete) {
                                  const currentItem = items.find(i => i.id === editingId);
                                  if (currentItem) {
                                    handleDeleteFile(displayFileName, currentItem, fileIndex);

                                    // Also remove from form state
                                    setForm(prev => ({
                                      ...prev,
                                      supporting: prev.supporting.filter((_, idx) => idx !== fileIndex)
                                    }));
                                  }
                                }
                              }}
                              disabled={deletingFileId === `${editingId}-${fileIndex}`}
                            >
                              {deletingFileId === `${editingId}-${fileIndex}` ? (
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
              ) : null}

            </>)}


          </div>
        );
      }

      return null;
    });
  };

  useEffect(() => {
    if (!showNewForm && !editingId) {
      setForm({ supporting: [] }); // FIXED: Initialize with supporting array
    }
  }, [showNewForm, editingId]);


  function openNewForm() {
    setShowNewForm(true);
    setEditingId(null);
    setForm({ supporting: [] }); // FIXED: Initialize with supporting array
  }


  function openEditForm(id) {
    const it = items.find((i) => i.id === id);
    if (!it) return;

    setEditingId(id);
    setShowNewForm(true);

    // Map all item fields to form state dynamically
    const categoryKey = applicationView.category_name;
    const fieldMapping = CATEGORY_FIELD_MAPPINGS[categoryKey] || {};

    const mappedForm = { supporting: it.file_names || [] }; // FIXED: Use file_names, not files

    // Reverse map API keys to form keys
    Object.entries(fieldMapping).forEach(([formKey, apiKey]) => {
      if (it[apiKey]) {
        mappedForm[formKey] = it[apiKey];
        mappedForm[apiKey] = it[apiKey]; // Also set by API key for compatibility
      }
    });

    setForm(mappedForm);
  }


  function removeItem(id) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Item deleted successfully");
  }


  // Add this mapping helper at the top of the component
  const API_KEY_MAP = {
    awards_prizes: "awards",
    // Add more mappings if needed for other categories
    // memberships: "memberships", // if API expects different key
    // media_coverage: "media_coverage",
  };

  async function saveForm(e) {
    setLoading(true);
    e.preventDefault();

    const TemporaryId = localStorage.getItem("firebaseId");
    const VisaChoosen = localStorage.getItem("visa_choosen");

    try {
      const fileList = form.supporting || [];

      // Build the current criterionItem dynamically
      const criterionItem = buildCriterionItem(editingId, applicationView, form, fileList);

      // Build complete criterion_data array with all items
      let allCriterionData = [];

      if (editingId) {
        // Update existing item
        allCriterionData = items.map((item) => {
          if (item.id === editingId) {
            return criterionItem;
          }
          // For existing items, keep their data
          return {
            id: item.id,
            ...item,
            file_names: item.file_names || [],
          };
        });
      } else {
        // Add new item to existing items
        allCriterionData = [
          criterionItem,
          ...items.map((item) => ({
            id: item.id,
            ...item,
            file_names: item.file_names || [],
          })),
        ];
      }

      // Map category_name to API key (e.g., "awards_prizes" -> "awards")
      const criterionKey = API_KEY_MAP[applicationView.category_name] || applicationView.category_name;

      const metaData = {
        user_email: userEmail,
        visa_type: VisaChoosen,
        criteria_required: 3,
        criterion_key: criterionKey,
        criterion_data: allCriterionData, // Send all items
        ui_progress: {
          current_step: applicationView.category_name,
          completed_steps: [applicationView.category_name],
          percentage: 10,
        },
      };

      const anyFirebaseId = TemporaryId;
      if (anyFirebaseId) {
        metaData.firebase_doc_id = anyFirebaseId;
      }

      const formData = new FormData();
      formData.append("meta_data", JSON.stringify(metaData));

      // Append files for the current item being edited/created
      fileList.forEach((file) => {
        formData.append(file.name, file);
      });

      const res = await axiosApi.post(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = res.data;

      if (resData.firebase_doc_id) {
        localStorage.setItem("firebaseId", resData.firebase_doc_id);
      }

      // Update local items state
      if (editingId) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...criterionItem, files: [], status: "submitted", criteria_status: "under_review" }
              : p
          )
        );
      } else {
        const newItem = {
          ...criterionItem,
          status: "submitted",
          created_at: new Date().toISOString(),
          criteria_status: "under_review",
        };
        setItems((prev) => [newItem, ...prev]);
      }

      toast.success(resData.message || "Saved successfully");
      setShowNewForm(false);
      setEditingId(null);
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || "Something went wrong.";
      toast.error(errorMessage);
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  }

  function handleFileUpload(files) {
    setForm((prev) => ({ ...prev, supporting: files }));
  }

  const renderModalView = () => {
    return (
      <div>
        <div className="pb-6 flex-shrink-0 flex flex-col space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-between pr-4">
            <div>
              <h2 id="applications-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span>{completeDataTOView?.title}</span>
                {console.log("complete data",fullApplicationData)
                }
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                  {items.length} items
                </div>
              </h2>
              <p id="applications-desc" className="text-sm text-muted-foreground">
                Edit your submissions for this criteria category
              </p>
            </div>
            <div className="flex items-center gap-2">
              {fullApplicationData?.application_status=="in review"||fullApplicationData?.application_status=="on hold"?(<></>):(<>
              <button
                onClick={() => setIsEditingMode((s) => !s)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
              >
                <Pen className="w-4 h-4 mr-2" />
                {isEditingMode ? "Exit Edit Mode" : "Enter Edit Mode"}
              </button>
              </>)}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="relative overflow-hidden h-full">
            <div className="h-full w-full rounded-[inherit]" style={{ overflow: "hidden" }}>
              <div style={{ minWidth: "100%", display: "table" }}>
                <div className="space-y-6">
                  {isEditingMode && (
                    <div>
                      <button
                        onClick={openNewForm}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New {completeDataTOView?.title} Entry
                      </button>
                    </div>
                  )}

                  {showNewForm ? (
                    <>
                      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <form onSubmit={saveForm} className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center">
                              <PenLine className="w-5 h-5 mr-2" />
                              {editingId ? "Edit Entry" : "New Entry"}
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewForm(false);
                                  setEditingId(null);
                                }}
                                className="inline-flex items-center justify-center gap-2 text-sm font-medium border rounded-md h-9 px-3"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-primary text-primary-foreground rounded-md h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderDynamicFields()}</div>
                        </form>
                      </div>
                    </>
                  ) : (<>
                    <div className="space-y-4">
                      {items.map((item, index) => {
                        return (
                          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold tracking-tight text-lg">
                                  {item.award_name || item.title || item.organization || item.project || `Entry #${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                    {item.criteria_status || item.status || "submitted"}
                                  </div>
                                  {isEditingMode && (
                                    <>
                                      <button
                                        onClick={() => openEditForm(item.id)}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                      >
                                        <Pen className="w-4 h-4 mr-1" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => removeItem(item.id)}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-md px-3"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="p-0 pt-0">
                                <div className="space-y-2 text-sm">
                                  {/* Render all fields dynamically */}
                                  {Object.entries(item).map(([key, value]) => {
                                    // Skip internal fields
                                    if (['id', 'files', 'filenames', 'createdat', 'updatedat', 'status', 'criteriastatus', 'evidencecount'].includes(key) || !value) return null;

                                    // Format the label
                                    const label = key
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, l => l.toUpperCase());

                                    // Check if the field is a URL
                                    const isUrlField = key.toLowerCase().includes('url') ||
                                      (typeof value === 'string' &&
                                        (value.startsWith('http://') || value.startsWith('https://')));

                                    return (
                                      <div key={key} className="flex items-start gap-2">
                                        <span className="font-medium min-w-[140px]">{label}</span>
                                        {isUrlField ? (
                                          <a
                                            href={value.startsWith('http') ? value : `https://${value}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {value}
                                          </a>
                                        ) : (
                                          <span className="text-muted-foreground break-words">{value}</span>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Display Documents */}
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
                                                <FileTextIcon className="h-4 w-4 shrink-0" />
                                                <span className="text-xs truncate">{fileName}</span>
                                              </div>
                                              <div className="flex gap-1">
                                                {/* View Button */}
                                                <button
                                                  type="button"
                                                  className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                                                  title="View file"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewFile(fileName, item);
                                                  }}
                                                  disabled={viewingFileId === `${item.id}-${idx}`}
                                                >
                                                  {viewingFileId === `${item.id}-${idx}` ? (
                                                    <Clock className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    <Eye className="h-3 w-3" />
                                                  )}
                                                </button>

                                                {/* Download Button */}
                                                <button
                                                  type="button"
                                                  className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors disabled:opacity-50"
                                                  title="Download file"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadFile(fileName, item);
                                                  }}
                                                  disabled={downloadingFileId === `${item.id}-${idx}`}
                                                >
                                                  {downloadingFileId === `${item.id}-${idx}` ? (
                                                    <Clock className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    <Download className="h-3 w-3" />
                                                  )}
                                                </button>

                                                {/* Delete Button */}
                                                {isEditingMode && (
                                                  <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                                    title="Delete file"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteFile(fileName, item, idx);
                                                    }}
                                                    disabled={deletingFileId === `${item.id}-${idx}`}
                                                  >
                                                    {deletingFileId === `${item.id}-${idx}` ? (
                                                      <Clock className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                      <Trash2 className="h-3 w-3" />
                                                    )}
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}


                                  <div className="text-xs text-muted-foreground pt-2 border-t">
                                    Created: {formatDate(item.created_at)} | ID: {item.id}
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <OverlayModal open={!!applicationView} onClose={onClose} setOpen={onClose} title="View Application">
        {renderModalView()}
        <ThemeLoader show={loading} />
      </OverlayModal>

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
    </>
  );

}
