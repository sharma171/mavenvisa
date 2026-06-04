import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, Briefcase, Star, Building2 } from "lucide-react";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import { convertFilesToBase64 } from "utils/fileutils";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";

export default function LeadRoleOrganizations({
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
    if (Array.isArray(data?.lead_role_organizations) && data.lead_role_organizations.length) {
      setMemberships(data.lead_role_organizations);
    }
  }, [data?.lead_role_organizations?.length]);

  useEffect(() => {
    if (Array.isArray(existingData) && existingData.length > 0) {
      const mappedData = existingData.map((item) => ({
        organization: item.organization || "",
        role_title: item.role_title || "",
        role_type: item.role_type,
        start_date: item.start_date || "",
        end_date: item.end_date || "",
        description: item.description || "",
        organization_reputation: item.organization_reputation || "",
        documents: item.documents || [],
        files: [],
      }));
      setMemberships(mappedData);
    }
  }, [existingData]);
  useEffect(() => {
    if (applicationSave === true) {
      saveAllLeadRoles();
    };
  }, [applicationSave]);

  const addMembership = () => {
    setMemberships((prev) => [
      ...prev,
      {
        organization: "",
        role_title: "",
        start_date: "",
        end_date: "",
        role_type: "",
        description: "",
        organization_reputation: "",
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
  //     !membership.organization ||
  //     !membership.role_title ||
  //     !membership.start_date ||
  //     !membership.description ||
  //     !membership.organization_reputation ||
  //     !membership.role_type
  //   ) {
  //     toast.error("Please fill in all required fields before saving.");
  //     return;
  //   }
  //   let TemporaryId = localStorage.getItem("firebaseId");

  //   const documents = membership.files && membership.files.length ? await convertFilesToBase64(membership.files) : [];

  //   let payloadToSave = {
  //     role_title: membership.role_title,
  //     organization: membership.organization,
  //     start_date: membership.start_date,
  //     description: membership.description,
  //     organization_reputation: membership.organization_reputation,
  //     role_type: membership.role_type,
  //     end_date: membership?.end_date,
  //   };

  //   const payload = {
  //     action: "submit_response",
  //     email: userEmail,
  //     item_id: membership?.id,
  //     action: !membership?.id ? "submit_response" : "update_item",
  //     task_type: !membership?.id ? "new" : "update_item",
  //     application_id: application_id || membership?.application_id||TemporaryId,
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

  const saveAllLeadRoles = async () => {
    // if (!memberships.length) {
    //   toast.error("Please add at least one lead role before saving.");
    //   return;
    // }

    // const invalid = memberships.find(
    //   (m) =>
    //     !(m.organization || "").trim() ||
    //     !(m.role_title || "").trim() ||
    //     !(m.start_date || "").trim() ||
    //     !(m.role_type || "").trim() ||
    //     !(m.description || "").trim() ||
    //     !(m.organization_reputation || "").trim()
    // );
    // if (invalid) {
    //   toast.error("Please fill in required fields for all lead roles.");
    //   return;
    // }

    let TemporaryId = localStorage.getItem("firebaseId");

    // Convert files for all memberships
    const documentsArrays = await Promise.all(
      memberships.map((membership) =>
        membership.files && membership.files.length
          ? convertFilesToBase64(membership.files)
          : Promise.resolve([])
      )
    );
    const documents = documentsArrays.flat();

    // Build array of all roles (criterion items)
    const rolesData = memberships.map((membership, index) => ({
      id: membership.id || `lead-org-${index + 1}`,
      organization: membership.organization,
      role_title: membership.role_title,
      role_type: membership.role_type,
      start_date: membership.start_date,
      end_date: membership.end_date || "",
      description: membership.description,
      organization_reputation: membership.organization_reputation,
    }));

    const payload = {
      email: userEmail,
      action: "submit_response",
      task_type: "new",
      application_id: application_id || TemporaryId,
      visa_type: Visa_Type || "EB1A",
      criteria_number: criteria_number,
      clear_draft: true,
      // If backend expects criterion_data, change key accordingly:
      response_data: { lead_role_organizations: rolesData },
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
      toast.success("Criteria Added Successfully" || "All lead roles saved successfully");
      setApplicationSave && setApplicationSave(true);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(memberships.length > 0);
    }
  }, [memberships.length]);


  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Building2 className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Lead Role for Distinguished Organizations</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of performing in a lead, starring, or critical role for organizations with distinguished
            reputation.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Lead or starring roles in renowned organizations</li>
            <li>• Critical positions for distinguished institutions</li>
            <li>• Principal roles in prominent productions</li>
            <li>• Key positions in reputable companies or groups</li>
          </ul>
        </div>
      </div>

      {memberships.map((membership, index) => (
        <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Lead Role #{index + 1}</h3>
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
                  <label className="text-sm font-medium">Organization Name *</label>
                  <input
                    value={membership.organization}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, organization: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., Royal Opera House, Lincoln Center"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Title *</label>
                  <input
                    value={membership.role_title}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, role_title: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., Lead Performer, Principal Artist"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date *</label>
                <input
                  value={membership.start_date}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, start_date: e.target.value } : m))
                    )
                  }
                  placeholder="e.g., Jan 2020"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <input
                  value={membership.end_date}
                  onChange={(e) =>
                    setMemberships((prev) => prev.map((m, i) => (i === index ? { ...m, end_date: e.target.value } : m)))
                  }
                  placeholder="e.g., Present or December 2021"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Type *</label>
                <input
                  value={membership.role_type}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, role_type: e.target.value } : m))
                    )
                  }
                  placeholder="e.g., Lead Role, Starring Role, Critical Role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role Description & Responsibilities *</label>
                <textarea
                  value={membership.description}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, description: e.target.value } : m))
                    )
                  }
                  placeholder="Describe your role, responsibilities, and key contributions..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Reputation *</label>
                <textarea
                  value={membership.organization_reputation}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, organization_reputation: e.target.value } : m))
                    )
                  }
                  placeholder="Describe the organization's distinguished reputation, achievements, and recognition in the field..."
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
                {loader ? "Saving..." : "Save Lead Role"}
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
        Add Lead Role
      </button>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No Lead Role added yet. Click "Add Lead Role" to get started.</p>
        </div>
      )}

      <ThemeLoader show={loader} />
    </div>
  );
}
