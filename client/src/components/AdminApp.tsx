import { Route, Switch } from "wouter";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminRoot from "@/components/AdminRoot";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Content from "@/pages/admin/Content";
import Pages from "@/pages/admin/Pages";
import Appearance from "@/pages/admin/Appearance";
import Media from "@/pages/admin/Media";
import Menu from "@/pages/admin/Menu";
import Settings from "@/pages/admin/Settings";
import EmailManagement from "@/pages/admin/EmailManagement";
import NotFound from "@/pages/NotFound";

export default function AdminApp() {
  return (
    <Switch>
      <Route path="/" component={AdminRoot} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/content">
        <ProtectedRoute>
          <Content />
        </ProtectedRoute>
      </Route>
      <Route path="/pages">
        <ProtectedRoute>
          <Pages />
        </ProtectedRoute>
      </Route>
      <Route path="/appearance">
        <ProtectedRoute>
          <Appearance />
        </ProtectedRoute>
      </Route>
      <Route path="/media">
        <ProtectedRoute>
          <Media />
        </ProtectedRoute>
      </Route>
      <Route path="/menu">
        <ProtectedRoute>
          <Menu />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/emails">
        <ProtectedRoute>
          <EmailManagement />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}
