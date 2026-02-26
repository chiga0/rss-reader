/**
 * OPMLExportButton Component
 * Button to export feeds to OPML file
 */

import { useState } from 'react';
import { exportToOPML } from '@services/opmlService';
import { logger } from '@lib/logger';

export function OPMLExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const opml = await exportToOPML();
      
      // Create download link
      const blob = new Blob([opml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rss-subscriptions-${new Date().toISOString().split('T')[0]}.opml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      logger.info('OPML exported successfully');
    } catch (error) {
      logger.error('Failed to export OPML', error instanceof Error ? error : undefined);
      alert('Failed to export feeds. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {isExporting ? 'Exporting...' : 'Export OPML'}
    </button>
  );
}
