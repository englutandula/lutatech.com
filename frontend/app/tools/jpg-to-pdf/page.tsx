import React from 'react';
import ImagesToPdfTool from '@/components/ImagesToPdfTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'JPG to PDF | Luta Tech',
  description: 'Combine multiple JPG images into a single PDF document. 100% private, free, and in-browser.',
};

export default function JpgToPdfPage() {
  const tool = getTool('jpg-to-pdf')!;
  return (
    <ToolPageShell tool={tool}>
      <ImagesToPdfTool accept="image/jpeg,.jpg,.jpeg" formatLabel="JPG" />
    </ToolPageShell>
  );
}
