import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import NewGoal from "./pages/NewGoal";
import GoalDetail from "./pages/GoalDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";


// Preview pages (UI only, no auth)
import PreviewLayout from "./pages/preview/PreviewLayout";
import PreviewDashboard from "./pages/preview/PreviewDashboard";
import PreviewGoals from "./pages/preview/PreviewGoals";
import PreviewNewGoal from "./pages/preview/PreviewNewGoal";
import PreviewGoalDetail from "./pages/preview/PreviewGoalDetail";
import PreviewProfile from "./pages/preview/PreviewProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/objetivos" element={<Goals />} />
              <Route path="/novo-objetivo" element={<NewGoal />} />
              <Route path="/objetivo/:id" element={<GoalDetail />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>
            
            {/* Preview routes (UI only, no authentication) */}
            <Route path="/preview" element={<PreviewLayout />}>
              <Route path="dashboard" element={<PreviewDashboard />} />
              <Route path="objetivos" element={<PreviewGoals />} />
              <Route path="novo-objetivo" element={<PreviewNewGoal />} />
              <Route path="objetivo/:id" element={<PreviewGoalDetail />} />
              <Route path="perfil" element={<PreviewProfile />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
