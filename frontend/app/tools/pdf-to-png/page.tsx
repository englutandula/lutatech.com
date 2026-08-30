import React from 'react';
import PdfToImageTool from '@/components/PdfToImageTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'PDF to PNG | Luta Tech',
  description: 'Convert every page of your PDF to lossless PNG images. 100% private, free, and in-browser.',
};

export default function PdfToPngPage() {
  const tool = getTool('pdf-to-png')!;
  return (
    <ToolPageShell tool={tool}>
      <PdfToImageTool format="png" />
    </ToolPageShell>
  );
}
