import React, { useState } from "react";

const VISA_TYPES = [
  {
    id: "EB1A",
    name: "EB-1A",
    description: "Extraordinary Ability visa with permanent residency.",
  },
  {
    id: "O1",
    name: "O-1",
    description: "Temporary work visa for individuals with extraordinary ability.",
  },
  {
    id: "NIW",
    name: "National Interest Waiver",
    description: "Permanent residency based on national interest without employer sponsorship.",
  },
];

export const VisaTypeSelector = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (onSelect) onSelect(id);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Select your visa category</h2>
      <p className="mb-4 text-muted-foreground">
        Select the visa category that best matches your goals and qualifications. Each has different criteria and
        requirements.
      </p>
      {VISA_TYPES.map((visa) => (
        <div
          key={visa.id}
          className={`cursor-pointer rounded-md border p-4 ${
            selectedId === visa.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary hover:bg-primary/5"
          }`}
          onClick={() => handleSelect(visa.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelect(visa.id)}
        >
          <h3 className="text-lg font-medium">{visa.name}</h3>
          <p className="text-sm">{visa.description}</p>
        </div>
      ))}
      <p className="mt-6 text-sm text-muted-foreground">
        Many professionals use a "stepping stone" strategy: Start with O-1 for immediate work authorization while
        building a stronger profile for EB-1A permanent residency.
      </p>
    </div>
  );
};

export default VisaTypeSelector;
