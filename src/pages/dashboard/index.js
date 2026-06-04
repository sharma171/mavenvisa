import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FileText, Calendar, Clock, CheckCircle, Plus, Eye, ArrowRight } from "lucide-react";
import { smartVisaApi } from "./smartVisaApi";
import SubmittedApplicationView from "./SubmittedApplicationView";
import ApplicationsPage from "./ApplicationsPage";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThemeLoader } from "components";
import { setAllApplications } from "../../redux/sliceData";

const MainDashboard = () => {
  const [page, setPage] = useState("dashboard");
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const userDetails = useSelector((state) => state.data?.userData);
  const allApplications = useSelector((state) => state.data.allApplications);
  let userData = userDetails?.user || {};
  const userEmail = userData?.email;

  useEffect(() => {
    if (page === "dashboard") {
      dispatch(setAllApplications());
      localStorage.removeItem("firebaseId")
      setLoading(true);
      smartVisaApi
        .getAllApplications(userEmail)
        .then((result) => {
          if (result && Array.isArray(result.applications) && result.applications.length > 0) {
            setApplications(result.applications);
            dispatch(setAllApplications(result.applications));
            console.log(allApplications);

          } else {
            setApplications([]);
          }
        })
        .catch(() => setApplications([]))
        .finally(() => setLoading(false));
    }
  }, [page, userEmail]);

  const goDashboard = () => {
    setSelectedApplicationId(null);
    setPage("dashboard");
  };

  const goViewApplication = (appId, application) => {
    console.log(appId)
    localStorage.removeItem("firebaseId");
    localStorage.removeItem("visa_choosen");
    const application_id = appId; // this is firebase_doc_id now
    localStorage.setItem("firebaseId", application_id);
    localStorage.setItem("visa_choosen", application.visa_type);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSelectedApplicationId(appId); // appId is firebase_doc_id now
      setPage("viewApplication");
    }, 1500);

  };

  const goContinueApplication = (application) => {
    const application_id = application?.application_id; // this is firebase_doc_id now
    localStorage.setItem("firebaseId", application_id);
    console.log(application)
    navigate("/application/continue", {
      state: { application_id, visa_type: application?.visa_type },
    });
  };

  const goNewApplication = () => {
    navigate("/newvisaform");
  };

  if (page === "viewApplication") {
    return <SubmittedApplicationView applicationId={selectedApplicationId} onBack={goDashboard} />;
  }

  if (page === "continueApplication") {
    return <ApplicationsPage email={userEmail} onBack={goDashboard} />;
  }


  return (
    <div className="p-4 md:p-6 max-w-8xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {userData?.first_name}</h1>
        <p className="text-muted-foreground">Track your visa applications and manage your documents</p>
      </div>

      {applications.map((application, idx) => {
        // console.log("applicationsates",application);
        const progresspercent = application?.progress?.readiness_percentage ?? 0;
        const started = application?.created_at ? new Date(application.created_at).toLocaleDateString("en-GB") : "-";
        const updated = application?.updated_at ? new Date(application.updated_at).toLocaleDateString("en-GB") : "-";
        const basePercent = progresspercent.length * 10; // default EB1A logic

        const percent =
          application?.visa_type === "O1A"
            ? progresspercent.length * 12.5
            : basePercent;

        const clamped = Math.min(percent, 100);

        return (
          <>
          {application?.visa_type!=="o1a"&&application?.visa_type!=="eb1a"&&application?.visa_type!=="others"&&(<>
            <div key={idx} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center justify-between p-6">
                <div>
                  <div className="flex items-center gap-2 text-2xl font-semibold">
                    <FileText className="h-5 w-5" />
                    Current {application?.visa_type === "EB1A" ? "EB-1A" : application?.visa_type === "O1A" ? "O-1A" : application?.visa_type} Application
                  </div>
                  <p className="text-sm text-muted-foreground">Your active visa petition progress</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{loading ? "..." : `${clamped}%`}</div>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Application Progress</span>
                  <span>{loading ? "..." : `${clamped}%`}</span>
                </div>

                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={clamped}
                  className="relative w-full overflow-hidden rounded-full bg-secondary h-2"
                >
                  <div
                    className="h-full w-full flex-1 bg-primary transition-all"
                    style={{
                      transform: `translateX(${clamped - 100}%)`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span>{loading ? "-" : `Started: ${started}`}</span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span>{loading ? "-" : `Updated: ${updated}`}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 capitalize">
                    <Clock className="w-3 h-3 mr-1" />
                    {application?.status=="draft"?"In progress":application?.status}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { goViewApplication(application?.application_id, application) }}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Application
                    </button>
                    {application?.status=="in review"||application?.status=="on hold"?(<></>):(<>
                    <button
                      onClick={() => goContinueApplication(application)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                      Continue Application
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                    </>)}
                    
                  </div>
                </div>
              </div>
            </div>
          </>)}
          </>
        );
      })}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={goNewApplication}
          className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4"
        >
          <div className="p-3 bg-primary/10 rounded-lg">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">New Application</h3>
            <p className="text-sm text-muted-foreground">Start a new visa petition</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4"
        onClick={()=>navigate("/documents")}>
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Upload Documents</h3>
            <p className="text-sm text-muted-foreground">Add supporting evidence</p>
          </div>
        </div>

        <div
          // onClick={goContinueApplication}
          className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 flex items-center space-x-4"
          onClick={()=>navigate("/communications")}
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">Create Ticket</h3>
            {/* <h3 className="font-semibold">Review Progress</h3> */}
            
            <p className="text-sm text-muted-foreground">Connect our support team</p>
            {/* <p className="text-sm text-muted-foreground">Check application status</p> */}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-4">
          <li className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <div>
              <p className="text-sm font-medium">Awards criteria updated</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <div>
              <p className="text-sm font-medium">New document uploaded</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </li>
          <li className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <div>
              <p className="text-sm font-medium">Application review requested</p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </div>
          </li>
        </ul>
      </div>
      <ThemeLoader show={loading} />
    </div>
  );
};

export default MainDashboard;
