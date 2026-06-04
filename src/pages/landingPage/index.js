import Header from "components/Header";
import React from "react";
import { CheckCircle, Star } from "lucide-react";
import heroImage from "assets/hero-immigration.jpg";
import Services from "./Services";
import Process from "./Process";
import { Footer } from "components";

const Badge = ({ children, className }) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, className, variant }) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-11 rounded-md text-lg px-8 py-4 font-semibold";
  const variantClasses =
    variant === "outline"
      ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium"
      : "bg-gradient-hero text-white shadow-glow hover:shadow-elegant transform hover:scale-105 transition-smooth";
  return <button className={`${baseClasses} ${variantClasses} ${className}`}>{children}</button>;
};

const Hero = () => {
  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-secondary via-white to-accent/10">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-4">✨ EB-1A & O-1 Visa Specialists</Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
              Your Path to US
              <span className="bg-gradient-hero bg-clip-text text-transparent"> Excellence </span>
              Visa Success
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform your achievements into a winning EB-1A or O-1 petition. Our comprehensive platform evaluates
              your profile, identifies gaps, and provides a clear roadmap to visa approval.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero">Start Free Assessment</Button>
              <Button variant="outline">View Success Stories</Button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Cases Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">12</div>
                <div className="text-sm text-muted-foreground">Months Avg</div>
              </div>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur-2xl opacity-20"></div>
            <img
              src={heroImage}
              alt="Professional immigration consulting"
              className="relative rounded-2xl shadow-elegant w-full"
            />
            <div className="absolute -top-4 -left-4 bg-success text-success-foreground p-3 rounded-2xl shadow-card animate-bounce">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground p-3 rounded-2xl shadow-card">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <Services />
      <Process />
      <Footer />
    </div>
  );
}

export default LandingPage;
