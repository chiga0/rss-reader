/**
 * OPMLImportDialog Component  
 * File input and progress indicator for OPML import
 */

import { useState, useRef } from 'react';
import { importFromOPML } from '@services/opmlService';
import { logger } from '@lib/logger';
import { useStore } from '@hooks/useStore';
import { useToast } from '@hooks/useToast';

export function OPMLImportDialog() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadFeeds } = useStore();
  const { addToast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);
    setProgress({ current: 0, total: 0 });

    try {
      const content = await file.text();
      
      const importResult = await importFromOPML(content, (current, total) => {
        setProgress({ current, total });
      });
      
      setResult(importResult);
      logger.info('OPML import completed', importResult);
      
      // Reload feeds in store to show newly imported feeds
      if (importResult.imported > 0) {
        await loadFeeds();
        addToast(
          `Successfully imported ${importResult.imported} feed${importResult.imported !== 1 ? 's' : ''}`,
          'success'
        );
      } else if (importResult.errors.length > 0) {
        addToast('Import completed with errors. No feeds were added.', 'error');
      }
    } catch (error) {
      logger.error('Failed to import OPML', error instanceof Error ? error : undefined);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({ imported: 0, failed: 0, errors: [errMsg] });
      addToast(`Import failed: ${errMsg}`, 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="opml-file-input" className="sr-only">选择OPML文件</label>
        <input
          id="opml-file-input"
          ref={fileInputRef}
          type="file"
          accept=".opml,.xml"
          onChange={handleFileSelect}
          disabled={isImporting}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
        />
      </div>

      {isImporting && progress.total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Importing feeds...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <div className={`rounded-lg p-4 ${
          result.errors.length > 0 
            ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
            : 'bg-green-500/10 text-green-700 dark:text-green-300'
        }`}>
          <p className="font-medium">
            Import completed: {result.imported} successful, {result.failed} failed
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {result.errors.slice(0, 5).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
              {result.errors.length > 5 && (
                <li>...and {result.errors.length - 5} more errors</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
