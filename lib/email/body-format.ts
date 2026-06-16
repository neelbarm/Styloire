/**
 * Email bodies are authored in a rich-text editor (HTML) going forward, but
 * older requests stored a plain-text body. These helpers normalize whatever is
 * stored into both an HTML version (for the html part) and a plain-text version
 * (for the text/plain fallback part), so every provider can send both.
 */

function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Produce the HTML body. Legacy plain text is escaped and newline-converted. */
export function bodyToHtml(rendered: string): string {
  if (looksLikeHtml(rendered)) return rendered;
  return escapeHtml(rendered).replace(/\r?\n/g, "<br>");
}

/** Produce a plain-text fallback. HTML is crudely stripped to readable text. */
export function bodyToPlainText(rendered: string): string {
  if (!looksLikeHtml(rendered)) return rendered;
  return rendered
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
