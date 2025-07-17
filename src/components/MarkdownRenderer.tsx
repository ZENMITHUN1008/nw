
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <pre className="whitespace-pre-wrap text-white">{content}</pre>
    </div>
  );
};

export default MarkdownRenderer;
