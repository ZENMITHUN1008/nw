
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import VoiceDemoSection from '../components/VoiceDemoSection';
import TechStackSection from '../components/TechStackSection';
import UseCasesSection from '../components/UseCasesSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

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

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <VoiceDemoSection />
      <TechStackSection />
      <UseCasesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
