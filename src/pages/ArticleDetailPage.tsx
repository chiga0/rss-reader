/**
 * Article Detail Page - Full article view
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { useLoaderData } from 'react-router-dom';
import type { Feed, Article } from '@/models';

interface ArticleDetailLoaderData {
  article: Article;
  feed: Feed;
}

export function ArticleDetailPage() {
  const { article, feed } = useLoaderData() as ArticleDetailLoaderData;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">{feed.title}</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        {article.author && <span>By {article.author}</span>}
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
      </div>
      
      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-auto rounded-lg mb-6"
        />
      )}
      
      <div className="prose dark:prose-invert max-w-none">
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <p>{article.summary}</p>
        )}
      </div>
      
      <div className="mt-8 pt-4 border-t">
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Read original article →
        </a>
      </div>
    </div>
  );
}
