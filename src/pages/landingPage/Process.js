import React from "react";
import { FileText, Search, Target, Upload, CheckCircle, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    Icon: FileText,
    iconClass: "w-8 h-8 text-primary",
    title: "Complete Assessment",
    description: "Fill out our comprehensive intake form covering all aspects of your background and achievements.",
    deliverable: "Detailed profile analysis",
  },
  {
    number: "02",
    Icon: Search,
    iconClass: "w-8 h-8 text-accent",
    title: "Expert Review",
    description: "Our consultants evaluate your profile against USCIS criteria and identify strengths and gaps.",
    deliverable: "Criteria mapping & gap analysis",
  },
  {
    number: "03",
    Icon: Target,
    iconClass: "w-8 h-8 text-success",
    title: "Strategy Development",
    description: "Receive a personalized roadmap with specific actions to strengthen your profile.",
    deliverable: "Custom action plan & timeline",
  },
  {
    number: "04",
    Icon: Upload,
    iconClass: "w-8 h-8 text-primary",
    title: "Evidence Building",
    description: "Work through your roadmap, upload documents, and track progress in real-time.",
    deliverable: "Organized evidence portfolio",
  },
  {
    number: "05",
    Icon: CheckCircle,
    iconClass: "w-8 h-8 text-success",
    title: "Final Review",
    description: "Complete evaluation of your petition package before attorney handoff or filing.",
    deliverable: "Filing-ready petition package",
  },
  {
    number: "06",
    Icon: Rocket,
    iconClass: "w-8 h-8 text-accent",
    title: "Success!",
    description: "File your petition with confidence or hand off to your attorney with a complete package.",
    deliverable: "USCIS filing or attorney transfer",
  },
];

export default function Process() {
  return (
    <section id="process" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground mb-4">
            Our Process
          </div>
          <h2 className="text-4xl font-bold text-primary mb-6">Your Journey to Success</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our proven 6-step process has helped hundreds of professionals achieve their visa goals. Here's exactly what
            happens from start to finish.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-success transform -translate-y-1/2 z-0"></div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className={`rounded-lg shadow-sm relative bg-white shadow-card hover:shadow-elegant transition-smooth border-0 ${
                  idx < 3 ? "lg:mb-8" : "lg:mt-8"
                }`}
              >
                <div className="p-6">
                  <div className="relative z-10">
                    <div className="absolute -top-10 left-6 bg-gradient-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-card">
                      {step.number}
                    </div>
                    <div className="pt-8">
                      <div className="flex items-center mb-4">
                        <step.Icon className={step.iconClass} />
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="font-medium text-primary">Deliverable:</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.deliverable}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow on mobile */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-primary p-8 rounded-2xl text-white shadow-elegant">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-lg opacity-90 mb-6">
              Join hundreds of successful professionals who chose our proven process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-smooth">
                Start Free Assessment
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-smooth">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
