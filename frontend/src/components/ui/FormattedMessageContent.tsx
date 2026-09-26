import React from 'react';

interface FormattedMessageContentProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

/**
 * Parses inline markdown:
 * - Links: [text](url)
 * - Bold + Italic: ***text***
 * - Bold: **text**
 * - Italic: *text*
 * - Inline code: `code`
 */
function renderInlineFormatting(text: string, isUser = false, keyPrefix = ''): React.ReactNode[] {
  if (!text) return [];

  // Match: [text](url), ***bold-italic***, **bold**, *italic*, `code`
  const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|\*\*\*(?:[^\n*]|\*(?!\*\*))+\*\*\*|\*\*(?:[^\n*]|\*(?!\*))+\*\*|\*[^\n*]+?\*|`[^`\n]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (!part) return null;

    // Link: [text](url)
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C1443B] font-semibold underline underline-offset-2 hover:text-[#9F3129] transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    // Bold + Italic: ***text***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong
          key={key}
          className={`font-bold italic ${isUser ? 'text-[#8F6343]' : 'text-[#12213B] font-heading tracking-tight'}`}
        >
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong
          key={key}
          className={`font-bold ${isUser ? 'text-[#8F6343]' : 'text-[#12213B] font-heading tracking-tight'}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={key} className="italic text-dusk-700">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md font-mono text-[11px] bg-[#FAF5EE] border border-[#E5DFD5] text-[#C1443B]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

/**
 * FormattedMessageContent
 * Converts markdown output from Gemini (like **bold words**, lists, and headings)
 * into semantic, styled HTML elements without showing raw asterisks or markdown syntax.
 */
export const FormattedMessageContent: React.FC<FormattedMessageContentProps> = ({
  content,
  isUser = false,
  className = '',
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Horizontal line
    if (/^---+$|^___+$/.test(trimmed)) {
      elements.push(
        <hr key={`hr-${lineIdx}`} className="border-t border-[#E5DFD5] my-2.5 opacity-80" />
      );
      return;
    }

    // Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];

      if (level <= 2) {
        elements.push(
          <h3
            key={`h-${lineIdx}`}
            className={`font-heading font-extrabold text-sm sm:text-base mt-3 mb-1.5 ${
              isUser ? 'text-[#8F6343]' : 'text-ink'
            }`}
          >
            {renderInlineFormatting(headingText, isUser, `h-${lineIdx}`)}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h-${lineIdx}`}
            className={`font-heading font-bold text-xs sm:text-sm mt-2.5 mb-1 ${
              isUser ? 'text-[#8F6343]' : 'text-ink'
            }`}
          >
            {renderInlineFormatting(headingText, isUser, `h-${lineIdx}`)}
          </h4>
        );
      }
      return;
    }

    // Bullet points (•, -, *)
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
      const indent = line.search(/\S/);
      const isIndented = indent >= 2;

      elements.push(
        <div
          key={`bullet-${lineIdx}`}
          className={`flex items-start gap-2 my-1 ${isIndented ? 'pl-5' : 'pl-1'}`}
        >
          <span className="text-[#C1443B] font-bold text-sm select-none leading-relaxed">•</span>
          <div className="flex-1 leading-relaxed">
            {renderInlineFormatting(bulletText, isUser, `bullet-${lineIdx}`)}
          </div>
        </div>
      );
      return;
    }

    // Numbered lists (1. , 1) , 2. )
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const itemText = numberedMatch[2];
      const indent = line.search(/\S/);
      const isIndented = indent >= 2;

      elements.push(
        <div
          key={`num-${lineIdx}`}
          className={`flex items-start gap-2 my-1 ${isIndented ? 'pl-5' : 'pl-1'}`}
        >
          <span className="font-mono font-bold text-xs text-[#C1443B] min-w-[1.3rem] pt-0.5 select-none">
            {num}.
          </span>
          <div className="flex-1 leading-relaxed">
            {renderInlineFormatting(itemText, isUser, `num-${lineIdx}`)}
          </div>
        </div>
      );
      return;
    }

    // Empty line (paragraph break)
    if (!trimmed) {
      elements.push(<div key={`empty-${lineIdx}`} className="h-2" />);
      return;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${lineIdx}`} className="leading-relaxed my-0.5">
        {renderInlineFormatting(line, isUser, `p-${lineIdx}`)}
      </p>
    );
  });

  return (
    <div className={`text-xs sm:text-sm leading-relaxed ${className}`}>
      {elements}
    </div>
  );
};
