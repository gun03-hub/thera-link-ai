import { useState } from "react";
import { Heart, Brain, Shield, ChevronRight } from "lucide-react";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-therapy.jpg";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "patient",
      title: "I'm seeking support",
      description: "Connect with AI-powered tools and licensed therapists for personalized mental health care.",
      icon: Heart,
      color: "primary" as const,
    },
    {
      id: "therapist", 
      title: "I'm a therapist",
      description: "Access AI-enhanced tools to better serve your clients and streamline your practice.",
      icon: Brain,
      color: "secondary" as const,
    },
    {
      id: "admin",
      title: "I'm an administrator",
      description: "Manage the platform, verify therapists, and oversee compliance and analytics.",
      icon: Shield,
      color: "accent" as const,
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    // TODO: Navigate to respective dashboard
    console.log(`Selected role: ${roleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Image */}
          <div className="mb-12 relative">
            <img
              src={heroImage}
              alt="TheraLink - AI-Powered Therapy Platform"
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-therapy-strong"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent rounded-2xl" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              TheraLink
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light">
              AI-Powered Therapy Companion Platform
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Bridging the gap between technology and human care. Connect with licensed therapists, 
              access AI-powered mental health tools, and take control of your wellness journey.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button variant="hero" size="xl" className="group">
                Start Your Journey
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-therapy" />
              </Button>
              <Button variant="minimal" size="xl">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 px-4">
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

      {/* Features Preview */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Empowering Mental Health with AI
          </h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gradient-card p-6 rounded-xl shadow-therapy-soft hover-lift">
              <Heart className="h-10 w-10 text-primary mb-4" />
              <h4 className="text-lg font-semibold mb-2">Compassionate AI</h4>
              <p className="text-muted-foreground">
                24/7 AI companion providing empathetic support and guidance between sessions.
              </p>
            </div>
            <div className="bg-gradient-card p-6 rounded-xl shadow-therapy-soft hover-lift">
              <Brain className="h-10 w-10 text-secondary mb-4" />
              <h4 className="text-lg font-semibold mb-2">Clinical Tools</h4>
              <p className="text-muted-foreground">
                Advanced analytics and insights to enhance therapeutic outcomes and progress tracking.
              </p>
            </div>
            <div className="bg-gradient-card p-6 rounded-xl shadow-therapy-soft hover-lift">
              <Shield className="h-10 w-10 text-accent-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">Privacy First</h4>
              <p className="text-muted-foreground">
                HIPAA-compliant platform ensuring your data is secure and confidential.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;