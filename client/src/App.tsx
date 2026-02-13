import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Companies from "./pages/Companies";
import TrainTypes from "./pages/TrainTypes";
import Formations from "./pages/Formations";
import Photos from "./pages/Photos";
import UploadPhoto from "./pages/UploadPhoto";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Companies} />
      <Route path="/company/:companyId" component={TrainTypes} />
      <Route path="/train-type/:trainTypeId" component={Formations} />
      <Route path="/formation/:formationId" component={Photos} />
      <Route path="/formation/:formationId/upload" component={UploadPhoto} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
