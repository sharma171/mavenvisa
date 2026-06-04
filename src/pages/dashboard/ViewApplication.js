import React, { useEffect, useState } from "react";

const CARD_CLASS = "rounded-lg border bg-white text-black shadow p-6 max-w-2xl mx-auto";
const BUTTON_OUTLINE =
  "inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer select-none border border-gray-300 hover:bg-gray-100";

const ViewApplication = ({ appId, email, onBack }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your API call for application details
    setLoading(true);
    setTimeout(() => {
      setApplication({
        id: appId,
        title: "EB1A Visa Application",
        status: "In Progress",
        description: "Your application is under review.",
      });
      setLoading(false);
    }, 1000);
  }, [appId]);

  if (loading) return <p className="text-center mt-6">Loading application details...</p>;

  if (!application)
    return (
      <div className={CARD_CLASS}>
        <p>Application not found.</p>
        <button onClick={onBack} className={BUTTON_OUTLINE + " mt-4"}>
          Back
        </button>
      </div>
    );

  return (
    <div className={CARD_CLASS}>
      <button onClick={onBack} className={BUTTON_OUTLINE + " mb-4"}>
        Back
      </button>
      <h2 className="text-2xl font-semibold mb-2">{application.title}</h2>
      <p className="mb-2">Status: {application.status}</p>
      <p>{application.description}</p>
    </div>
  );
};

export default ViewApplication;
