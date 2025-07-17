
import React from 'react';
import { Mic } from 'lucide-react';

const VoiceDemoSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-50 mb-8">Voice Demo</h2>
        <p className="text-xl text-slate-300 mb-12">
          Experience the power of voice-driven automation
        </p>
        <div className="bg-slate-900 rounded-xl p-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400">
            "Create a workflow that sends me an email when someone stars my GitHub repository"
          </p>
        </div>
      </div>
    </section>
  );
};

export default VoiceDemoSection;
