import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent";
  onClick: () => void;
}

export const RoleCard = ({ title, description, icon: Icon, color, onClick }: RoleCardProps) => {
  const colorClasses = {
    primary: "border-primary/20 hover:border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10",
    secondary: "border-secondary/20 hover:border-secondary/40 bg-gradient-to-br from-secondary/5 to-secondary/10", 
    accent: "border-accent-hover hover:border-border bg-gradient-to-br from-accent to-accent-hover",
  };

  const iconColors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-muted-foreground",
  };

  return (
    <Card 
      className={`${colorClasses[color]} border-2 transition-therapy hover-lift cursor-pointer group`}
      onClick={onClick}
    >
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-4 bg-white rounded-full shadow-therapy-soft group-hover:shadow-therapy-medium transition-therapy">
          <Icon className={`h-8 w-8 ${iconColors[color]}`} />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          variant={color === "primary" ? "hero" : color === "secondary" ? "therapy" : "minimal"}
          className="w-full font-medium"
          size="lg"
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
};