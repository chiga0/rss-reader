/**
 * Feed discovery utility
 * Autodiscovers RSS/Atom feeds from a website URL by parsing <link rel="alternate"> tags.
 */

export async function discoverFeeds(websiteUrl: string): Promise<{ url: string; title: string }[]> {
  try {
    const response = await fetch(websiteUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const linkEls = doc.querySelectorAll(
      'link[rel="alternate"][type="application/rss+xml"], link[rel="alternate"][type="application/atom+xml"]',
    );
    const results: { url: string; title: string }[] = [];
    linkEls.forEach((el) => {
      const href = el.getAttribute('href');
      if (!href) return;
      const title = el.getAttribute('title') || href;
      try {
        const url = new URL(href, websiteUrl).href;
        results.push({ url, title });
      } catch {
        // skip invalid URLs
      }
    });
    return results;
  } catch {
    return [];
  }
}
