
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { ConnectionSetup } from "../components/ConnectionSetup";
import { WorkflowGrid } from "../components/WorkflowGrid";
import { WorkflowList } from "../components/WorkflowList";
import { ProfilePage } from "../components/ProfilePage";
import { MCPServerManager } from "../components/MCPServerManager";
import UsageLimitModal from "../components/UsageLimitModal";
import PricingModal from "../components/PricingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "../hooks/useSubscription";
import { Grid, List, User, Settings, LogOut, Crown, Shield } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const [activeTab, setActiveTab] = useState("workflows");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [usageData] = useState({
    workflowsUsed: 0,
    workflowsLimit: 5,
    executionsUsed: 0,
    executionsLimit: 100,
  });

  useEffect(() => {
    // Track dashboard access
    const trackAccess = async () => {
      if (user) {
        await supabase.from('user_analytics').insert({
          user_id: user.id,
          action_type: 'dashboard_access',
          resource_type: 'page',
          resource_id: 'dashboard',
          metadata: { timestamp: new Date().toISOString() }
        });
      }
    };

    trackAccess();
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    try {
      // Track logout
      await supabase.from('user_analytics').insert({
        user_id: user.id,
        action_type: 'logout',
        resource_type: 'auth',
        resource_id: 'user_session',
        metadata: { timestamp: new Date().toISOString() }
      });

      await signOut();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleMasterPortal = () => {
    // Track master portal access
    if (user) {
      supabase.from('user_analytics').insert({
        user_id: user.id,
        action_type: 'master_portal_access',
        resource_type: 'navigation',
        resource_id: 'master_portal',
        metadata: { timestamp: new Date().toISOString() }
      });
    }
    
    navigate("/master-portal");
  };

  const isFreePlan = !currentTier || currentTier.id === "free";
  const usagePercentage = (usageData.workflowsUsed / usageData.workflowsLimit) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            {isFreePlan && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                Free Plan
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isFreePlan && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingModal(true)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Usage Overview Card for Free Plan */}
        {isFreePlan && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <Crown className="w-5 h-5 mr-2" />
                Free Plan Usage
              </CardTitle>
              <CardDescription className="text-amber-700">
                You're currently on the free plan with limited features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Workflows Created</span>
                  <span>{usageData.workflowsUsed} / {usageData.workflowsLimit}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setShowUsageModal(true)}
                  variant="outline"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowPricingModal(true)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflows" className="flex items-center space-x-2">
                <Grid className="w-4 h-4" />
                <span>Workflows</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Connections</span>
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>MCP Servers</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Workflows</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {viewMode === "grid" ? (
                <WorkflowGrid workflows={[]} onAction={() => {}} />
              ) : (
                <WorkflowList workflows={[]} onAction={() => {}} />
              )}
            </TabsContent>

            <TabsContent value="connections">
              <ConnectionSetup onSkip={() => {}} onSuccess={() => {}} />
            </TabsContent>

            <TabsContent value="mcp">
              <MCPServerManager onBack={() => {}} />
            </TabsContent>

            <TabsContent value="profile">
              <ProfilePage onBack={() => {}} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Master Portal Button - Fixed at bottom */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleMasterPortal}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-full"
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Master Portal
          </Button>
        </div>
      </div>

      {/* Modals */}
      <UsageLimitModal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        limitType="workflow"
        currentTier={currentTier}
        usage={{ workflows: usageData.workflowsUsed, voiceMinutes: 0 }}
        onUpgrade={() => {
          setShowUsageModal(false);
          setShowPricingModal(true);
        }}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
};

export default Dashboard;
