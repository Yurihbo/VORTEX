import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Favorites from "./pages/Favorites";
import BookDetail from "./pages/BookDetail";
import AddBook from "./pages/AddBook";
import Goals from "./pages/Goals";
import Achievements from "./pages/Achievements";
import Statistics from "./pages/Statistics";
import Profile from "./pages/Profile";

// Hook de navegação com base correta para o GitHub Pages (/VORTEX/)
const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

function Router() {
  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/library" component={Library} />
        <Route path="/reading" component={Library} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/book/:id" component={BookDetail} />
        <Route path="/add-book" component={AddBook} />
        <Route path="/goals" component={Goals} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/stats" component={Statistics} />
        <Route path="/profile" component={Profile} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
