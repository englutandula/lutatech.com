import React from 'react';
import PdfOrganizerTool from '@/components/PdfOrganizerTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'PDF Page Organizer | Luta Tech',
  description: 'The ultimate PDF tool: reorder, delete, rotate, and duplicate pages visually. 100% private, free, and in-browser.',
};

export default function PdfOrganizerPage() {
  const tool = getTool('pdf-organizer')!;

  return (
    <ToolPageShell tool={tool}>
      <PdfOrganizerTool />
    </ToolPageShell>
  );
}
