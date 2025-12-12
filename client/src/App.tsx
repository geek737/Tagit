import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { FacebookPixelProvider } from "@/components/analytics/FacebookPixelProvider";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { isAdminSubdomain } from "@/lib/domainHelper";
import AdminApp from "@/components/AdminApp";
import PublicApp from "@/components/PublicApp";

const App = () => {
  const isAdmin = isAdminSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FacebookPixelProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {isAdmin ? <AdminApp /> : <PublicApp />}
            {!isAdmin && <CookieConsentBanner />}
          </TooltipProvider>
        </FacebookPixelProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
