import type { ReactNode } from "react";

/**
 * A tiny, safe Markdown subset renderer. It builds React nodes directly (never
 * dangerouslySetInnerHTML), so user content can't inject HTML or scripts. Link
 * hrefs are restricted to http/https/mailto. Supports bold, italic,
 * strikethrough, inline code, links, headings, lists and blockquotes.
 */

function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}

const INLINE_RE =
  /(\*\*([^*]+)\*\*|__([^_]+)__|~~([^~]+)~~|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE_RE.lastIndex = 0;

  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-${i++}`;
    if (match[2] !== undefined) nodes.push(<strong key={key}>{match[2]}</strong>);
    else if (match[3] !== undefined) nodes.push(<strong key={key}>{match[3]}</strong>);
    else if (match[4] !== undefined) nodes.push(<s key={key}>{match[4]}</s>);
    else if (match[5] !== undefined) nodes.push(<em key={key}>{match[5]}</em>);
    else if (match[6] !== undefined) nodes.push(<em key={key}>{match[6]}</em>);
    else if (match[7] !== undefined)
      nodes.push(
        <code key={key} className="vy-code">
          {match[7]}
        </code>,
      );
    else if (match[8] !== undefined && match[9] !== undefined) {
      const href = safeHref(match[9]);
      nodes.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow ugc">
            {match[8]}
          </a>
        ) : (
          <span key={key}>{match[8]}</span>
        ),
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Inline-only render (single-line contexts like a bio). */
export function renderInlineMarkdown(text: string): ReactNode {
  const lines = text.split(/\r?\n/);
  return lines.map((line, i) => (
    <span key={i}>
      {renderInline(line, `l${i}`)}
      {i < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

/** Block render (headings, lists, blockquotes, paragraphs). */
export function renderMarkdown(text: string): ReactNode {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let list: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (list) {
      const items = list;
      blocks.push(
        <ul key={`ul${key++}`} className="vy-md-ul">
          {items.map((it, i) => (
            <li key={i}>{renderInline(it, `li${key}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      (list ??= []).push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }
    flushList();
    if (!line.trim()) continue;
    if (/^###\s+/.test(line)) blocks.push(<h3 key={key++}>{renderInline(line.slice(4), `h${key}`)}</h3>);
    else if (/^##\s+/.test(line)) blocks.push(<h2 key={key++}>{renderInline(line.slice(3), `h${key}`)}</h2>);
    else if (/^#\s+/.test(line)) blocks.push(<h1 key={key++}>{renderInline(line.slice(2), `h${key}`)}</h1>);
    else if (/^>\s+/.test(line))
      blocks.push(<blockquote key={key++}>{renderInline(line.slice(2), `q${key}`)}</blockquote>);
    else blocks.push(<p key={key++}>{renderInline(line, `p${key}`)}</p>);
  }
  flushList();
  return blocks;
}
