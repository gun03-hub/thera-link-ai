import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TherapistDashboard from "./pages/dashboard/Therapist";
import PatientDashboard from "./pages/dashboard/Patient";
import AdminDashboard from "./pages/dashboard/Admin";
import SessionPage from "./pages/Session";
import NeuroNex from "./pages/NeuroNex";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard/therapist" element={<TherapistDashboard />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/session/:id" element={<SessionPage />} />
          <Route path="/neuronex" element={<NeuroNex />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
