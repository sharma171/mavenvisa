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

export default function CriticalRecognition({
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
    if (Array.isArray(data?.critical_recognition) && data.critical_recognition.length) {
      setMemberships(data.critical_recognition);
    }
  }, [data?.critical_recognition?.length]);


  useEffect(() => {
    if (applicationSave === true) {
      saveAllMemberships();
    };
  }, [applicationSave]);


  useEffect(() => {
    if (Array.isArray(existingData) && existingData.length > 0) {
      const mappedData = existingData.map((item) => ({
        publication_type: item.publication_type || "",
        publication_name: item.publication_name || "",
        article_title: item.article_title,
        publication_date: item.publication_date || "",
        description: item.description || "",
        circulation: item.circulation || "",
        documents: item.documents || [],
        files: [],
      }));
      setMemberships(mappedData);
    }
  }, [existingData]);

  const addMembership = () => {
    setMemberships((prev) => [
      ...prev,
      {
        publication_type: "",
        publication_name: "",
        publication_date: "",
        article_title: "",
        description: "",
        circulation: "",
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
  //     !membership.publication_type ||
  //     !membership.publication_name ||
  //     !membership.publication_date ||
  //     !membership.description ||
  //     !membership.circulation ||
  //     !membership.article_title
  //   ) {
  //     toast.error("Please fill in all required fields before saving.");
  //     return;
  //   }
  //   let TemporaryId = localStorage.getItem("firebaseId");

  //   const documents = membership.files && membership.files.length ? await convertFilesToBase64(membership.files) : [];

  //   let payloadToSave = {
  //     publication_name: membership.publication_name,
  //     publication_type: membership.publication_type,
  //     publication_date: membership.publication_date,
  //     description: membership.description,
  //     circulation: membership.circulation,
  //     article_title: membership.article_title,
  //     publication_name: membership?.publication_name,
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

  const saveAllMemberships = async () => {
    if (!memberships.length) {
      toast.error("Please add at least one critical recognition entry before saving.");
      return;
    }

    const invalid = memberships.find(
      (m) =>
        !(m.publication_type || "").trim() ||
        !(m.publication_name || "").trim() ||
        !(m.publication_date || "").trim() ||
        !(m.article_title || "").trim() ||
        !(m.description || "").trim() ||
        !(m.circulation || "").trim()
    );
    if (invalid) {
      toast.error("Please fill in required fields for all critical recognition entries.");
      return;
    }

    let TemporaryId = localStorage.getItem("firebaseId");

    const documentsArrays = await Promise.all(
      memberships.map((membership) =>
        membership.files && membership.files.length
          ? convertFilesToBase64(membership.files)
          : Promise.resolve([])
      )
    );
    const documents = documentsArrays.flat();

    const responseItems = memberships.map((membership, index) => ({
      id: membership.id || `critical-recognition-${index + 1}`,
      publication_type: membership.publication_type,
      publication_name: membership.publication_name,
      publication_date: membership.publication_date,
      article_title: membership.article_title,
      description: membership.description,
      circulation: membership.circulation,
    }));

    const payload = {
      email: userEmail,
      action: "submit_response",
      task_type: "new",
      application_id: application_id || TemporaryId,
      visa_type: Visa_Type || "EB1A",
      criteria_number: criteria_number,
      clear_draft: true,
      response_data: { critical_recognition: responseItems },
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
      toast.success("Criteria Added Successfully" || "All critical recognition entries saved successfully");
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

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(memberships.length > 0);
    }
  }, [memberships.length]);


  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border">
        <Star className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="font-semibold text-primary mb-2">Critical Recognition</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Evidence of achieving national or international recognition shown by critical reviews or other published
            materials.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Critical reviews in major publications</li>
            <li>• Published articles about your work</li>
            <li>• Feature stories or profiles</li>
            <li>• National or international media coverage</li>
          </ul>
        </div>
      </div>

      {memberships.map((membership, index) => (
        <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Critical Recognition #{index + 1}</h3>
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
                  <label className="text-sm font-medium">Publication Type *</label>
                  <input
                    value={membership.publication_type}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, publication_type: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., Magazine, Newspaper, Online Publication"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Publication Name *</label>
                  <input
                    value={membership.publication_name}
                    onChange={(e) =>
                      setMemberships((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, publication_name: e.target.value } : m))
                      )
                    }
                    placeholder="e.g., The New York Times, Variety"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Publication Date *</label>
                <input
                  value={membership.publication_date}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, publication_date: e.target.value } : m))
                    )
                  }
                  placeholder="e.g., Jan 2020"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Article/Review Title *</label>
                <input
                  value={membership.article_title}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, article_title: e.target.value } : m))
                    )
                  }
                  placeholder="Title of the article or review"
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
                  placeholder="Describe the content of the review or article and what was said about your work..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Circulation/Reach</label>
                <textarea
                  value={membership.circulation}
                  onChange={(e) =>
                    setMemberships((prev) =>
                      prev.map((m, i) => (i === index ? { ...m, circulation: e.target.value } : m))
                    )
                  }
                  placeholder="Describe the publication's reach and significance (circulation numbers, audience, reputation)..."
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
                {loader ? "Saving..." : "Save Critical Recognition"}
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
        Add Critical Recognition
      </button>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No Critical Recognition added yet. Click "Add Critical Recognition" to get started.</p>
        </div>
      )}

      <ThemeLoader show={loader} />
    </div>
  );
}
