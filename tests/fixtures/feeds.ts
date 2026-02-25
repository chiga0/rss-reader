/**
 * Test fixtures for RSS/Atom feeds
 * Sample feeds for testing parser functionality
 */

export const RSS2_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sample RSS Feed</title>
    <link>https://example.com</link>
    <description>A sample RSS 2.0 feed for testing</description>
    <language>en-us</language>
    <lastBuildDate>Sat, 25 Jan 2026 12:00:00 GMT</lastBuildDate>
    <image>
      <url>https://example.com/icon.png</url>
      <title>Sample RSS Feed</title>
      <link>https://example.com</link>
    </image>
    
    <item>
      <title>First Article</title>
      <link>https://example.com/article-1</link>
      <description>This is the first article description</description>
      <author>john@example.com (John Doe)</author>
      <pubDate>Sat, 25 Jan 2026 10:00:00 GMT</pubDate>
      <guid>https://example.com/article-1</guid>
    </item>
    
    <item>
      <title>Second Article</title>
      <link>https://example.com/article-2</link>
      <description>&lt;p&gt;HTML content in description&lt;/p&gt;</description>
      <pubDate>Fri, 24 Jan 2026 15:30:00 GMT</pubDate>
      <enclosure url="https://example.com/image.jpg" type="image/jpeg" length="12345"/>
      <guid>https://example.com/article-2</guid>
    </item>
  </channel>
</rss>`;

export const ATOM_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Sample Atom Feed</title>
  <link href="https://example.com" rel="alternate"/>
  <link href="https://example.com/feed.xml" rel="self"/>
  <updated>2026-01-25T12:00:00Z</updated>
  <id>https://example.com/feed</id>
  <subtitle>A sample Atom 1.0 feed for testing</subtitle>
  <icon>https://example.com/icon.png</icon>
  
  <entry>
    <title>Atom Article One</title>
    <link href="https://example.com/atom-1" rel="alternate"/>
    <id>https://example.com/atom-1</id>
    <updated>2026-01-25T10:00:00Z</updated>
    <published>2026-01-25T10:00:00Z</published>
    <summary>Summary of the first Atom article</summary>
    <content type="html">&lt;p&gt;Full HTML content here&lt;/p&gt;</content>
    <author>
      <name>Jane Smith</name>
    </author>
  </entry>
  
  <entry>
    <title>Atom Article Two</title>
    <link href="https://example.com/atom-2" rel="alternate"/>
    <id>https://example.com/atom-2</id>
    <updated>2026-01-24T15:30:00Z</updated>
    <published>2026-01-24T15:30:00Z</published>
    <summary>Second article summary</summary>
    <content type="html">&lt;p&gt;Content with &lt;strong&gt;formatting&lt;/strong&gt;&lt;/p&gt;</content>
  </entry>
</feed>`;

export const INVALID_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Invalid Feed</title>
    <unclosed-tag>
  </channel>
</rss>`;

export const NOT_A_FEED = `<!DOCTYPE html>
<html>
<head><title>Not a feed</title></head>
<body><h1>This is an HTML page, not an RSS feed</h1></body>
</html>`;

export const RSS_WITH_CONTENT_ENCODED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Feed with Content Module</title>
    <link>https://example.com</link>
    <description>Testing content:encoded</description>
    
    <item>
      <title>Article with Full Content</title>
      <link>https://example.com/full-content</link>
      <description>Short description</description>
      <content:encoded><![CDATA[
        <p>This is the full article content with <strong>HTML formatting</strong>.</p>
        <img src="https://example.com/inline-image.jpg" alt="Inline image"/>
        <p>Multiple paragraphs are supported.</p>
      ]]></content:encoded>
      <pubDate>Sat, 25 Jan 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

export const ATOM_WITH_MEDIA = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Feed with Media</title>
  <link href="https://example.com" rel="alternate"/>
  <updated>2026-01-25T12:00:00Z</updated>
  <id>https://example.com/media-feed</id>
  
  <entry>
    <title>Article with Media</title>
    <link href="https://example.com/media-article" rel="alternate"/>
    <id>https://example.com/media-article</id>
    <updated>2026-01-25T10:00:00Z</updated>
    <summary>Article with media content</summary>
    <media:content url="https://example.com/featured-image.jpg" medium="image" />
  </entry>
</feed>`;

export const EMPTY_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty Feed</title>
    <link>https://example.com</link>
    <description>Feed with no items</description>
  </channel>
</rss>`;

export const ATOM_WITH_XHTML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Feed with XHTML Content</title>
  <link href="https://example.com" rel="alternate"/>
  <updated>2026-01-25T12:00:00Z</updated>
  <id>https://example.com/xhtml-feed</id>
  
  <entry>
    <title>XHTML Article</title>
    <link href="https://example.com/xhtml-article" rel="alternate"/>
    <id>https://example.com/xhtml-article</id>
    <updated>2026-01-25T10:00:00Z</updated>
    <summary>A short summary</summary>
    <content type="xhtml">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <p>This is a <strong>full article</strong> with XHTML content.</p>
        <p>It has multiple paragraphs and <a href="https://example.com">links</a>.</p>
      </div>
    </content>
  </entry>
</feed>`;

export const OPML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>My Feeds</title>
    <dateCreated>Sat, 25 Jan 2026 12:00:00 GMT</dateCreated>
  </head>
  <body>
    <outline text="Technology" title="Technology">
      <outline type="rss" text="Tech Blog" title="Tech Blog" xmlUrl="https://example.com/tech/feed.xml" htmlUrl="https://example.com/tech"/>
      <outline type="rss" text="Dev News" title="Dev News" xmlUrl="https://example.com/dev/feed.xml" htmlUrl="https://example.com/dev"/>
    </outline>
    <outline text="Science" title="Science">
      <outline type="rss" text="Science Daily" title="Science Daily" xmlUrl="https://example.com/science/feed.xml" htmlUrl="https://example.com/science"/>
    </outline>
    <outline type="rss" text="Uncategorized Feed" title="Uncategorized Feed" xmlUrl="https://example.com/misc/feed.xml" htmlUrl="https://example.com/misc"/>
  </body>
</opml>`;

export const OPML_INVALID = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Invalid OPML</title>
  </head>
  <body>
    <outline text="Missing xmlUrl" title="Bad Feed"/>
  </body>
</opml>`;
