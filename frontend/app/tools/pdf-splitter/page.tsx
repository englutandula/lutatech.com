import React from 'react';
import PdfSplitterTool from '@/components/PdfSplitterTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'PDF Splitter | Luta Tech',
  description: 'Split a PDF into individual pages or custom page ranges. 100% private, runs in-browser.',
};

export default function PdfSplitterPage() {
  const tool = getTool('pdf-splitter')!;

  return (
    <ToolPageShell tool={tool}>
      <PdfSplitterTool />
    </ToolPageShell>
  );
}
