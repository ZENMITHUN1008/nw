import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Code, 
  Download,
  Eye,
  EyeOff,
  
  ExternalLink,
  Zap,
  FileCode,
  Database,
  Brackets
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, inline }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  // Determine if this should be collapsed by default
  const isJson = language === 'json' || (language === '' && code.trim().startsWith('{'));
  const shouldCollapseByDefault = isJson && (code.length > 500 || code.split('\n').length > 20);
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapseByDefault);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // For inline code
  if (inline) {
    return (
      <code className="bg-slate-700/50 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-sm break-words">
        {children}
      </code>
    );
  }

  // Check if it's JSON and try to format it
  let formattedCode = code;
  let parsedJson: any = null;

  if (isJson) {
    try {
      parsedJson = JSON.parse(code);
      formattedCode = JSON.stringify(parsedJson, null, 2);
    } catch (e) {
      // If parsing fails, use original code
    }
  }

  // Special styling for JSON
  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'json': return 'from-emerald-500 to-emerald-600';
      case 'javascript': case 'js': return 'from-yellow-500 to-yellow-600';
      case 'typescript': case 'ts': return 'from-blue-500 to-blue-600';
      case 'python': return 'from-green-500 to-green-600';
      case 'bash': case 'shell': return 'from-gray-500 to-gray-600';
      case 'sql': return 'from-purple-500 to-purple-600';
      case 'yaml': case 'yml': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'json': return isJson ? Brackets : Code;
      case 'javascript': case 'js': case 'typescript': case 'ts': return FileCode;
      case 'python': return Code;
      case 'bash': case 'shell': return ExternalLink;
      case 'sql': return Database;
      default: return Code;
    }
  };

  const LanguageIcon = getLanguageIcon(language);
  const colorClass = getLanguageColor(language);

  // Get JSON metadata for display
  const getJsonMetadata = () => {
    if (!isJson || !parsedJson) return null;
    
    const properties = Object.keys(parsedJson).length;
    const nodes = parsedJson.nodes?.length;
    const lines = formattedCode.split('\n').length;
    const chars = formattedCode.length;
    
    return { properties, nodes, lines, chars };
  };

  const jsonMeta = getJsonMetadata();

  return (
    <div className="bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden my-4 shadow-lg w-full">
      {/* Enhanced Header - Clickable for JSON collapse */}
      <div 
        className={`flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 ${
          isJson ? 'cursor-pointer hover:bg-slate-700/50 transition-colors duration-200' : ''
        }`}
        onClick={isJson ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className={`w-8 h-8 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <LanguageIcon className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-200">
                {language ? language.toUpperCase() : 'CODE'}
              </span>
              
              {/* JSON Dropdown Indicator */}
              {isJson && (
                <div className="flex items-center space-x-2">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                  )}
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Enhanced Metadata Display */}
            <div className="text-xs text-slate-400 mt-1">
              {jsonMeta ? (
                <div className="flex items-center space-x-3 flex-wrap">
                  <span>{jsonMeta.properties} properties</span>
                  {jsonMeta.nodes && <span>• {jsonMeta.nodes} nodes</span>}
                  <span>• {jsonMeta.lines} lines</span>
                  <span className="hidden sm:inline">• {jsonMeta.chars} characters</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3 flex-wrap">
                  <span>{formattedCode.split('\n').length} lines</span>
                  <span>• {formattedCode.length} characters</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isJson && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center space-x-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs rounded-lg transition-colors duration-200"
              title={showRaw ? "Show formatted" : "Show raw JSON"}
            >
              {showRaw ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{showRaw ? 'Formatted' : 'Raw'}</span>
            </button>
          )}
          
          {/* Manual collapse for non-JSON or when you want a button */}
          {!isJson && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs rounded-lg transition-colors duration-200"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span className="hidden sm:inline">{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs rounded-lg transition-colors duration-200"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs rounded-lg transition-colors duration-200"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Collapsible Code Content with Animation */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'
      }`}>
        {!isCollapsed && (
          <div className="relative w-full">
            {/* Collapsed Preview for JSON */}
            {isJson && isCollapsed && (
              <div className="p-4 bg-slate-800/30 border-b border-slate-700/50">
                <div className="text-sm text-slate-400 mb-2">JSON Preview:</div>
                <div className="bg-slate-900/50 rounded p-3 text-xs text-slate-300 font-mono break-words">
                  {`{ ${Object.keys(parsedJson || {}).slice(0, 3).join(', ')} ${Object.keys(parsedJson || {}).length > 3 ? '...' : ''} }`}
                </div>
              </div>
            )}

            {/* Code Container with Proper Overflow Handling */}
            <div className="w-full overflow-x-auto">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language || 'text'}
                PreTag="div"
                className="!bg-transparent !p-0 !m-0 !min-w-0"
                customStyle={{
                  backgroundColor: 'transparent',
                  padding: '1rem',
                  margin: 0,
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  minWidth: '0',
                  width: '100%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                codeTagProps={{
                  style: {
                    backgroundColor: 'transparent',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    minWidth: '0',
                    width: '100%'
                  }
                }}
                wrapLines={true}
                wrapLongLines={true}
              >
                {showRaw && isJson ? code : formattedCode}
              </SyntaxHighlighter>
            </div>

            {/* Enhanced JSON Analysis Panel */}
            {isJson && parsedJson && !showRaw && Object.keys(parsedJson).length > 5 && (
              <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-300">JSON Structure Analysis</div>
                  <div className="text-xs text-slate-500">
                    {Object.keys(parsedJson).length} total properties
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(parsedJson).slice(0, 8).map(([key, value]) => {
                    const valueType = Array.isArray(value) 
                      ? `Array[${value.length}]` 
                      : value && typeof value === 'object' 
                        ? `Object{${Object.keys(value).length}}`
                        : typeof value;
                    
                    return (
                      <div key={key} className="bg-slate-800/50 border border-slate-700/30 p-3 rounded-lg min-w-0">
                        <div className="text-slate-200 font-medium truncate text-sm" title={key}>
                          {key}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          {valueType}
                        </div>
                        {/* Show preview for strings */}
                        {typeof value === 'string' && value.length > 0 && (
                          <div className="text-slate-500 text-xs mt-1 truncate break-words" title={value}>
                            "{value.length > 20 ? value.substring(0, 20) + '...' : value}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {Object.keys(parsedJson).length > 8 && (
                    <div className="bg-slate-800/30 border border-slate-700/30 p-3 rounded-lg flex items-center justify-center text-slate-500 border-dashed min-w-0">
                      <div className="text-center">
                        <div className="text-sm">+{Object.keys(parsedJson).length - 8}</div>
                        <div className="text-xs">more</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special indicators for n8n workflows */}
                {parsedJson.nodes && parsedJson.connections && (
                  <div className="mt-4 pt-3 border-t border-slate-700/30">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center space-x-4 text-slate-400 flex-wrap gap-2">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-indigo-400" />
                          <span>n8n Workflow</span>
                        </span>
                        <span>{parsedJson.nodes.length} nodes</span>
                        <span>{Object.keys(parsedJson.connections || {}).length} connections</span>
                        <span className={parsedJson.active ? 'text-emerald-400' : 'text-amber-400'}>
                          {parsedJson.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapsed State Indicator */}
      {isCollapsed && (
        <div className="px-4 py-3 bg-slate-800/20 border-t border-slate-700/30">
          <div className="flex items-center justify-center text-slate-400 text-sm">
            <ChevronRight className="w-4 h-4 mr-2" />
            <span>Click to expand {language ? language.toUpperCase() : 'code'}</span>
            {jsonMeta && (
              <span className="ml-2 text-xs">
                ({jsonMeta.lines} lines, {jsonMeta.properties} properties)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert max-w-none w-full ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block component
          code: CodeBlock as any,
          
          // Style other elements
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-slate-50 mb-4 pb-2 border-b border-slate-700">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-slate-50 mb-3 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-slate-50 mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-slate-100 mb-2 mt-3">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-slate-200 mb-4 leading-relaxed break-words">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-slate-200 mb-4 space-y-1 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-slate-200 mb-4 space-y-1 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-200 break-words">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 bg-indigo-500/5 py-2 rounded-r">
              <div className="text-slate-300 italic break-words">
                {children}
              </div>
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">
              {children}
            </em>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30 hover:decoration-indigo-300/50 transition-colors duration-200 break-words"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 w-full">
              <table className="min-w-full border border-slate-700 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-slate-900/50">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-slate-200 break-words">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-slate-300 break-words">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="border-slate-700 my-6" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};