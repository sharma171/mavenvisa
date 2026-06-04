import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, Briefcase, Star, Award } from "lucide-react";
import FileUpload from "components/FileUpload";
import { useSelector } from "react-redux";
import { ThemeLoader } from "components";
import { convertFilesToBase64 } from "utils/fileutils";
import axiosApi from "networking/axiosApi";
import { useLocation } from "react-router-dom";

const BaseURL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";

export default function RecognitionfromExperts({
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
    if (Array.isArray(data?.recognition_from_experts) && data.recognition_from_experts.length) {
      setMemberships(data.recognition_from_experts);
    }
  }, [data?.recognition_from_experts?.length]);

  useEffect(() => {
    if (Array.isArray(existingData) && existingData.length > 0) {
      const mappedData = existingData.map((item) => ({
        organization: item.organization || "",
        type_of_recognition: item.type_of_recognition || "",
        date_received: item.date_received || "",

        significance: item.significance || "",
        description: item.description || "",
        documents: item.documents || [],
        files: [],
      }));
      setMemberships(mappedData);
    }
  }, [existingData]);

  useEffect(() => {
    if (applicationSave === true) {
      saveAllRecognitions();
    };
  }, [applicationSave]);

  const addMembership = () => {
    setMemberships((prev) => [
      ...prev,
      {
        organization: "",
        type_of_recognition: "",
        date_received: "",
        significance: "",
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
  //     !membership.organization ||
  //     !membership.type_of_recognition ||
  //     !membership.date_received ||
  //     !membership.significance ||
  //     !membership.description
  //   ) {
  //     toast.error("Please fill in all required fields before saving.");
  //     return;
  //   }
  //   let TemporaryId = localStorage.getItem("firebaseId");

  //   const documents = membership.files && membership.files.length ? await convertFilesToBase64(membership.files) : [];

  //   let payloadToSave = {
  //     type_of_recognition: membership.type_of_recognition,
  //     organization: membership.organization,
  //     date_received: membership.date_received,
  //     significance: membership.significance,
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

  const saveAllRecognitions = async () => {
    // if (!memberships.length) {
    //   toast.error("Please add at least one recognition before saving.");
    //   return;
    // }

    // const invalid = memberships.find(
    //   (m) =>
    //     !(m.organization || "").trim() ||
    //     !(m.type_of_recognition || "").trim() ||
    //     !(m.date_received || "").trim() ||
    //     !(m.significance || "").trim() ||
    //     !(m.description || "").trim()
    // );
    // if (invalid) {
    //   toast.error("Please fill in required fields for all recognitions.");
    //   return;
    // }

    let TemporaryId = localStorage.getItem("firebaseId");

    // Convert all files to base64 (for all recognitions)
    const documentsArrays = await Promise.all(
      memberships.map((membership) =>
        membership.files && membership.files.length
          ? convertFilesToBase64(membership.files)
          : Promise.resolve([])
      )
    );
    const documents = documentsArrays.flat(); // single documents array

    // Build array of criterion items for all recognitions
    const recognitionsData = memberships.map((membership, index) => ({
      id: membership.id || `recognition-${index + 1}`,
      organization: membership.organization,
      type_of_recognition: membership.type_of_recognition,
      date_received: membership.date_received,
      significance: membership.significance,
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
      // if your backend expects `criterion_data`, swap the key:
      response_data: { recognition_from_experts: recognitionsData },
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
      toast.success("Criteria Added Successfully" || "All recognitions saved successfully");
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
        <Award className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Significant Recognition</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of significant recognition for achievements from organizations, critics, government agencies, or
            other recognized experts.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Letters or certificates of recognition</li>
            <li>• Published reviews or critical acclaim</li>
            <li>• Awards or honors from industry organizations</li>
            <li>• Government recognition or acknowledgments</li>
          </ul>
        </div>
      </div>

      {memberships.map((membership, index) => (
        <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recognition #{index + 1}</h3>
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
                  <label className="text-sm font-medium">Source Organization/Expert *</label>
                  <input
                    value={membership.organization}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, organization: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., Academy of Arts, New York Times, State Government"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type of Recognition *</label>
                  <input
                    value={membership.type_of_recognition}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, type_of_recognition: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., Critical Review, Official Honor, Expert Endorsement"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Received *</label>
                <input
                  value={membership.date_received}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, date_received: e.target.value } : m))
                    )
                  }
                  placeholder="e.g., Jan 2020 - Present"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description of Recognition *</label>
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
                <label className="text-sm font-medium">Significance & Impact *</label>
                <textarea
                  value={membership.significance}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, significance: e.target.value } : m))
                    )
                  }
                  placeholder="Explain why this recognition is significant and demonstrates your distinction in the field..."
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
                {loader ? "Saving..." : "Save Recognition"}
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
        Add Recognition
      </button>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No Recognition added yet. Click "Add Recognition" to get started.</p>
        </div>
      )}

      <ThemeLoader show={loader} />
    </div>
  );
}
