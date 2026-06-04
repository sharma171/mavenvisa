import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, Briefcase, Star } from "lucide-react";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import { convertFilesToBase64 } from "utils/fileutils";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";

export default function LeadStarringRole({
  data = {},
  existingData: propExistingData = [],
  submittedApplicationData,
  setFilePreview,
  currentCriteria,
  deleteCriteria,
  applicationSave,
  setApplicationSave
}) {
  const [memberships, setMemberships] = useState([]);
  const [loader, setLoader] = useState(false);
  const existingData = Array.isArray(propExistingData) ? propExistingData : [];
  const userData = useSelector((state) => state?.data?.userData?.user || {});
  const userEmail = userData?.email || "";
  const application_id = submittedApplicationData?.application?.application_id;

  const criteria_number = currentCriteria?.criteria_number || "8";
  const location = useLocation();
  const newApplication = location?.state?.application;
  const Visa_Type = newApplication || location?.state?.visa_type;

  useEffect(() => {
    if (Array.isArray(data?.lead_role) && data.lead_role.length) {
      setMemberships(data.lead_role);
    }
  }, [data?.lead_role?.length]);

  useEffect(() => {
    if (Array.isArray(existingData) && existingData.length > 0) {
      const mappedData = existingData.map((item) => ({
        production_event: item.production_event || "",
        role: item.role || "",
        period: item.period || "",
        platform: item.platform || "",
        venue_distinguished: item.venue_distinguished || "",
        description: item.description || "",
        documents: item.documents || [],
        files: [],
      }));
      setMemberships(mappedData);
    }
  }, [existingData]);
  useEffect(() => {
    if (applicationSave === true) {
      saveAllLeadingRoles();
    };
  }, [applicationSave]);

  const addMembership = () => {
    setMemberships((prev) => [
      ...prev,
      {
        production_event: "",
        role: "",
        period: "",
        platform: "",
        venue_distinguished: "",
        description: "",
        documents: [],
        files: [],
      },
    ]);
  };

  const removeMembership = (index, item) => {
    let newItem = structuredClone(item);
    if (!newItem?.item_id) {
      newItem.item_id = item?.id;
    }
    if (!newItem?.criteria_number) {
      newItem.criteria_number = criteria_number;
    }

    setMemberships((prev) => prev.filter((_, i) => i !== index));
    deleteCriteria(newItem);
  };

  // const saveMembership = async (membership, index) => {
  //   if (
  //     !membership.production_event ||
  //     !membership.role ||
  //     !membership.period ||
  //     !membership.platform ||
  //     !membership.venue_distinguished ||
  //     !membership.description
  //   ) {
  //     toast.error("Please fill in all required fields before saving.");
  //     return;
  //   }
  //   let TemporaryId = localStorage.getItem("firebaseId");

  //   const documents = membership.files && membership.files.length ? await convertFilesToBase64(membership.files) : [];

  //   let payloadToSave = {
  //     role: membership.role,
  //     production_event: membership.production_event,
  //     period: membership.period,
  //     platform: membership.platform,
  //     venue_distinguished: membership.venue_distinguished,
  //     description: membership.description,
  //   };

  //   const payload = {
  //     action: "submit_response",
  //     email: userEmail,
  //     item_id: membership?.id,
  //     action: !membership?.id ? "submit_response" : "update_item",
  //     task_type: !membership?.id ? "new" : "update_item",
  //     application_id: application_id || membership?.application_id || TemporaryId,
  //     visa_type: Visa_Type || "EB1A",
  //     criteria_number: criteria_number,
  //     clear_draft: true,
  //     response_data: payloadToSave,
  //     documents,
  //   };
  //   if (membership?.id) {
  //     payload.updates = payloadToSave;
  //   }

  //   setLoader(true);
  //   try {
  //     const res = await axiosApi.post(BaseURL, payload);
  //     let resData = res.data;

  //     membership.item_id = resData.item_id;
  //     membership.id = resData.item_id;
  //     membership.application_id = resData.application_id;
  //     if (Array?.isArray(resData?.uploaded_documents)) {
  //       if (Array?.isArray(membership?.existingFiles)) {
  //         membership.existingFiles = [...membership.existingFiles, ...resData?.uploaded_documents];
  //       } else {
  //         membership.existingFiles = resData?.uploaded_documents;
  //       }
  //     }
  //     membership.files = [];
  //     memberships[index] = membership;
  //     setMemberships([...memberships]);
  //     toast.success(res?.data?.message || "Critical or Essential Role saved successfully");
  //   } catch (err) {
  //     const errorMessage = err?.response?.data?.message || err?.message || "Something went wrong.";
  //     toast.error(errorMessage);
  //     console.error(err);
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  const saveAllLeadingRoles = async () => {
    if (!memberships.length) {
      toast.error("Please add at least one leading role before saving.");
      return;
    }

    const invalid = memberships.find(
      (m) =>
        !(m.production_event || "").trim() ||
        !(m.role || "").trim() ||
        !(m.period || "").trim() ||
        !(m.platform || "").trim() ||
        !(m.venue_distinguished || "").trim() ||
        !(m.description || "").trim()
    );
    if (invalid) {
      toast.error("Please fill in required fields for all leading roles.");
      return;
    }

    let TemporaryId = localStorage.getItem("firebaseId");

    // Convert files for all roles
    const documentsArrays = await Promise.all(
      memberships.map((membership) =>
        membership.files && membership.files.length
          ? convertFilesToBase64(membership.files)
          : Promise.resolve([])
      )
    );
    const documents = documentsArrays.flat();

    // Build payload data for all roles
    const responseRoles = memberships.map((membership, index) => ({
      id: membership.id || `lead-role-${index + 1}`,
      role: membership.role,
      production_event: membership.production_event,
      period: membership.period,
      platform: membership.platform,
      venue_distinguished: membership.venue_distinguished,
      description: membership.description,
    }));

    const payload = {
      email: userEmail,
      action: "submit_response",
      task_type: "new",
      application_id: application_id || TemporaryId,
      visa_type: Visa_Type || "EB1A",
      criteria_number: criteria_number,
      clear_draft: true,
      response_data: { lead_roles: responseRoles },
      documents,
    };

    setLoader(true);
    try {
      const res = await axiosApi.post(BaseURL, payload);
      const resData = res.data;

      memberships.forEach((m) => {
        m.application_id = resData.application_id || m.application_id;
        m.files = [];
      });
      if (Array.isArray(resData.uploaded_documents)) {
        memberships.forEach((m) => {
          m.existingFiles = [...(m.existingFiles || []), ...resData.uploaded_documents];
        });
      }

      setMemberships([...memberships]);
      toast.success(resData.message || "All leading roles saved successfully");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoader(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Star className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Lead or Starring Participation</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of lead or starring participation in productions or events with a distinguished reputation.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Program materials showing lead/starring role</li>
            <li>• Reviews or media coverage of the production </li>
            <li>• Evidence of venue's distinguished reputation</li>
            <li>• Contract or billing information showing lead status</li>
          </ul>
        </div>
      </div>

      {memberships.map((membership, index) => (
        <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Leading Role #{index + 1}</h3>
              <button
                onClick={() => removeMembership(index, membership)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Production/Event *</label>
                  <input
                    value={membership.production_event}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, production_event: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., Broadway Show, Film Title, Concert Tour"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Role *</label>
                  <input
                    value={membership.role}
                    onChange={(e) =>
                      setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, role: e.target.value } : m)))
                    }
                    placeholder="e.g., Lead Actor, Starring Role, Principal Performer"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period *</label>
                <input
                  value={membership.period}
                  onChange={(e) =>
                    setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, period: e.target.value } : m)))
                  }
                  placeholder="e.g., Jan 2020 - Present"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Venue/Platform *</label>
                <input
                  value={membership.platform}
                  onChange={(e) =>
                    setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, platform: e.target.value } : m)))
                  }
                  placeholder="e.g., Lincoln Center, Netflix, Royal Albert Hall"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Venue's Distinguished Reputation *</label>
                <textarea
                  value={membership.venue_distinguished}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, venue_distinguished: e.target.value } : m))
                    )
                  }
                  placeholder="Describe why this venue/production has a distinguished reputation (awards, recognition, prestige)..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role Description & Impact *</label>
                <textarea
                  value={membership.description}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, description: e.target.value } : m))
                    )
                  }
                  placeholder="Describe your role, responsibilities, and the impact of your participation..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Documents</label>
                <FileUpload
                  files={membership?.files}
                  onFilesChange={(files) =>
                    setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, files } : m)))
                  }
                  existingFiles={[...(membership.existingFiles || []), ...(membership?.documents || [])]}
                  maxFiles={5}
                  viewFile={setFilePreview}
                />
              </div>

              {/* <button
                onClick={() => saveMembership(membership)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground h-10 px-4 py-2"
              >
                <Save className="w-4 h-4 mr-2" />
                {loader ? "Saving..." : "Save Leading Role"}
              </button> */}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addMembership}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Leading Role
      </button>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No Leading Role added yet. Click "Add Leading Role" to get started.</p>
        </div>
      )}

      <ThemeLoader show={loader} />
    </div>
  );
}
