// services/communicationApi.js
import toast from "react-hot-toast";
import { data } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_COMMUNICATION_API_URL ||
  "https://applicant-communication-service-v1-356312339779.us-east1.run.app";

// ============================================
// 1. CREATE NEW TICKET (First Message)
// ============================================

/**
 * Create a new support ticket
 * @param {Object} ticketData - The ticket data
 * @param {string} ticketData.title - Ticket title/subject
 * @param {string} ticketData.category - Ticket category
 * @param {string} ticketData.subCategory - Sub-category
 * @param {string} ticketData.message - Message content
 * @param {File} ticketData.file - Optional file attachment
 * @param {string} candidateEmail - User's email
 * @param {string} visaType - Visa type (default: "work_visa")
 * @returns {Promise<Object>} - API response
 */
export async function createTicket(ticketData, candidateEmail, visaType = "work_visa") {
  try {
    // Determine if we need to use FormData (for file upload) or JSON
    const hasFile = ticketData.file !== null && ticketData.file !== undefined;

    if (hasFile) {
      // Use FormData for file upload
      return await createTicketWithFile(ticketData, candidateEmail, visaType);
    } else {
      // Use JSON payload
      return await createTicketJSON(ticketData, candidateEmail, visaType);
    }
  } catch (error) {
    console.error("Error creating ticket:", error);
    toast.error(error.message || "Failed to create ticket");
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create ticket with JSON payload (no file)
 */
async function createTicketJSON(ticketData, candidateEmail, visaType) {
  const payload = {
    task: "send_message",
    candidate_email: candidateEmail,
    visa_type: visaType,
    sender_type: "candidate",
    first_message: true,
    priority: ticketData.priority || "Medium",
    category: mapCategory(ticketData.category),
    subject: ticketData.title,
    message_text: ticketData.message,
  };

  // ✅ Only add sub_category if category is "general"
  if (ticketData.category === "general") {
    payload.sub_category = ticketData.subCategory || "Not Specified";
  }
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data.status !== "success") {
    const errorMessage = data.error || "Failed to create ticket";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Success toast with ticket number
  toast.success(`Ticket created successfully! Ticket Number: ${data.ticket_number}`);

  return {
    success: true,
    message: `Ticket ${data.ticket_number} created successfully`,
    data: {
      messageId: data.message_id,
      ticketNumber: data.ticket_number,
      attachmentsUploaded: data.attachments_uploaded,
    },
  };
}

/**
 * Create ticket with FormData (includes file)
 */
async function createTicketWithFile(ticketData, candidateEmail, visaType) {
  const formData = new FormData();
  formData.append("task", "send_message");
  formData.append("candidate_email", candidateEmail);
  formData.append("visa_type", visaType);
  formData.append("sender_type", "candidate");
  formData.append("first_message", "true");
  formData.append("priority", ticketData.priority || "Medium"); // Use form priority
  formData.append("category", mapCategory(ticketData.category));
  // ✅ Only add sub_category if category is "general"
  if (ticketData.category === "general") {
    formData.append("sub_category", ticketData.subCategory || "Not Specified");
  }
  formData.append("subject", ticketData.title);
  formData.append("message_text", ticketData.message);
  formData.append("files", ticketData.file);

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data.status !== "success") {
    const errorMessage = data.error || "Failed to create ticket";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Success toast with ticket number and file info
  toast.success(
    `Ticket created successfully! Ticket Number: ${data.ticket_number} (${data.attachments_uploaded} file uploaded)`
  );

  return {
    success: true,
    message: `Ticket ${data.ticket_number} created with ${data.attachments_uploaded} attachment`,
    data: {
      messageId: data.message_id,
      ticketNumber: data.ticket_number,
      attachmentsUploaded: data.attachments_uploaded,
    },
  };
}
// ============================================
// 2. SEND FOLLOW-UP MESSAGE
// ============================================

/**
 * Send a follow-up message to an existing conversation
 * @param {string} ticketId - Ticket number (e.g., "TKT-20251216-0001")
 * @param {string} messageText - Message content
 * @param {string} candidateEmail - User's email
 * @param {string} visaType - Visa type
 * @param {File} file - Optional file attachment
 * @param {string} userType - "candidate" or "case_officer"
 * @returns {Promise<Object>} - API response
 */
export async function sendFollowUpMessage(
  ticketId,
  messageText,
  candidateEmail,
  visaType = "work_visa",
  file = null,
  userType,
  selectedCandidate
) {
  try {
    if (file) {
      return await sendMessageWithFile(ticketId, messageText, candidateEmail, visaType, file, userType, selectedCandidate);
    } else {
      return await sendMessageJSON(ticketId, messageText, candidateEmail, visaType, userType, selectedCandidate);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error(error.message || "Failed to send message");
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send message with JSON (no file)
 */
async function sendMessageJSON(ticketId, messageText, candidateEmail, visaType, senderType, selectedCandidate) {
  let payload
  if (senderType == "case_officer") {

    payload = {
      task: "send_message",
      candidate_email: selectedCandidate,
      admin_email: candidateEmail,
      ticket_number: ticketId,
      visa_type: visaType,
      sender_type: senderType,
      first_message: false,
      message_text: messageText,
    };
  }
  else {
    payload = {
      task: "send_message",
      candidate_email: candidateEmail,
      ticket_number: ticketId,
      visa_type: visaType,
      sender_type: senderType,
      first_message: false,
      message_text: messageText,
    };
  }

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data.status !== "success") {
    const errorMessage = data.error || "Failed to send message";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Success toast
  toast.success("Message sent successfully!");

  return {
    success: true,
    message: "Message sent successfully",
    data: {
      messageId: data.message_id,
      ticketNumber: data.ticket_number,
      attachmentsUploaded: data.attachments_uploaded,
    },
  };
}

/**
 * Send message with file attachment
 */
async function sendMessageWithFile(ticketId, messageText, candidateEmail, visaType, file, senderType, selectedCandidate) {
  const formData = new FormData();
  formData.append("task", "send_message");
  if (senderType == "case_officer") {

    formData.append("admin_email", selectedCandidate);
    formData.append("candidate_email", candidateEmail);
  }
  else {

    formData.append("candidate_email", candidateEmail);
  }
  formData.append("ticket_number", ticketId);
  formData.append("visa_type", visaType);
  formData.append("sender_type", senderType);
  formData.append("first_message", "false");
  formData.append("message_text", messageText);
  formData.append("files", file);

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data.status !== "success") {
    const errorMessage = data.error || "Failed to send message";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Success toast with attachment info
  toast.success(`Message sent with ${data.attachments_uploaded} attachment!`);

  return {
    success: true,
    message: `Message sent with ${data.attachments_uploaded} attachment`,
    data: {
      messageId: data.message_id,
      ticketNumber: data.ticket_number,
      attachmentsUploaded: data.attachments_uploaded,
    },
  };
}

// ============================================
// 3. GET ALL MESSAGES
// ============================================

/**
 * Get all messages for a candidate
 * @param {string} candidateEmail - User's email
 * @param {string} visaType - Visa type
 * @returns {Promise<Object>} - All messages
 */
export async function getAllMessages(candidateEmail, visaType = "work_visa", loggedInUser) {
  try {
    let payload; // 1. Declare payload here so it's accessible in the fetch call

    if (loggedInUser === "admin") { // 2. Best practice: Use strict equality (===)
      payload = {
        "task": "get_all_conversations"
      };
    } else {
      payload = {
        task: "get_messages",
        candidate_email: candidateEmail,
        visa_type: visaType,
      };
    }


    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status !== "success") {
      const errorMessage = data.error || "Failed to fetch messages";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (loggedInUser === "admin") {
      return {
        success: true,
        message: `Loaded ${data.total_messages} messages`,
        data: {
          messages: data.conversations.map(transformAdminMessages),
          totalMessages: data.total_messages,
        },
      };
    }
    else {

      return {
        success: true,
        message: `Loaded ${data.total_messages} messages`,
        data: {
          messages: data.messages.map(transformMessage),
          totalMessages: data.total_messages,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error(error.message || "Failed to load messages");
    return {
      success: false,
      error: error.message,
      data: {
        messages: [],
        totalMessages: 0,
      },
    };
  }
}
export async function changeTicketStatus(ticket, ticketChoosenStatus, candidateEmail) {
  try {
    let payload;

    payload = {
      task: "change_ticket_status",
      ticket_number: ticket,
      ticket_status: ticketChoosenStatus,
      admin_email: candidateEmail
    }


    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    

    if (data.status !== "success") {
      const errorMessage = data.error || "Failed to fetch messages";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    // Success toast
    toast.success(`Ticket status updated to ${ticketChoosenStatus}`);
    return data;

  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error(error.message || "Failed to load messages");
    return {
      success: false,
      error: error.message,
      data: {
        messages: data.message,
        changeStatus: data.status
      },
    };
  }
}

/**
 * Transform API message to frontend format
 */
function transformMessage(apiMessage) {
  return {
    id: `msg_${apiMessage.message_id}`,
    messageId: apiMessage.message_id,
    ticketId: apiMessage.ticket_number,
    ticketNumber: apiMessage.ticket_number,
    sender: {
      role: apiMessage.sender_type,
      name: apiMessage.sender_type === "candidate" ? "You" : "Case Officer",
    },
    type: apiMessage.has_attachment ? "attachments" : "text",
    text: apiMessage.message_text,
    content: apiMessage.message_text,
    hasAttachment: apiMessage.has_attachment,
    attachments: apiMessage.attachments ? apiMessage.attachments.map(transformAttachment) : [],
    status: apiMessage.status,
    priority: apiMessage.priority,
    firstName: apiMessage.first_name,
    lastName: apiMessage.last_name,
    category: apiMessage.category,
    subCategory: apiMessage.sub_category, // ✅ ADD THIS
    subject: apiMessage.subject,
    createdAt: apiMessage.created_at,
    updatedAt: apiMessage.updated_at,
    isRead: true,
  };
}
function transformAdminMessages(apiMessage) {
  return {
    id: `msg_${apiMessage.message_id}`,
    messageId: apiMessage.message_id,
    ticketId: apiMessage.ticket_number,
    ticketNumber: apiMessage.ticket_number,
    sender: {
      role: apiMessage.last_sender,
      name: apiMessage.last_sender === "case_officer" ? "You" : "Applicant",
      candidateEmail: apiMessage.candidate_email
    },
    type: apiMessage.attachments.length > 0 ? "attachments" : "text",
    text: apiMessage.last_message,
    firstName: apiMessage.first_name,
    lastName: apiMessage.last_name,
    content: apiMessage.last_message,
    hasAttachment: apiMessage.attachments.length > 0,
    attachments: apiMessage.attachments ? apiMessage.attachments.map(transformAttachment) : [],
    status: apiMessage.status,
    priority: apiMessage.priority,
    category: apiMessage.category,
    subCategory: apiMessage.sub_category, // ✅ ADD THIS
    subject: apiMessage.subject,
    visaType: apiMessage.visa_type,
    createdAt: apiMessage.last_message_at,
    updatedAt: apiMessage.last_message_at,
    isRead: true,
  };
}


/**
 * Transform attachment data
 */
function transformAttachment(apiAttachment) {
  return {
    id: `att_${Date.now()}_${Math.random()}`,
    name: apiAttachment.file_name,
    fileName: apiAttachment.file_name,
    filePath: apiAttachment.file_path,
    url: apiAttachment.file_path,
    size: apiAttachment.file_size,
    sizeLabel: formatFileSize(apiAttachment.file_size),
    mimeType: apiAttachment.file_type,
    fileType: getFileExtension(apiAttachment.file_name),
    uploadedAt: apiAttachment.uploaded_at,
  };
}

// ============================================
// 4. GET ATTACHMENT (Download)
// ============================================

/**
 * Download an attachment file
 * @param {string} filePath - Full file path from attachment object
 * @returns {Promise<Object>} - File content in base64
 */
export async function getAttachment(filePath) {
  try {
    const payload = {
      task: "get_attachment",
      file_path: filePath,
    };

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status !== "success") {
      const errorMessage = data.error || "Failed to download file";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: "File downloaded successfully",
      data: {
        fileContent: data.file_content,
      },
    };
  } catch (error) {
    console.error("Error downloading attachment:", error);
    toast.error(error.message || "Failed to download attachment");
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Download and trigger file download in browser
 * @param {string} filePath - File path
 * @param {string} fileName - File name
 */
export async function downloadAttachment(filePath, fileName) {
  try {
    // Show loading toast
    const toastId = toast.loading(`Downloading ${fileName}...`);

    const result = await getAttachment(filePath);

    if (!result.success) {
      toast.dismiss(toastId);
      throw new Error(result.error);
    }

    // Convert base64 to blob and download
    const base64Data = result.data.fileContent;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Dismiss loading and show success
    toast.dismiss(toastId);
    toast.success(`${fileName} downloaded successfully!`);

    return { success: true };
  } catch (error) {
    console.error("Error downloading file:", error);
    toast.error(error.message || "Failed to download file");
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// 5. SEND MESSAGE WITH BASE64 FILE
// ============================================

/**
 * Send message with base64 encoded file
 */
export async function sendMessageWithBase64File(
  ticketId,
  messageText,
  candidateEmail,
  visaType = "work_visa",
  fileData,
  isFirstMessage = false,
  ticketData = null
) {
  try {
    const payload = {
      task: "send_message",
      candidate_email: candidateEmail,
      visa_type: visaType,
      sender_type: "candidate",
      first_message: isFirstMessage,
      message_text: messageText,
      files: [
        {
          file_name: fileData.fileName,
          file_content: fileData.fileContent,
          file_type: fileData.fileType,
        },
      ],
    };

    if (!isFirstMessage && ticketId) {
      payload.ticket_number = ticketId;
    }

    if (isFirstMessage && ticketData) {
      payload.priority = mapPriority(ticketData.category);
      payload.category = mapCategory(ticketData.category);
      payload.subject = ticketData.title || messageText;
    }

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status !== "success") {
      const errorMessage = data.error || "Failed to send message";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Success toast
    toast.success(
      isFirstMessage
        ? `Ticket ${data.ticket_number} created with attachment!`
        : `Message sent with attachment!`

    );

    return {
      success: true,
      message: isFirstMessage ? "Ticket created with attachment" : "Message sent with attachment",
      data: {
        messageId: data.message_id,
        ticketNumber: data.ticket_number,
        attachmentsUploaded: data.attachments_uploaded,
      },
    };
  } catch (error) {
    console.error("Error sending message with base64 file:", error);
    toast.error(error.message || "Failed to send message with attachment");
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Convert File object to base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

// ============================================
// 6. ORGANIZE MESSAGES INTO TICKETS
// ============================================

export function organizeMessagesIntoTickets(messages, loggedInUser) {
  const tickets = {};
  const standaloneMessages = [];

  messages.forEach((message) => {
    if (message.ticketNumber) {
      if (!tickets[message.ticketNumber]) {
        tickets[message.ticketNumber] = {
          ticketNumber: message.ticketNumber,
          subject: message.subject,
          category: message.category,
          subCategory: message.subCategory, // ✅ ADD THIS
          priority: message.priority,
          visaType: message.visaType,
          status: message.status,
          createdAt: message.createdAt,
          firstName: message.firstName,
          lastName: message.lastName,
          updatedAt: message.updatedAt,
          messages: [],
          messageCount: 0,
          preview: "",
        };
      }
      tickets[message.ticketNumber].messages.push(message);
      tickets[message.ticketNumber].messageCount++;

      if (
        !tickets[message.ticketNumber].preview ||
        new Date(message.createdAt) > new Date(tickets[message.ticketNumber].updatedAt)
      ) {
        tickets[message.ticketNumber].preview = message.text || message.content || "No message";
        tickets[message.ticketNumber].updatedAt = message.updatedAt || message.createdAt;
      }
    } else {
      standaloneMessages.push(message);
    }
  });
  Object.values(tickets).forEach((ticket) => {
    ticket.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

  return {
    tickets: Object.values(tickets),
    standaloneMessages,
  };
}


export function getMessagesForTicket(allMessages, ticketNumber) {
  return allMessages.filter((msg) => msg.ticketNumber === ticketNumber || msg.ticketId === ticketNumber);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function mapPriority(category) {
  const priorityMap = {
    evidence: "High",
    technical: "High",
    documents: "Medium",
    status: "Medium",
    general: "Low",
  };
  return priorityMap[category] || "Medium";
}

function mapCategory(category) {
  const categoryMap = {
    general: "General",
    evidence: "Evidence",
    technical: "Technical",
    documents: "Documents",
    status: "Status",
  };
  return categoryMap[category] || "General";
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

export function isValidFileType(file) {
  const validExtensions = ["pdf", "png", "jpeg", "jpg", "docx", "xlsx", "txt", "doc", "xls"];
  const validMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/msword",
    "application/vnd.ms-excel",
  ];

  const extension = getFileExtension(file.name);
  return validExtensions.includes(extension) || validMimeTypes.includes(file.type);
}

export function isValidFileSize(file, maxSizeMB = 10) {
  const maxSize = maxSizeMB * 1024 * 1024;
  return file.size <= maxSize;
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

export async function getTickets(candidateEmail, visaType = "work_visa", loggedInUser) {
  const result = await getAllMessages(candidateEmail, visaType, loggedInUser);
  if (result.success) {
    if (loggedInUser === "admin") {
      const organized = organizeMessagesIntoTickets(result.data.messages, loggedInUser);
      return organized.tickets;
    }
    else {
      const organized = organizeMessagesIntoTickets(result.data.messages, loggedInUser);
      return organized.tickets;
    }
  }
  return [];
}

export async function getTicketMessages(ticketNumber, candidateEmail, visaType = "work_visa") {
  const result = await getAllMessages(candidateEmail, visaType);
  if (result.success) {
    return getMessagesForTicket(result.data.messages, ticketNumber);
  }
  return [];
}

export async function sendMessage(ticketId, messageText, candidateEmail, visaType = "work_visa", file = null, userType, selectedCandidate) {
  return await sendFollowUpMessage(ticketId, messageText, candidateEmail, visaType, file, userType, selectedCandidate);
}
