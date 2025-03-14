// memoized-markdown.tsx
"use client";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  return markdown.split(/\n\n+/).filter((block) => block.trim()); // Split by double newlines, filter empty blocks
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-base mb-4">{children}</p>
          ),
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-2 py-1 bg-neutral-800 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-4 my-4 bg-neutral-800 rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-base">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <table className="border-collapse border border-neutral-700 my-4 w-full">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-neutral-700 p-2 bg-neutral-800">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-neutral-700 p-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </div>
    );
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
