const SUBMISSION_API_URL = "https://collect-submission-details-api-v1-356312339779.us-east1.run.app";
const APPLICATIONS_API_URL =
  "https://fetch-details-visa-submission-v1-356312339779.us-east1.run.app";
const DOCUMENTS_API_URL = "https://document-retrive-delete-operation-v1-356312339779.us-east1.run.app";

class SmartVisaApiService {
  async makeRequest(url, data) {
    console.log("Making API request to:", url, data);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      };
      const result = await response.json();
      if (result.status === "error") {
        throw new Error(result.message || "API request failed");
      }
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getAllApplications(email, statusFilter) {
    const result = await this.makeRequest(APPLICATIONS_API_URL, {
      user_email: email,
      task: "initial_data",
      status_filter: statusFilter, // optional; backend can ignore if not needed
    });

    // Map new shape → old dashboard expectations
    const applications =
      Array.isArray(result.applications) ?
        result.applications.map((app) => ({
          application_id: app.firebase_doc_id,
          visa_type: app.visa_type,
          status: app.application_status,
          created_at: app.created_at,
          updated_at: app.last_updated,
          progress: {
            readiness_percentage: app.ui_progress?.completed_steps ?? 0,
            criteria_completed: null,
            total_criteria: null,
            total_items: null,
          },
        })) : [];

    return { status: result.status, applications };
  }


  async getApplicationDetails(email, firebaseDocId) {
    const result = await this.makeRequest(APPLICATIONS_API_URL, {
      user_email: email,
      task: "indepth_details",
      firebase_doc_id: firebaseDocId,
    });

    const app = result.application || {};

    // Shape compatible with existing consumers
    return {
      status: result.status,
      application: {
        application_id: app.document_id,            // or firebase_doc_id
        visa_type: app.visa_type,
        status: app.application_status,
        criteria_completed: app.criteria_completed,
        ui_progress: app.ui_progress,
        criteria_required: app.criteria_required,
        user_email: app.user_email,
        last_updated: app.last_updated,
        internal_notes: app.internal_notes,
        user_notes: app.user_notes,
        criteria: app.criteria || {},
      },
    };
  }


  async saveDraft(email, applicationId, visaType, criteriaNumber, partialData) {
    return this.makeRequest(SUBMISSION_API_URL, {
      action: "save_draft",
      email,
      application_id: applicationId,
      visa_type: visaType,
      criteria_number: criteriaNumber,
      partial_data: partialData,
    });
  }

  async addCriteriaResponse(
    email,
    applicationId,
    visaType,
    criteriaNumber,
    responseData,
    files = [],
    clearDraft = true
  ) {
    const documents = [];
    for (const file of files) {
      const base64Content = await this.fileToBase64(file);
      documents.push({
        filename: file.name,
        document_type: this.getDocumentType(file.name),
        content: base64Content,
      });
    }
    const requestData = {
      action: "submit_response",
      email,
      task_type: applicationId ? "update" : "new",
      application_id: applicationId,
      visa_type: visaType,
      criteria_number: criteriaNumber,
      clear_draft: clearDraft,
      response_data: {
        title: responseData.title,
        organization: responseData.organization,
        date: responseData.date,
        description: responseData.description,
        significance_level: responseData.significance_level,
        significance_statement: responseData.significance_statement,
        url: responseData.url,
      },
      documents,
    };
    const result = await this.makeRequest(SUBMISSION_API_URL, requestData);
    return result;
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result;
        resolve(result.split(",")[1]); // strip the data URL prefix
      };
      reader.onerror = (error) => reject(error);
    });
  }

  getDocumentType(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "certificate";
      case "jpg":
      case "jpeg":
      case "png":
        return "proof";
      case "doc":
      case "docx":
        return "letter";
      default:
        return "proof";
    }
  }
}

export const smartVisaApi = new SmartVisaApiService();
