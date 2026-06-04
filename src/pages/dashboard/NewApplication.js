import React, { useState } from "react";
import { Award, CheckCircle, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const VISA_REQUIREMENTS = {
  EB1A: {
    title: "EB-1A: Extraordinary Ability",
    description: "Permanent residency for individuals with extraordinary ability",
    criteriaRequired: 3,
    totalCriteria: 10,
    standardLevel: "Highest - Sustained national/international acclaim",
    processingTime: "6-12 months",
    benefits: ["Permanent residency", "Self-petition (no employer required)", "Freedom to change employers"],
  },
  O1A: {
    title: "O-1A: Extraordinary Ability",
    description: "Temporary work visa for individuals with extraordinary ability",
    criteriaRequired: 3,
    totalCriteria: 8,
    standardLevel: "High - Extraordinary ability with current recognition",
    processingTime: "2-4 months",
    benefits: ["Quick processing", "Can lead to EB-1A", "Renewable"],
  },
};

const Button = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer transition-all ${selected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-lg hover:ring-1 hover:ring-primary/50"
      }`}
  >
    {children}
  </div>
);

const Badge = ({ children, variant }) => {
  const variants = {
    success: "bg-green-100 text-green-800",
    secondary: "bg-gray-200 text-gray-800",
    outline: "border border-gray-300 text-gray-700",
  };
  const className = `inline-block px-2 py-0.5 text-xs font-semibold rounded ${variants[variant] || variants.secondary}`;
  return <span className={className}>{children}</span>;
};

const NewVisaSelector = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const allApplications = useSelector((state) => state.data.allApplications || []);
  console.log("allApplications", allApplications);
  const navigate = useNavigate();

  const handleCardClick = (type) => {
    setSelectedType(type);
    setSelectedVisa(VISA_REQUIREMENTS[type]);

    // ✅ Find application by visa_type instead of using hardcoded index
    const application = allApplications.find(app => app.visa_type === type);

    if (application?.application_id) {
      localStorage.setItem("firebaseId", application.application_id);
      console.log(`${type} application_id:`, application.application_id);
    } else {
      console.warn(`${type} application not found or missing application_id`);
      localStorage.removeItem("firebaseId");
    }
  };


  const getIcon = (type) => {
    switch (type) {
      case "EB1A":
        return <Award className="w-8 h-8 text-primary" />;
      case "O1A":
        return <Star className="w-8 h-8 text-primary" />;
      case "O1B":
        return <Users className="w-8 h-8 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">Choose Your Visa Path</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the visa category that best matches your goals and qualifications. Each has different criteria and
          requirements.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {Object.keys(VISA_REQUIREMENTS).map((type) => {
          const info = VISA_REQUIREMENTS[type];
          const selected = selectedType === type;
          return (
            <Card key={type} selected={selected} onClick={() => handleCardClick(type)}>
              <div className="flex flex-col space-y-1.5 p-6 text-center">
                <div className="flex justify-center mb-4">{getIcon(type)}</div>
                <h3 className="font-semibold tracking-tight text-xl">{info.title}</h3>
                <p className="text-muted-foreground text-sm">{info.description}</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Criteria Required:</span>
                    <Badge variant={selected ? "success" : "secondary"}>
                      {info.criteriaRequired} of {info.totalCriteria}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Standard Level:</span>
                    <p className="text-xs text-muted-foreground">{info.standardLevel}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processing:</span>
                    <p className="text-sm text-muted-foreground">{info.processingTime}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Key Benefits:</span>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {info.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {selected && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <CheckCircle className="w-4 h-4" /> Selected
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Strategic Approach Recommendation</h3>
        <p className="text-sm mb-4">
          Many professionals use a "stepping stone" strategy: Start with O-1A for immediate work authorization while
          building a stronger profile for EB-1A permanent residency.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-primary mb-2">Choose O-1A if you:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Need to work in US quickly (2-4 months)</li>
              <li>• Have employer willing to sponsor</li>
              <li>• Building toward EB-1A but not quite ready</li>
              <li>• Work in arts/entertainment (O-1A)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-primary mb-2">Choose EB-1A if you:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Want permanent residency</li>
              <li>• Can self-petition (no employer needed)</li>
              <li>• Have sustained track record of acclaim</li>
              <li>• Want freedom to change employers</li>
            </ul>
          </div>
        </div>
      </div>
      {selectedType && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate("/application/new", { state: { application: selectedType } })}>
            Continue with {VISA_REQUIREMENTS[selectedType].title}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewVisaSelector;
