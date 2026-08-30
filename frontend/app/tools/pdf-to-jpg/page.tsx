import React from 'react';
import PdfToImageTool from '@/components/PdfToImageTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'PDF to JPG | Luta Tech',
  description: 'Convert every page of your PDF to high-quality JPG images. 100% private, free, and in-browser.',
};

export default function PdfToJpgPage() {
  const tool = getTool('pdf-to-jpg')!;
  return (
    <ToolPageShell tool={tool}>
      <PdfToImageTool format="jpeg" />
    </ToolPageShell>
  );
}
