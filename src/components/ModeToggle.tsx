
import React from 'react';
import { Moon, Sun } from 'lucide-react';

export const ModeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-transparent hover:bg-gray-100 h-10 w-10"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
