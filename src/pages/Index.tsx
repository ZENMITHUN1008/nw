
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowRight, 
  Zap, 
  Code, 
  Sparkles, 
  PlayCircle, 
  Users, 
  TrendingUp,
  Globe,
  ChevronRight,
  Mic,
  MessageSquare
} from 'lucide-react';
import { Logo } from '../components/Logo';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // If user is logged in, don't show landing page
  if (user) {
    return null;
  }

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Workflow Generation",
      description: "Create complex workflows using natural language. Our AI understands your requirements and generates production-ready automation.",
      color: "text-blue-500"
    },
    {
      icon: Code,
      title: "N8N Integration", 
      description: "Seamlessly connect to your N8N instances. Deploy, manage, and monitor workflows directly from our platform.",
      color: "text-green-500"
    },
    {
      icon: Mic,
      title: "Voice Control",
      description: "Control your workflows using voice commands. Perfect for hands-free automation management.",
      color: "text-purple-500"
    },
    {
      icon: MessageSquare,
      title: "Intelligent Chat",
      description: "Chat with AI about your workflows. Get insights, troubleshooting help, and optimization suggestions.",
      color: "text-orange-500"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "2.5K+", color: "text-blue-500" },
    { icon: Zap, label: "Workflows Created", value: "15K+", color: "text-green-500" },
    { icon: TrendingUp, label: "Success Rate", value: "99.9%", color: "text-purple-500" },
    { icon: Globe, label: "Integrations", value: "500+", color: "text-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/ai-playground')}>
              AI Playground
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-6">
              AI-Powered Workflow Automation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transform your ideas into powerful N8N workflows using natural language. 
              Chat with AI, create workflows, and automate everything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/ai-playground')}>
                <PlayCircle className="w-5 h-5 mr-2" />
                Try AI Playground
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" onClick={() => navigate('/dashboard')}>
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, manage, and optimize your automation workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-secondary`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-purple-600/10">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Workflows?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already automating their work with AI-powered workflows
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/ai-playground')}>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Building Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" onClick={() => navigate('/dashboard')}>
                View Dashboard
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <Logo />
              <span className="text-muted-foreground">
                © 2024 AI Workflow Platform. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/ai-playground')}>
                AI Playground
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/master-portal')}>
                Master Portal
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
