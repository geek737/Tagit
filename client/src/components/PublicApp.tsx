import { Route, Switch, useRoute } from "wouter";
import { useEffect } from "react";
import { getAdminUrl } from "@/lib/domainHelper";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import PageTemplate from "@/components/pages/PageTemplate";

const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = getAdminUrl();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to admin...</p>
    </div>
  );
};

const AdminPathRedirect = () => {
  const [, params] = useRoute("/admin/:path*");
  const path = params?.path || "";

  useEffect(() => {
    window.location.href = getAdminUrl(path);
  }, [path]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to admin...</p>
    </div>
  );
};

const DynamicPage = () => {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";

  if (slug.startsWith("admin")) {
    return <NotFound />;
  }

  return <PageTemplate slug={slug} />;
};

const PortfolioChildPage = () => {
  const [, params] = useRoute("/:parentSlug/:childSlug");
  const parentSlug = params?.parentSlug || "";
  const childSlug = params?.childSlug || "";

  if (parentSlug.startsWith("admin")) {
    return <NotFound />;
  }

  const fullSlug = `${parentSlug}/${childSlug}`;
  return <PageTemplate slug={fullSlug} parentSlug={parentSlug} />;
};

export default function PublicApp() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/admin" component={AdminRedirect} />
      <Route path="/admin/:path*" component={AdminPathRedirect} />
      <Route path="/:parentSlug/:childSlug" component={PortfolioChildPage} />
      <Route path="/:slug" component={DynamicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}
