import React from "react";

export function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";

  let currentParagraphLines: string[] = [];

  // Helper to parse inline styles (bold, italic, inline code, links)
  const parseInline = (lineText: string): React.ReactNode => {
    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex matching bold, italic, code, links
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(lineText)) !== null) {
      const matchIndex = match.index;

      // Add plain text before match
      if (matchIndex > lastIndex) {
        tokens.push(lineText.substring(lastIndex, matchIndex));
      }

      if (match[1]) {
        tokens.push(<strong key={matchIndex} className="font-extrabold text-neutral-900 dark:text-neutral-50">{match[2]}</strong>);
      } else if (match[3]) {
        tokens.push(<em key={matchIndex} className="italic text-neutral-800 dark:text-neutral-200">{match[4]}</em>);
      } else if (match[5]) {
        tokens.push(<code key={matchIndex} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 rounded text-xs font-mono text-pink-600 dark:text-pink-400">{match[5]}</code>);
      } else if (match[6]) {
        tokens.push(
          <a key={matchIndex} href={match[7]} target="_blank" rel="noopener noreferrer" className="text-[#A3D14B] hover:underline font-bold">
            {match[6]}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < lineText.length) {
      tokens.push(lineText.substring(lastIndex));
    }

    return <>{tokens}</>;
  };

  const flushParagraph = (key: string) => {
    if (currentParagraphLines.length > 0) {
      const parsedLines = currentParagraphLines.map((line, idx) => (
        <span key={idx}>
          {idx > 0 && <br />}
          {parseInline(line)}
        </span>
      ));
      elements.push(
        <p key={key} className="text-sm md:text-base text-neutral-600 dark:text-neutral-450 leading-relaxed my-3 font-medium">
          {parsedLines}
        </p>
      );
      currentParagraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      flushParagraph(`p-${i}`);
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="p-4 my-4 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto text-xs font-mono border border-white/5">
            <code className={codeBlockLang ? `language-${codeBlockLang}` : ""}>
              {codeBlockLines.join("\n")}
            </code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        codeBlockLang = line.trim().substring(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Unordered list item
    const listMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (listMatch) {
      flushParagraph(`p-${i}`);
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-sm md:text-base text-neutral-600 dark:text-neutral-450 mb-1 font-medium">
          {parseInline(listMatch[2])}
        </li>
      );
      continue;
    } else if (inList) {
      elements.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1">
          {listItems}
        </ul>
      );
      inList = false;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      flushParagraph(`p-${i}`);
      const level = headerMatch[1].length;
      const content = parseInline(headerMatch[2]);
      const baseClass = "font-black tracking-tight text-neutral-900 dark:text-neutral-50 mt-6 mb-3";

      if (level === 1) {
        elements.push(<h1 key={`h-${i}`} className={`text-2xl ${baseClass}`}>{content}</h1>);
      } else if (level === 2) {
        elements.push(<h2 key={`h-${i}`} className={`text-xl ${baseClass}`}>{content}</h2>);
      } else if (level === 3) {
        elements.push(<h3 key={`h-${i}`} className={`text-lg ${baseClass}`}>{content}</h3>);
      } else {
        elements.push(<h4 key={`h-${i}`} className={`text-base ${baseClass}`}>{content}</h4>);
      }
      continue;
    }

    // Blockquote
    const quoteMatch = line.match(/^>\s+(.*)/);
    if (quoteMatch) {
      flushParagraph(`p-${i}`);
      elements.push(
        <blockquote key={`q-${i}`} className="pl-4 border-l-4 border-neutral-300 dark:border-neutral-700 italic text-neutral-500 my-4">
          {parseInline(quoteMatch[1])}
        </blockquote>
      );
      continue;
    }

    // Empty line (paragraph break)
    if (line.trim() === "") {
      flushParagraph(`p-${i}`);
      continue;
    }

    // Normal paragraph line
    currentParagraphLines.push(line);
  }

  // Flush remaining elements
  flushParagraph("p-final");
  if (inList) {
    elements.push(
      <ul key="ul-end" className="my-3 space-y-1">
        {listItems}
      </ul>
    );
  }
  if (inCodeBlock) {
    elements.push(
      <pre key="code-end" className="p-4 my-4 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto text-xs font-mono border border-white/5">
        <code>{codeBlockLines.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}
