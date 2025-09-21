import { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const currentSection = navLinks
        .map((link) => document.getElementById(link.href.replace("#", "")))
        .find(
          (section) =>
            section &&
            section.offsetTop <= window.scrollY + 120 &&
            section.offsetTop + section.offsetHeight > window.scrollY + 120
        );

      if (currentSection) {
        setActiveLink(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav
      role="navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-therapy ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-therapy-medium"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span
              className={`text-xl font-bold ${
                scrolled
                  ? "text-foreground"
                  : "bg-gradient-primary bg-clip-text text-transparent"
              }`}
            >
              TheraLink
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href.replace("#", ""));
                }}
                className={`transition-therapy font-medium ${
                  activeLink === link.href.replace("#", "")
                    ? "text-primary"
                    : scrolled
                    ? "text-foreground hover:text-primary"
                    : "text-white hover:text-primary"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => scrollToSection("services")}
              className={scrolled ? "text-foreground" : "text-white"}
            >
              Get Started
            </Button>
            <Button variant="hero" size="sm">
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-therapy"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-therapy-medium transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href.replace("#", ""));
                }}
                className={`block w-full text-left py-2 transition-therapy font-medium ${
                  activeLink === link.href.replace("#", "")
                    ? "text-primary"
                    : scrolled
                    ? "text-foreground hover:text-primary"
                    : "text-white hover:text-primary"
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button
                variant="ghost"
                className={`w-full ${scrolled ? "text-foreground" : "text-white"}`}
                onClick={() => scrollToSection("services")}
              >
                Get Started
              </Button>
              <Button variant="hero" className="w-full">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
