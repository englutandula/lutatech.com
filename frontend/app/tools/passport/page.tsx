import React from 'react';
import PhotoTool from '@/components/PhotoTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'Passport Photo Maker | Luta Tech',
  description: 'Create compliant passport photos online in seconds. Free AI background removal and auto-cropping.',
};

export default function PassportToolPage() {
  const tool = getTool('passport-photo-maker')!;

  return (
    <ToolPageShell tool={tool}>
      <PhotoTool />
    </ToolPageShell>
  );
}
