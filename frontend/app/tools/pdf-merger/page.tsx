import React from 'react';
import PdfMergerTool from '@/components/PdfMergerTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'PDF Merger | Luta Tech',
  description: 'Combine multiple PDF files into one document in seconds. 100% private, free, and in-browser.',
};

export default function PdfMergerPage() {
  const tool = getTool('pdf-merger')!;

  return (
    <ToolPageShell tool={tool}>
      <PdfMergerTool />
    </ToolPageShell>
  );
}
