import React from 'react';
import PdfToImageTool from '@/components/PdfToImageTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'PDF to WebP | Luta Tech',
  description: 'Convert every page of your PDF to modern WebP images. 100% private, free, and in-browser.',
};

export default function PdfToWebpPage() {
  const tool = getTool('pdf-to-webp')!;
  return (
    <ToolPageShell tool={tool}>
      <PdfToImageTool format="webp" />
    </ToolPageShell>
  );
}
