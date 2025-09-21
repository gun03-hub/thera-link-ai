import { useState } from "react";
import {
  Heart,
  Brain,
  Shield,
  ChevronRight,
  Users,
  Zap,
  Clock,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-therapy.jpg";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "patient",
      title: "I'm seeking support",
      description:
        "Connect with AI-powered tools and licensed therapists for personalized mental health care.",
      icon: Heart,
      color: "primary" as const,
    },
    {
      id: "therapist",
      title: "I'm a therapist",
      description:
        "Access AI-enhanced tools to better serve your clients and streamline your practice.",
      icon: Brain,
      color: "secondary" as const,
    },
    {
      id: "admin",
      title: "I'm an administrator",
      description:
        "Manage the platform, verify therapists, and oversee compliance and analytics.",
      icon: Shield,
      color: "accent" as const,
    },
  ];

  const features = [
    {
      icon: Heart,
      title: "Compassionate AI",
      description:
        "24/7 AI companion providing empathetic support and guidance between sessions.",
    },
    {
      icon: Brain,
      title: "Clinical Tools",
      description:
        "Advanced analytics and insights to enhance therapeutic outcomes and progress tracking.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "HIPAA-compliant platform ensuring your data is secure and confidential.",
    },
    {
      icon: Users,
      title: "Licensed Therapists",
      description:
        "Connect with verified, experienced mental health professionals.",
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description:
        "Get immediate feedback and recommendations powered by AI analysis.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description:
        "Book sessions that fit your schedule with easy rescheduling options.",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Choose Your Role",
      description:
        "Select whether you're a patient seeking support, a therapist, or an administrator.",
    },
    {
      step: "2",
      title: "Complete Your Profile",
      description:
        "Fill out your information and preferences to get personalized recommendations.",
    },
    {
      step: "3",
      title: "Connect & Start",
      description:
        "Begin your journey with AI-powered tools and professional therapy support.",
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    console.log(`Selected role: ${roleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen pt-24 pb-20 px-4 text-center flex items-center"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="TheraLink - AI-Powered Therapy Platform"
            className="w-full h-full object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-blue-900 animate-fadeIn">
            TheraLink
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-light text-blue-900 [text-shadow:2px_2px_4px_white] animate-fadeIn delay-200">
            AI-Powered Therapy Companion Platform
          </p>

          <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed animate-fadeIn delay-300">
            Bridging the gap between technology and human care. Connect with
            licensed therapists, access AI-powered tools, and take control of
            your wellness journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeIn delay-400">
            <Button variant="hero" size="xl" className="group">
              Take the First Step
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-therapy" />
            </Button>
            <Button variant="minimal" size="xl">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Revolutionizing Mental Health Care
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TheraLink combines the power of artificial intelligence with human
              expertise to create a comprehensive mental health platform that's
              accessible, effective, and personal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Why TheraLink?</h3>
              <div className="space-y-4">
                {[
                  "AI-powered insights enhance traditional therapy",
                  "24/7 support when you need it most",
                  "HIPAA-compliant and secure platform",
                  "Licensed therapists verified and trusted",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card p-8 rounded-2xl shadow-therapy-medium text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground mb-4">Lives Touched</div>
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-muted-foreground mb-4">
                Licensed Therapists
              </div>
              <div className="text-4xl font-bold text-accent-foreground mb-2">
                24/7
              </div>
              <div className="text-muted-foreground">AI Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Role Selection Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TheraLink serves different roles in the mental health ecosystem.
              Select your role to access tailored features and tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                title={role.title}
                description={role.description}
                icon={role.icon}
                color={role.color}
                onClick={() => handleRoleSelect(role.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empowering Mental Health with AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced features designed to support your mental health journey
              with cutting-edge technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gradient-card shadow-therapy-soft hover:scale-[1.03] transition-transform duration-300 border-0"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-white rounded-full shadow-therapy-soft">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with TheraLink is simple. Follow these three steps
              to begin your mental health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="mx-auto mb-6 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-therapy-medium">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="hero" size="lg">
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section
        id="contact"
        className="py-20 px-4 bg-gradient-primary text-white"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Mental Health Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who have already started their path to better mental
            wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="minimal"
              size="xl"
              className="bg-white text-primary hover:bg-white/90"
            >
              Try AI Chat Now
            </Button>
            <Button
              size="xl"
              className="px-6 py-3 rounded-lg border-2 border-blue-400 text-gray-800 font-semibold bg-transparent hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TheraLink
            </span>
          </div>
          <p className="text-muted-foreground mb-6">
            Bridging technology and human care for better mental health.
          </p>

          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 TheraLink. All rights reserved. HIPAA Compliant Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
