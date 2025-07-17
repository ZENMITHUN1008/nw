
import React from 'react';

const TechStackSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-slate-50 mb-16">Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">React</h3>
            <p className="text-slate-400">Frontend Framework</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">n8n</h3>
            <p className="text-slate-400">Workflow Engine</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">AI</h3>
            <p className="text-slate-400">Voice Processing</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">Supabase</h3>
            <p className="text-slate-400">Backend</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
