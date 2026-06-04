import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Trophy } from "lucide-react";

import AwardsForm from "./AwardsForm";
import MembershipsForm from "./MembershipsForm";
import MediaForm from "./MediaForm";
import JudgingForm from "./JudgingForm";
import ContributionsForm from "./ContributionsForm";
import PublicationsForm from "./PublicationsForm";
import ExhibitionsForm from "./ExhibitionsForm";
import LeadershipForm from "./LeadershipForm";
import SalaryForm from "./SalaryForm";
import CommercialForm from "./CommercialForm";
import CriticalEssentialRole from "./CriticalEssentialRole";

import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosApi from "networking/axiosApi";
import FilePreview from "components/FilePreview";
import { OverlayModal, ThemeLoader } from "components";
import toast from "react-hot-toast";
import LeadStarringRole from "./LeadStarringRole";
import CriticalRecognition from "./CriticalRecognition";
import LeadRoleOrganizations from "./LeadRoleOrganizations";
import RecognitionfromExperts from "./RecognitionfromExperts";

// new
const APPLICATIONS_API_URL =
  "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";
const FILEBASEURL = "https://document-retrive-delete-operation-v1-356312339779.us-east1.run.app/";
const APIURLSUBMISSION = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";

// Map form components to criteria keys
const FORM_COMPONENTS = {
  awards_prizes: AwardsForm,
  memberships: MembershipsForm,
  media_coverage: MediaForm,
  judging: JudgingForm,
  original_contributions: ContributionsForm,
  scholarly_articles: PublicationsForm,
  exhibitions: ExhibitionsForm,
  leadership_role: LeadershipForm,
  high_salary: SalaryForm,
  commercial_success: CommercialForm,
  critical_role: CriticalEssentialRole,
  critical_recognition: CriticalRecognition,
  lead_role_organizations: LeadRoleOrganizations,
  recognition_from_experts: RecognitionfromExperts,
  lead_role: LeadStarringRole,
};

const VISA_CRITERIA_CONFIG = {
  EB1A: [
    { key: "awards_prizes", title: "Awards or Prizes", "description": "Receipt of lesser nationally or internationally recognized prizes or awards for excellence in your field" },
    { key: "memberships", title: "Membership in Associations", "description": "Membership in associations in the field which demand outstanding achievements of their members" },
    { key: "media_coverage", title: "Published Material About You", "description": "Published material about you in professional or major trade publications or other major media" },
    { key: "judging", title: "Judging Work of Others", "description": "Evidence that you have been asked to judge the work of others, either individually or on a panel" },
    { key: "original_contributions", title: "Original Contributions", "description": "Evidence of your original scientific, scholarly, artistic, athletic, or business-related contributions of major significance to the field" },
    { key: "scholarly_articles", title: "Scholarly Articles", "description": "Evidence of your authorship of scholarly articles in professional or major trade publications or other major media" },
    { key: "exhibitions", title: "Exhibitions or Showcases", "description": "Evidence that your work has been displayed at artistic exhibitions or showcases" },
    { key: "leadership_role", title: "Leading or Critical Role", "description": "Evidence of your performance of a leading or critical role in distinguished organizations" },
    { key: "high_salary", title: "High Salary", "description": "Evidence that you command a high salary or other significantly high remuneration in relation to others in the field" },
    { key: "commercial_success", title: "Commercial Success", "description": "Evidence of commercial successes in the performing arts" },

  ],
  O1A: [
    { key: "awards_prizes", title: "Awards or Prizes", "description": "Receipt of nationally or internationally recognized prizes or awards for excellence in your field" },
    { key: "memberships", title: "Membership in Associations", "description": "Membership in associations requiring outstanding achievements as judged by recognized experts" },
    { key: "media_coverage", title: "Published Material About You", "description": "Published material about you in professional or major trade publications or other major media" },
    { key: "judging", title: "Judging Work of Others", "description": "Participation on a panel, or individually, as a judge of the work of others in your field" },
    { key: "original_contributions", title: "Original Scientific or Scholarly Contributions", "description": "Original scientific, scholarly, or business-related contributions of major significance" },
    { key: "scholarly_articles", title: "Authorship of Scholarly Articles", "description": "Authorship of scholarly articles in professional journals or other major media" },
    { key: "critical_role", title: "Critical or Essential Role", "description": "Employment in a critical or essential capacity for organizations with distinguished reputation" },
    { key: "high_salary", title: "High Salary or Remuneration", "description": "Evidence that you command a high salary or other significantly high remuneration in relation to others in the field" },
  ],
};

const BACKEND_TO_UI_KEY = {
  awards: "awards_prizes",
  // add more only if backend names differ from UI keys
};



const CardDescription = ({ children, className = "" }) => <p className={`text-gray-600 ${className}`}>{children}</p>;

const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  let baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  if (variant === "ghost") {
    baseClasses += " bg-transparent text-red-600 hover:bg-red-100 focus:ring-red-400";
  } else if (variant === "outline") {
    baseClasses += " border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-400";
  } else {
    baseClasses += " bg-primary text-white hover:bg-blue-700 focus:ring-blue-500";
  }

  if (size === "sm") {
    baseClasses += " px-3 py-1.5 text-sm";
  } else {
    baseClasses += " px-4 py-2 text-base";
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${value}%` }}></div>
  </div>
);

const VisaTypeSelector = ({ onSelect }) => (
  <div className="text-center">
    <h2 className="text-xl font-semibold mb-4">Select Visa Type</h2>
    <button
      onClick={() => onSelect("O1A")}
      className="block w-full mb-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
    >
      O1A Visa
    </button>
    <button
      onClick={() => onSelect("EB1A")}
      className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
    >
      EB1A Visa
    </button>
  </div>
);


let visaHeadings = {
  EB1A: {
    title: "EB-1A: Extraordinary Ability",
    description: "Permanent residency for individuals with extraordinary ability",
  },
  O1A: {
    title: "O-1A: Extraordinary Ability",
    description: "Temporary work visa for individuals with extraordinary ability",
  },
  // O1B: {
  //   title: "O-1B: Distinction in Arts",
  //   description: "Temporary work visa for artists and entertainers",
  // },
};

export default function EnhancedIntakeForm({ initialVisaType }) {
  const [criteriaLoading, setCriteriaLoading] = useState(true);
  const [selectedVisaType, setSelectedVisaType] = useState(initialVisaType || null);

  const [currentStep, setCurrentStep] = useState(0);
  const [criteriaList, setCriteriaList] = useState([]);
  const [criteriaMap, setCriteriaMap] = useState({});
  const [allcriteriasData, setAllcriteriasData] = useState({});
  const [submittedApplicationData, setsubmittedApplicationData] = useState({});
  const [filePreviewObj, setFilePreview] = useState(false);
  const [applicationSave, setApplicationSave] = useState(false);
  // ✅ ADD: Track if current form has data
  const [currentFormHasData, setCurrentFormHasData] = useState(false);
  const [loader, setloader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (applicationSave == true) {
      setTimeout(() => {

        setApplicationSave(false);
      }, 200);
    }
  }, [applicationSave]);

  let currentHeadingItem = visaHeadings[selectedVisaType || "EB1A"];

  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const location = useLocation();
  const newApplication = location?.state?.application;
  const locationData = location?.state;

  let application_id, visa_type;
  application_id = localStorage.getItem("firebaseId");
  console.log("applicationId", application_id);
  if (!newApplication) {
    // application_id = locationData?.application_id;
    visa_type = locationData?.visa_type;
  }

  const total_criteria = allcriteriasData?.total_criteria;
  const minimum_required = allcriteriasData?.minimum_required || 0;

  const appStats = submittedApplicationData?.application?.statistics || {};
  const criteria_completed = appStats.criteria_submitted;
  let criteriaArray = allcriteriasData?.criteria || [];

  const normalizeVisa = (v) => (v === "O1" ? "O1A" : v);

  useEffect(() => {
    if (newApplication || visa_type) {
      setSelectedVisaType(normalizeVisa(newApplication || visa_type));
    }
  }, [newApplication, visa_type]);


  const isExistingApplication = !!application_id;

  useEffect(() => {
    if (!isExistingApplication) {
      setCriteriaLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      getAllVisaCriterias();
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedVisaType, isExistingApplication]);


  // const { formid } = useParams();

  const onBack = () => {
    navigate(-1);
  };

  const deleteCriteria = (item = {}) => {
    let { criteria_number, item_id } = item;
    if (!userData?.email || !criteria_number || !item_id) {
      return;
    }

    let payload = {
      action: "delete_item",
      email: userData?.email,
      application_id: application_id || item?.application_id,
      criteria_number: criteria_number,
      item_id: item_id,
      visa_type: selectedVisaType,
      delete_documents: true,
    };
    setloader(true);

    axiosApi
      .post(APIURLSUBMISSION, payload)
      .then((res) => {
        toast.success(res.data.message || "Deleted successfully");
        // getApplicationDetails();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to delete");
        console.log(err);
      })
      .finally(() => {
        setloader(false);
      });
  };

  // const getAllApplications = () => {
  //   if (!userData?.email || newApplication) {
  //     return;
  //   }
  //   setloader(true);
  //   let payload = {
  //     action: "get_applications",
  //     email: userData?.email,
  //     include_summary: true,
  //   };

  //   axiosApi
  //     .post(APIURL, payload)
  //     .then((res) => {
  //       setAllApplicationsData(res.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => {
  //       setloader(false);
  //     });
  // };
  const UI_CRITERIA_ORDER = [
    { key: "awards_prizes", title: "Awards & Prizes" },
    { key: "memberships", title: "Memberships" },
    { key: "media_coverage", title: "Media Coverage" },
    { key: "judging", title: "Judging the Work of Others" },
    { key: "original_contributions", title: "Original Contributions" },
    { key: "scholarly_articles", title: "Scholarly Articles" },
    { key: "exhibitions", title: "Exhibitions" },
    { key: "leadership_role", title: "Leadership Roles" },
    { key: "high_salary", title: "High Salary" },
    { key: "commercial_success", title: "Commercial Success" },
    { key: "critical_role", title: "Critical / Essential Role" },
    { key: "critical_recognition", title: "Critical Recognition" },
    { key: "lead_role_organizations", title: "Lead Role in Organizations" },
    { key: "recognition_from_experts", title: "Recognition from Experts" },
    { key: "lead_role", title: "Lead / Starring Role" },
  ];
  const BACKEND_TO_UI_KEY = {
    awards: "awards_prizes",
    // add more mappings if backend names differ
    // memberships_backend: "memberships",
    // media: "media_coverage",
  };

  const getAllVisaCriterias = () => {
    if (!userData?.email || !application_id) {
      setCriteriaLoading(false);
      return;
    }
    getApplicationDetails();
  };


  const getDocuments = (data) => {
    if (!userData?.email) {
      return;
    }

    let payload = {
      action: "get_document",
      email: userData?.email,
      document_id: data?.document_id,
    };
    setloader(true);
    axiosApi
      .post(FILEBASEURL, payload)
      .then((res) => {
        if (res.data?.document?.content) {
          setFilePreview(res.data?.document);
        } else {
          toast.error("something went wrong");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "something went wrong");
        console.log(err);
      })
      .finally(() => {
        setloader(false);
      });
  };

  const getApplicationDetails = () => {
    if (!application_id || !userData?.email) {
      return;
    }

    const payload = {
      user_email: userData.email,
      task: "indepth_details",
      firebase_doc_id: application_id,
    };

    setloader(true);
    axiosApi
      .post(APPLICATIONS_API_URL, payload)
      .then((res) => {
        const app = res.data?.application || {};
        const criteriaFromApi = app.criteria || {};
        const breakdown = app.criteria_breakdown || {};
        const criteriaRequired = app.criteria_required || 0;
        const visaKey =
          selectedVisaType === "O1A" || selectedVisaType === "O1" ? "O1A" : "EB1A";
        const config = VISA_CRITERIA_CONFIG[visaKey] || [];

        const criteriaArrayLocal = [];

        config.forEach((uiCriterion, index) => {
          const uiKey = uiCriterion.key;

          const backendKey =
            Object.keys(criteriaFromApi).find((rawKey) => {
              const mapped = BACKEND_TO_UI_KEY[rawKey] || rawKey;
              return mapped === uiKey;
            }) || null;

          const items = backendKey
            ? Array.isArray(criteriaFromApi[backendKey])
              ? criteriaFromApi[backendKey]
              : []
            : [];

          const breakdownItem = backendKey ? breakdown[backendKey] || {} : {};

          criteriaArrayLocal.push({
            criteria_number: index + 1,
            criteria_key: backendKey || uiKey,
            category_name: uiKey, // must match FORM_COMPONENTS
            title: breakdownItem.name || uiCriterion.title || uiKey,
            // getApplicationDetails
            description: breakdownItem.description || uiCriterion.description || "",

            items,
            draft: {},
            items_count: items.length,
            has_evidence: items.length > 0,
          });
        });

        setAllcriteriasData({
          criteria: criteriaArrayLocal,
          total_criteria: criteriaArrayLocal.length,
          minimum_required: criteriaRequired,
        });


        setsubmittedApplicationData({
          application: {
            ...app,
            statistics: {
              criteria_submitted: app.criteria_completed || 0,
              total_items: criteriaArray.reduce((sum, c) => sum + c.items.length, 0),
            },
            criteria_data: criteriaFromApi,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load application details");
      })
      .finally(() => {
        setloader(false);
        setCriteriaLoading(false);
      });
  };



  useEffect(() => {
    // getAllApplications();
    // getApplicationDetails();
  }, [userData?.email]);

  useEffect(() => {
    if (isExistingApplication) {
      getApplicationDetails();
    }
  }, [application_id, isExistingApplication]);
  useEffect(() => {
    if (isExistingApplication) return;

    // NEW: don't build anything until visa type is known
    if (!selectedVisaType) return;

    if (criteriaList.length || Object.keys(criteriaMap).length) return;

    const visaKey =
      selectedVisaType === "O1A" || selectedVisaType === "O1" ? "O1A" : "EB1A";
    const config = VISA_CRITERIA_CONFIG[visaKey] || [];

    const localCriteria = config.map((c, index) => ({
      criteria_number: index + 1,
      criteria_key: c.key,
      category_name: c.key,
      title: c.title,
      description: c.description,
      items: [],
      draft: {},
      items_count: 0,
      has_evidence: false,
      submitted: false,
    }));

    const master = {};
    localCriteria.forEach((criterion, i) => {
      const numKey = (i + 1).toString();
      master[numKey] = criterion;
    });

    setCriteriaList(Object.keys(master));
    setCriteriaMap(master);
    setCriteriaLoading(false);
  }, [isExistingApplication, selectedVisaType, criteriaList.length, criteriaMap]);



  useEffect(() => {
    if (!criteriaArray || !criteriaArray.length) {
      return;
    }

    const master = {};

    for (let i = 0; i < criteriaArray.length; i++) {
      const criterion = criteriaArray[i];
      const numKey = (i + 1).toString();

      master[numKey] = {
        title: criterion.title || "",
        description: criterion.description || "",

        category_name: criterion.category_name || criterion.criteria_key || "",
        criteria_number: criterion.criteria_number,
        items: Array.isArray(criterion.items) ? criterion.items : [],
        draft: criterion.draft || {},
        items_count: typeof criterion.items_count === "number" ? criterion.items_count : (criterion.items || []).length,
        has_evidence: typeof criterion.has_evidence === "boolean" ? criterion.has_evidence : (criterion.items || []).length > 0,
        submitted: (criterion.items || []).length > 0,
      };
    }

    setCriteriaList(Object.keys(master)); // ["1","2",...]
    setCriteriaMap(master);
  }, [criteriaArray, application_id]);


  const getCriteriaByNumber = useCallback((num) => criteriaMap[num] || null, [criteriaMap]);

  const handleVisaTypeSelect = (type) => {
    setSelectedVisaType(type);
    if (!isExistingApplication) {
      setCriteriaList([]);
      setCriteriaMap({});
      setCurrentStep(0);
      setCriteriaLoading(true);
    }
  };


  // ✅ UPDATE: handleNext to check if form has data
  const handleNext = () => {
    if (currentStep < criteriaList.length - 1) {
      if (currentFormHasData) {
        // Form has data - save before moving
        setApplicationSave(true);
        setTimeout(() => {
          getApplicationDetails();
          setCurrentStep(currentStep + 1);
          setCurrentFormHasData(false); // Reset for next form
        }, 3000);
      } else {
        // Form is empty - just move to next step
        setCurrentStep(currentStep + 1);
        setCurrentFormHasData(false); // Reset for next form
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      getApplicationDetails();
      setCurrentStep(currentStep - 1);
      setCurrentFormHasData(false); // Reset
    }
  };

  const handleFormDataUpdate = (criteriaNumber, newData) => {
    // setCriteriaMap((prev) => ({
    //   ...prev,
    //   [criteriaNumber]: { ...prev[criteriaNumber], items: newData },
    // }));
  };

  if (criteriaLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p>Loading visa criteria definitions...</p>
        </div>
      </div>
    );
  }

  if (!selectedVisaType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <VisaTypeSelector onSelect={handleVisaTypeSelect} />
        </main>
      </div>
    );
  }

  const currentCriteriaNumber = criteriaList[currentStep];
  const currentCriteria = getCriteriaByNumber(currentCriteriaNumber);

  if (!currentCriteria) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error: Could not load criteria data</p>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / criteriaList.length) * 100;
  const FormComponent = FORM_COMPONENTS[currentCriteria.category_name];



  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b pb-4 flex justify-between items-center">
        <button
          onClick={onBack}
          size="sm"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex items-center space-x-4" style={{ minWidth: "200px" }}>
          <span className="text-gray-600 text-sm whitespace-nowrap">
            Step {currentStep + 1} of {criteriaList.length}
          </span>
          <Progress value={progress} className="w-82" />
        </div>
      </header>

      <main className="container mx-auto px-1 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                {currentHeadingItem?.title}{" "}
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">{selectedVisaType}</span>
              </h3>
              <p className="text-sm text-muted-foreground">{currentHeadingItem?.description} </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-between">
                Criteria {currentCriteriaNumber}: {currentCriteria.title}
                {currentCriteria.items?.length > 0 && (
                  <CheckCircle className="w-6 h-6 text-green-600 inline-block ml-2" />
                )}
                {console.log("object", currentCriteria)}
              </h3>
              <CardDescription>
                {currentCriteria?.description}
              </CardDescription>
            </div>

            <div className="p-6 pt-0">
              {FormComponent ? (
                <FormComponent
                  deleteCriteria={deleteCriteria}
                  setFilePreview={getDocuments}
                  submittedApplicationData={submittedApplicationData}
                  currentCriteria={currentCriteria}
                  criteriaNumber={currentCriteriaNumber}
                  data={{ [currentCriteria.category_name]: currentCriteria.items }}
                  applicationSave={applicationSave}
                  setApplicationSave={setApplicationSave}
                  draftData={currentCriteria.draft || {}}
                  onFormDataChange={setCurrentFormHasData} // ✅ MAKE SURE THIS IS HERE
                  onChange={(newData) =>
                    handleFormDataUpdate(currentCriteriaNumber, newData[currentCriteria.category_name] || [])
                  }
                />

              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No data available. Click "Add Button" to get started.</p>
                </div>
              )}
            </div>
          </div>
          {console.log("current step choosen", currentStep)}


          <div className="flex justify-between items-center">
            {currentStep == 0 ? (<></>) : (<>
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
            </>)}


            <span className="text-sm text-gray-600">
              Criteria {currentStep + 1} of {criteriaList.length}
            </span>



            {currentStep === criteriaList.length - 1 ? (
              <button
                onClick={() => {
                  if (currentFormHasData) {
                    setApplicationSave(true);
                    setTimeout(() => navigate("/"), 3000);
                  } else {
                    navigate("/");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {currentFormHasData ? "Save & Finish" : "Finish"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {currentFormHasData ? "Save & Next" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>

          <div className="p-6 pt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span>
                {/* Completed Criteria: {criteria_completed || 0} / {total_criteria || 0} */}
                Completed Criteria: {currentStep + 1} / {criteriaList.length}
              </span>
              <span>Required: {minimum_required} criteria minimum</span>
            </div>
          </div>
        </div>
      </main>
      <OverlayModal open={filePreviewObj?.content} onClose={() => setFilePreview(false)}>
        <FilePreview
          hideClose
          docObject={{ file_extension: filePreviewObj?.mime_type, file_name: filePreviewObj?.filename }}
          base64File={filePreviewObj?.content || ""}
          setBase64File={setFilePreview}
          fileType={filePreviewObj?.mime_type}
          setFileType={() => { }}
        />
      </OverlayModal>
      <ThemeLoader show={loader} />
    </div>
  );
}
