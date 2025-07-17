
import React from 'react';

const UseCasesSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-50 mb-16">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-50 mb-4">Data Processing</h3>
            <p className="text-slate-300">Automate data workflows with voice commands</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-50 mb-4">API Integration</h3>
            <p className="text-slate-300">Connect services using natural language</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-50 mb-4">Notifications</h3>
            <p className="text-slate-300">Set up alerts and monitoring systems</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
