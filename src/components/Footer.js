import React from "react";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
  // JSON-driven data for easy management
  const contactItems = [
    { id: "email", icon: Mail, text: "contact@mavenvisa.com" },
    { id: "phone", icon: Phone, text: "+1 (555) 123-4567" },
    { id: "location", icon: MapPin, text: "New York, NY" },
  ];

  const services = [
    { id: "eb1a", label: "EB-1A Assessment", href: "#" },
    { id: "o1", label: "O-1 Evaluation", href: "#" },
    { id: "profile", label: "Profile Development", href: "#" },
    { id: "evidence", label: "Evidence Review", href: "#" },
    { id: "tracking", label: "Success Tracking", href: "#" },
  ];

  const resources = [
    { id: "stories", label: "Success Stories", href: "#" },
    { id: "guide", label: "EB-1A Criteria Guide", href: "#" },
    { id: "o1req", label: "O-1 Requirements", href: "#" },
    { id: "faq", label: "FAQ", href: "#" },
    { id: "blog", label: "Blog", href: "#" },
  ];

  const company = [
    { id: "about", label: "About Us", href: "#" },
    { id: "team", label: "Our Team", href: "#" },
    { id: "careers", label: "Careers", href: "#" },
    { id: "contact", label: "Contact", href: "#" },
    { id: "privacy", label: "Privacy Policy", href: "#" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-accent rounded-lg" />
              <span className="text-2xl font-bold">MavenVisa</span>
            </div>

            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Your trusted partner for EB-1A and O-1 visa success. We transform achievements into compelling petitions.
            </p>

            <div className="space-y-3">
              {contactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <Icon className={`lucide lucide-${item.id} w-5 h-5 text-accent`} />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2 - Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <a href={s.href} className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              {resources.map((r) => (
                <li key={r.id}>
                  <a href={r.href} className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {company.map((c) => (
                <li key={c.id}>
                  <a href={c.href} className="text-primary-foreground/80 hover:text-accent transition-smooth">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-col lg:flex-row gap-4 text-sm text-primary-foreground/60">
              <p>© 2024 MavenVisa. All rights reserved.</p>

              <p className="flex items-center gap-1">
                <span>Legal Disclaimer:</span>

                {/* ExternalLink (lucide-react) */}
                <ExternalLink className="lucide lucide-external-link w-4 h-4" />

                <span>Not a law firm. Consulting services only.</span>
              </p>
            </div>

            {/* Plain button with the exact class string from the DOM tree */}
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 shadow-card font-semibold h-11 rounded-md px-8">
              Start Your Assessment
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
