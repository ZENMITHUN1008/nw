
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { AIPlayground } from "./pages/AIPlayground";
import MasterPortal from "./pages/MasterPortal";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-playground" element={<AIPlayground onBack={() => window.history.back()} />} />
          <Route path="/master-portal" element={<MasterPortal />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
