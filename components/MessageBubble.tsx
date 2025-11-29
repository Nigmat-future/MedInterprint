import React from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Helper: Parse Bold Text (**text**)
  const parseBold = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
  };

  // Helper: Render a Markdown Table
  const renderTable = (lines: string[], keyPrefix: string) => {
    if (lines.length < 2) return null;

    const headers = lines[0]
      .replace(/^\||\|$/g, '')
      .split('|')
      .map(h => h.trim());
    
    const rows = lines.slice(2).map(line => 
      line.replace(/^\||\|$/g, '').split('|').map(c => c.trim())
    );

    return (
      <div key={keyPrefix} className="my-4 w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 min-w-[120px]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-slate-600">
                      {parseBold(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper: Render individual lines (Headers, Lists, Paragraphs)
  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-3"></div>;

    // Headers (### or ##)
    if (trimmed.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">{parseBold(trimmed.slice(4))}</h3>;
    }
    if (trimmed.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-slate-800 mt-5 mb-2">{parseBold(trimmed.slice(3))}</h2>;
    }

    // Bullet Points (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
            <div key={index} className="flex gap-2.5 ml-1 mb-1.5">
                <span className="text-medical-500 mt-2 text-[6px] flex-shrink-0"><i className="fa-solid fa-circle"></i></span>
                <span className="leading-relaxed">{parseBold(trimmed.slice(2))}</span>
            </div>
        );
    }

    // Numbered Lists (1. )
    const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
        return (
            <div key={index} className="flex gap-2 ml-1 mb-1.5">
                <span className="font-bold text-medical-600 text-sm mt-0.5 min-w-[1.2rem]">{numMatch[1]}.</span>
                <span className="leading-relaxed">{parseBold(numMatch[2])}</span>
            </div>
        );
    }

    // Standard Paragraph
    return <div key={index} className="mb-1 leading-relaxed">{parseBold(line)}</div>;
  };

  // Main Parsing Logic
  const renderContent = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    
    let inTable = false;
    let tableBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect if line looks like a table row: starts/ends with | or has multiple |
        // We look ahead for the separator line (|---|) to confirm start of table
        const looksLikeTable = line.includes('|');
        
        if (inTable) {
            if (looksLikeTable) {
                tableBuffer.push(line);
            } else {
                // End of table
                nodes.push(renderTable(tableBuffer, `table-${i}`));
                inTable = false;
                tableBuffer = [];
                // Process current line normally if it's not empty
                if (line) nodes.push(renderLine(lines[i], i)); // Use original line for indentation preservation
            }
        } else {
            // Check for start of table
            if (looksLikeTable && i + 1 < lines.length) {
                const nextLine = lines[i+1].trim();
                // Valid separator usually looks like |---| or |:---|
                if (nextLine.includes('---') && nextLine.includes('|')) {
                    inTable = true;
                    tableBuffer.push(line);
                    continue; 
                }
            }
            // Not a table, render normal line
            nodes.push(renderLine(lines[i], i));
        }
    }

    // Flush remaining table if message ends with table
    if (inTable) {
        nodes.push(renderTable(tableBuffer, `table-end`));
    }

    return nodes;
  };

  return (
    <div className={`flex w-full mb-8 animate-fade-in group ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
          isUser 
            ? 'bg-white border border-slate-100' 
            : 'bg-gradient-to-br from-medical-500 to-medical-600 text-white shadow-medical-500/20'
        }`}>
          {isUser ? (
             <i className="fa-solid fa-user text-slate-400 text-sm"></i>
          ) : (
             <i className="fa-solid fa-staff-snake text-sm"></i>
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          <div className={`py-4 px-6 text-[15px] shadow-sm transition-all ${
            isUser 
              ? 'bg-slate-800 text-slate-50 rounded-2xl rounded-tr-sm shadow-md' 
              : 'bg-white border border-slate-100 text-slate-600 rounded-2xl rounded-tl-sm w-full shadow-sm'
          }`}>
            
            {/* Attachment Preview */}
            {message.attachment && (
              <div className="mb-4 rounded-xl overflow-hidden border border-white/20 inline-block bg-black/5">
                <img 
                  src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                  alt="User attachment" 
                  className="max-h-64 w-auto object-contain"
                />
              </div>
            )}

            {/* Text Content */}
            <div className={`font-sans ${isUser ? 'text-slate-100' : ''}`}>
              {isUser ? parseBold(message.text) : renderContent(message.text)}
            </div>

          </div>
          
          {/* Footer Actions */}
          {!isUser && !message.isError && (
             <div className="flex gap-4 mt-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="text-slate-400 hover:text-medical-600 text-[11px] font-medium transition-colors flex items-center gap-1.5">
                    <i className="fa-regular fa-thumbs-up"></i> Helpful
                </button>
                <button 
                    className="text-slate-400 hover:text-medical-600 text-[11px] font-medium transition-colors flex items-center gap-1.5"
                    onClick={() => navigator.clipboard.writeText(message.text)}
                >
                    <i className="fa-regular fa-copy"></i> Copy Analysis
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};