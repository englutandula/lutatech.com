import React from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  Camera,
  Scissors,
  Files,
  Minimize2,
  FileOutput,
  QrCode,
  Type,
  Braces,
  Palette,
  Scaling,
  Volume2,
  Binary,
  Image,
  FileText,
  FileType,
  Repeat,
  Zap,
  Wrench,
  Code2,
  Sparkles,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Camera,
  Scissors,
  Files,
  Minimize2,
  FileOutput,
  QrCode,
  Type,
  Braces,
  Palette,
  Scaling,
  Volume2,
  Binary,
  Image,
  FileText,
  FileType,
  Repeat,
  Zap,
  Wrench,
  Code2,
  Sparkles,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Sparkles;
  return <Icon className={className} />;
}

export default ToolIcon;
