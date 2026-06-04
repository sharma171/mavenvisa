// messages.js
export const conversationMessages = [
  // ==========================================
  // TICKET 1 - Additional Documentation Required
  // ==========================================
  {
    id: "m1",
    ticketId: "1",
    sender: { role: "officer", name: "Sarah Johnson" },
    type: "text",
    text: "We need additional evidence for your awards criteria. Please provide certified translations of your international awards and recognition letters.",
    createdAt: "2024-01-20T10:30:00"
  },
  {
    id: "m2",
    ticketId: "1",
    sender: { role: "applicant", name: "You" },
    type: "text",
    text: "Thank you for the clarification. I have the documents ready. Should I upload them directly to the portal or email them?",
    createdAt: "2024-01-20T11:15:00"
  },
  {
    id: "m3",
    ticketId: "1",
    sender: { role: "officer", name: "Sarah Johnson" },
    type: "text",
    text: "Please upload them directly through the portal. Make sure all translations are certified by a qualified translator.",
    createdAt: "2024-01-20T11:45:00"
  },
  {
    id: "m4",
    ticketId: "1",
    sender: { role: "applicant", name: "You" },
    type: "attachments",
    text: "Here are the certified translations and award documents",
    attachments: [
      { id: "a1", name: "AwardCertificate_Translation.pdf", sizeLabel: "2.4 MB", fileType: "pdf" },
      { id: "a2", name: "Recognition_Letter_Translation.pdf", sizeLabel: "1.8 MB", fileType: "pdf" },
      { id: "a3", name: "Translator_Certification.pdf", sizeLabel: "856 KB", fileType: "pdf" }
    ],
    createdAt: "2024-01-20T14:30:00"
  },
  {
    id: "m5",
    ticketId: "1",
    sender: { role: "officer", name: "Sarah Johnson" },
    type: "text",
    text: "Thank you! Documents received. We'll review them within 3-5 business days.",
    createdAt: "2024-01-20T15:00:00"
  },

  // ==========================================
  // TICKET 2 - Application Status Update
  // ==========================================
  {
    id: "m6",
    ticketId: "2",
    sender: { role: "officer", name: "Michael Chen" },
    type: "text",
    text: "Your EB1A application has progressed to the next stage. We expect a response within 30 days. Please review the updated status in your dashboard.",
    createdAt: "2024-01-18T15:45:00"
  },
  {
    id: "m7",
    ticketId: "2",
    sender: { role: "applicant", name: "You" },
    type: "text",
    text: "That's great news! Is there anything specific I need to prepare for this stage?",
    createdAt: "2024-01-18T16:20:00"
  },
  {
    id: "m8",
    ticketId: "2",
    sender: { role: "officer", name: "Michael Chen" },
    type: "text",
    text: "Just ensure all your contact information is up to date. We may need to reach you for additional verification if required.",
    createdAt: "2024-01-18T16:45:00"
  },
  {
    id: "m9",
    ticketId: "2",
    sender: { role: "applicant", name: "You" },
    type: "images",
    text: "Here's a screenshot of my updated profile information",
    images: [
      {
        id: "img1",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop",
        caption: "Updated Profile Screenshot",
        type: "image"
      }
    ],
    createdAt: "2024-01-18T17:00:00"
  },

  // ==========================================
  // TICKET 3 - Consultation Call
  // ==========================================
  {
    id: "m10",
    ticketId: "3",
    sender: { role: "officer", name: "Sarah Johnson" },
    type: "text",
    text: "Thank you for joining the consultation call today. As discussed, please focus on strengthening your publication criteria with more recent articles.",
    createdAt: "2024-01-15T14:30:00"
  },
  {
    id: "m11",
    ticketId: "3",
    sender: { role: "applicant", name: "You" },
    type: "text",
    text: "Thank you for the guidance. I have 3 more publications from 2023 that I can add. Will those be sufficient?",
    createdAt: "2024-01-15T14:45:00"
  },
  {
    id: "m12",
    ticketId: "3",
    sender: { role: "officer", name: "Sarah Johnson" },
    type: "text",
    text: "Yes, that would strengthen your case significantly. Please ensure they are peer-reviewed publications and include citation metrics if available.",
    createdAt: "2024-01-15T15:00:00"
  },
  {
    id: "m13",
    ticketId: "3",
    sender: { role: "applicant", name: "You" },
    type: "images",
    text: "Here are screenshots of my recent publications and citation metrics",
    images: [
      {
        id: "img2",
        url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
        caption: "Research Publication 1",
        type: "image"
      },
      {
        id: "img3",
        url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
        caption: "Citation Metrics Dashboard",
        type: "image"
      }
    ],
    createdAt: "2024-01-15T15:30:00"
  },

  // ==========================================
  // TICKET 4 - Document Upload Confirmation
  // ==========================================
  {
    id: "m14",
    ticketId: "4",
    sender: { role: "system", name: "System" },
    type: "text",
    text: "Your documents have been successfully uploaded and are now under review. You will receive a notification once the review is complete.",
    createdAt: "2024-01-12T11:20:00"
  },
  {
    id: "m15",
    ticketId: "4",
    sender: { role: "applicant", name: "You" },
    type: "text",
    text: "How long does the review process typically take?",
    createdAt: "2024-01-12T11:45:00"
  },
  {
    id: "m16",
    ticketId: "4",
    sender: { role: "officer", name: "Case Team" },
    type: "text",
    text: "Document reviews typically take 3-5 business days. You'll receive an email notification once completed.",
    createdAt: "2024-01-12T14:20:00"
  },
  {
    id: "m17",
    ticketId: "4",
    sender: { role: "applicant", name: "You" },
    type: "mixed",
    text: "Here are the additional supporting documents and my ID verification",
    attachments: [
      { id: "a4", name: "Passport_Copy.pdf", sizeLabel: "3.2 MB", fileType: "pdf" },
      { id: "a5", name: "Employment_Letter.pdf", sizeLabel: "945 KB", fileType: "pdf" }
    ],
    images: [
      {
        id: "img4",
        url: "https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=800&h=600&fit=crop",
        caption: "ID Verification Photo",
        type: "image"
      }
    ],
    createdAt: "2024-01-12T15:00:00"
  },

  // ==========================================
  // TICKET 5 - Welcome Message
  // ==========================================
  {
    id: "m18",
    ticketId: "5",
    sender: { role: "officer", name: "David Rodriguez" },
    type: "text",
    text: "Welcome to SmartVisa Portal! I'm here to help you navigate through your EB1A application process. Feel free to reach out if you have any questions.",
    createdAt: "2024-01-10T09:15:00"
  },
  {
    id: "m19",
    ticketId: "5",
    sender: { role: "applicant", name: "You" },
    type: "text",
    text: "Thank you! Where should I start with my application?",
    createdAt: "2024-01-10T09:30:00"
  },
  {
    id: "m20",
    ticketId: "5",
    sender: { role: "officer", name: "David Rodriguez" },
    type: "text",
    text: "Start by completing your profile in the 'My Profile' section, then move on to the criteria assessment. Our system will guide you through each step.",
    createdAt: "2024-01-10T09:45:00"
  },
  {
    id: "m21",
    ticketId: "5",
    sender: { role: "applicant", name: "You" },
    type: "attachments",
    text: "I've uploaded my CV and supporting documents",
    attachments: [
      { id: "a6", name: "CV_2024.pdf", sizeLabel: "1.2 MB", fileType: "pdf" },
      { id: "a7", name: "Publications_List.xlsx", sizeLabel: "245 KB", fileType: "xlsx" },
      { id: "a8", name: "Awards_Summary.docx", sizeLabel: "678 KB", fileType: "docx" }
    ],
    createdAt: "2024-01-10T10:30:00"
  },
  {
    id: "m22",
    ticketId: "5",
    sender: { role: "applicant", name: "You" },
    type: "images",
    text: "Here is my professional headshot and workplace photos",
    images: [
      {
        id: "img5",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        caption: "Professional Headshot",
        type: "image"
      },
      {
        id: "img6",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        caption: "Office Workspace",
        type: "image"
      },
      {
        id: "img7",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        caption: "Team Conference",
        type: "image"
      }
    ],
    createdAt: "2024-01-10T11:00:00"
  },
  {
    id: "m23",
    ticketId: "5",
    sender: { role: "officer", name: "David Rodriguez" },
    type: "text",
    text: "Perfect! Everything looks good. I'll review your documents and get back to you within 24 hours.",
    createdAt: "2024-01-10T11:30:00"
  }
];
