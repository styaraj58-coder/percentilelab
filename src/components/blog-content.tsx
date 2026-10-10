import Link from "next/link";
import type { ReactNode } from "react";

// Renders a blog post's light-markdown body as React elements (never as raw
// HTML), so admin-authored text can't inject markup. Supported syntax:
//   ## Heading / ### Subheading
//   - bullet item (consecutive lines form one list)
//   1. numbered item (consecutive lines form one list)
//   | a | b |  then  |---|---|  then rows: a table
//   ![alt text](https://image-url)   (on its own line)
//   **bold**, *italic*, [link text](https://url) inside any text
//   [link text](/courses) links to a page on this site (opens in the same tab)
// Blank lines separate blocks.

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\((?:https?:\/\/[^)\s]+|\/(?!\/)[^)\s]*)\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_PATTERN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/(?!\/))[^)\s]*)\)$/);
    if (link) {
      const linkClass =
        "font-medium text-brand-navy underline decoration-brand-gold underline-offset-2 hover:text-brand-gold";
      if (link[2].startsWith("/")) {
        return (
          <Link key={i} href={link[2]} className={linkClass}>
            {link[1]}
          </Link>
        );
      }
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function splitBlocks(content: string) {
  return content.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
}

function headingSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
}

// Every "## " heading with a unique anchor id - used to render the headings
// and to build the table of contents on the post page.
export function extractHeadings(content: string) {
  const seen = new Map<string, number>();
  return splitBlocks(content)
    .filter((block) => block.startsWith("## "))
    .map((block) => {
      const text = block.slice(3).replace(/\*/g, "").trim();
      const base = headingSlug(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return { id: count === 0 ? base : `${base}-${count + 1}`, text };
    });
}

export function BlogContent({ content }: { content: string }) {
  const blocks = splitBlocks(content);
  const headings = extractHeadings(content);
  let headingIndex = 0;

  return (
    <div className="space-y-5 leading-relaxed text-brand-ink/85">
      {blocks.map((block, i) => {
        const lines = block.split("\n");

        if (lines.every((l) => /^[-*] /.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-2 pl-6">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          );
        }

        // Markdown table: a header row, a |---|---| separator row, then rows.
        if (
          lines.length >= 3 &&
          lines.every((l) => l.trim().startsWith("|")) &&
          /^\|[\s:|-]+\|?$/.test(lines[1].trim()) &&
          lines[1].includes("-")
        ) {
          const cells = (line: string) =>
            line
              .trim()
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split("|")
              .map((c) => c.trim());
          const header = cells(lines[0]);
          const rows = lines.slice(2).map(cells);
          return (
            <div key={i} className="overflow-x-auto rounded-xl border border-black/10">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-brand-cream text-brand-navy">
                  <tr>
                    {header.map((h, j) => (
                      <th key={j} className="border-b border-black/10 px-4 py-3 font-semibold">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, r) => (
                    <tr key={r} className="border-b border-black/5 last:border-0 align-top">
                      {row.map((c, j) => (
                        <td
                          key={j}
                          className={`px-4 py-3 ${j === 0 ? "font-semibold text-brand-navy" : "text-brand-ink/80"}`}
                        >
                          {renderInline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        const image = block.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
        if (image) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={image[2]}
              alt={image[1]}
              className="mx-auto max-h-[28rem] w-auto max-w-full rounded-xl border border-black/5"
            />
          );
        }

        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="pt-2 text-lg font-semibold text-brand-navy">
              {renderInline(block.slice(4))}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          const id = headings[headingIndex++]?.id;
          return (
            <h2
              key={i}
              id={id}
              className="scroll-mt-24 pt-3 text-2xl font-bold text-brand-navy"
            >
              {renderInline(block.slice(3))}
            </h2>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}
