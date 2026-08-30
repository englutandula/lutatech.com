import React from 'react';
import PdfReorderPagesTool from '@/components/PdfReorderPagesTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'Reorder PDF Pages | Luta Tech',
  description: 'Change the order of pages in your PDF using drag-and-drop. 100% private, free, and in-browser.',
};

export default function PdfReorderPagesPage() {
  const tool = getTool('pdf-reorder-pages')!;

  return (
    <ToolPageShell tool={tool}>
      <PdfReorderPagesTool />
    </ToolPageShell>
  );
}
