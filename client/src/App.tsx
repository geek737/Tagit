import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Redirect, useRoute } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Content from "./pages/admin/Content";
import Pages from "./pages/admin/Pages";
import Appearance from "./pages/admin/Appearance";
import Media from "./pages/admin/Media";
import Menu from "./pages/admin/Menu";
import Projects from "./pages/admin/Projects";
import Team from "./pages/admin/Team";
import Settings from "./pages/admin/Settings";
import PageTemplate from "./components/pages/PageTemplate";

const AdminRedirect = () => <Redirect to="/admin/dashboard" />;

const DynamicPage = () => {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";
  
  // Exclude admin routes
  if (slug.startsWith("admin")) {
    return <NotFound />;
  }
  
  return <PageTemplate slug={slug} />;
};

// Portfolio Child Page - Dynamic route: /:parentSlug/:childSlug
const PortfolioChildPage = () => {
  const [, params] = useRoute("/:parentSlug/:childSlug");
  const parentSlug = params?.parentSlug || "";
  const childSlug = params?.childSlug || "";
  
  // Exclude admin routes
  if (parentSlug.startsWith("admin")) {
    return <NotFound />;
  }
  
  // The child page slug in DB is just the child part, but we verify parent in PageTemplate
  return <PageTemplate slug={childSlug} parentSlug={parentSlug} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/admin" component={AdminRedirect} />
          <Route path="/admin/login" component={Login} />
          <Route path="/admin/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/content">
            <ProtectedRoute>
              <Content />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/pages">
            <ProtectedRoute>
              <Pages />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/appearance">
            <ProtectedRoute>
              <Appearance />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/media">
            <ProtectedRoute>
              <Media />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/menu">
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/projects">
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/team">
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          {/* Portfolio child pages route: /:parentSlug/:childSlug (dynamic) */}
          <Route path="/:parentSlug/:childSlug" component={PortfolioChildPage} />
          <Route path="/:slug" component={DynamicPage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
