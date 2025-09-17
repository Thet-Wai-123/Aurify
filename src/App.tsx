import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Practice from "./pages/Practice";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import BottomNav from "@/components/layout/BottomNav";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import Session from "./pages/Session";
import DashboardPage from "./pages/Dashboard";

const queryClient = new QueryClient();

const AppInner = () => {
  const isMobile = useIsMobile();
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/history" element={<History />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/session" element={<Session />} />
        <Route path="/dashboard" element={<DashboardPage />} />  {/* ✅ added */}
        {/* catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      {isMobile && <BottomNav />}
    </BrowserRouter>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppInner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
