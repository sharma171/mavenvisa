import React from "react";
import { Target, CheckCircle2, Award, TrendingUp, FileText, Shield, Clock, ArrowRight } from "lucide-react";

const servicesData = [
  {
    badge: "Most Popular",
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "EB-1A Excellence Track",
    description: "For individuals with extraordinary ability in sciences, arts, education, business, or athletics.",
    features: ["Achievement mapping", "Evidence gap analysis", "Profile strengthening roadmap"],
    price: "$2,500",
  },
  {
    badge: "Fast Track",
    icon: <Award className="w-8 h-8 text-accent" />,
    title: "O-1 Outstanding Path",
    description: "For professionals with extraordinary achievements in their field of expertise.",
    features: ["Criteria evaluation", "Portfolio optimization", "Filing strategy"],
    price: "$2,000",
  },
  {
    badge: "Long-term Success",
    icon: <TrendingUp className="w-8 h-8 text-success" />,
    title: "Profile Development",
    description: "12-month strategic plan to build qualifying achievements for future applications.",
    features: ["Achievement roadmap", "Opportunity matching", "Progress tracking"],
    price: "$1,500",
  },
];

const additionalServices = [
  {
    icon: <FileText className="w-6 h-6 text-primary" />,
    title: "Comprehensive Assessment",
    description: "Detailed evaluation against all 10 EB-1A criteria or 8 O-1 criteria",
  },
  {
    icon: <Shield className="w-6 h-6 text-success" />,
    title: "Evidence Review",
    description: "Expert analysis of your documentation with strength scoring",
  },
  {
    icon: <Clock className="w-6 h-6 text-accent" />,
    title: "Timeline Planning",
    description: "Structured roadmap to meet all deadlines efficiently",
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
    title: "Success Tracking",
    description: "Real-time progress updates and achievement validation",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
            Our Services
          </div>
          <h2 className="text-4xl font-bold text-primary mb-6">Choose Your Success Path</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're ready to file or need to build your profile, we have the right service to get you there.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {servicesData.map((service, idx) => (
            <div
              key={idx}
              className="rounded-lg text-card-foreground shadow-sm relative overflow-hidden shadow-card hover:shadow-elegant transition-smooth border-0 bg-white"
            >
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors absolute top-4 right-4 bg-accent text-accent-foreground">
                {service.badge}
              </div>
              <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="mb-4">{service.icon}</div>
                <h3 className="font-semibold tracking-tight text-xl text-primary">{service.title}</h3>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <p className="text-muted-foreground">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="text-2xl font-bold text-primary mb-4">Starting at {service.price}</div>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 w-full">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalServices.map((item, idx) => (
            <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-card">
              <div className="mx-auto mb-4 p-3 bg-secondary rounded-full w-fit">{item.icon}</div>
              <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
