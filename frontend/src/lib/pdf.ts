import { PDFDocument, degrees } from 'pdf-lib';

export interface PdfFileInfo {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnailUrl?: string;
  rotation?: number; // 0, 90, 180, 270
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function renderPdfThumbnail(file: File): Promise<string | undefined> {
  try {
    if (typeof window === 'undefined') return undefined;
    const pdfjs = await import('pdfjs-dist');
    // Configure worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale: 0.6 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await (page.render as any)({
        canvasContext: ctx,
        viewport,
        canvas,
      }).promise;
      return canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (e) {
    console.warn('PDF thumbnail generation note:', e);
  }
  return undefined;
}

export async function inspectPdfFile(file: File): Promise<PdfFileInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  // Try to generate visual thumbnail preview
  let thumbnailUrl: string | undefined = undefined;
  try {
    thumbnailUrl = await renderPdfThumbnail(file);
  } catch {
    // Graceful fallback
  }

  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 7)}`,
    file,
    name: file.name,
    size: file.size,
    pageCount,
    thumbnailUrl,
    rotation: 0,
  };
}

export async function mergePdfFiles(
  pdfFiles: PdfFileInfo[],
  onProgress?: (progress: number) => void,
  customFileName?: string
): Promise<{ blob: Blob; totalPages: number; fileName: string; size: number }> {
  if (pdfFiles.length === 0) {
    throw new Error('Please select at least one PDF file to merge.');
  }

  const mergedPdf = await PDFDocument.create();
  let totalCopiedPages = 0;

  for (let i = 0; i < pdfFiles.length; i++) {
    const item = pdfFiles[i];
    const arrayBuffer = await item.file.arrayBuffer();
    const donorPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());

    copiedPages.forEach((page) => {
      if (item.rotation && item.rotation !== 0) {
        page.setRotation(degrees((page.getRotation().angle + item.rotation) % 360));
      }
      mergedPdf.addPage(page);
      totalCopiedPages++;
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pdfFiles.length) * 90));
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  if (onProgress) onProgress(100);

  const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
  
  const trimmed = customFileName?.trim();
  const fileName = trimmed ? `${trimmed.replace(/\.pdf$/i, '')}.pdf` : 'merged by LutaTech.pdf';

  return {
    blob,
    totalPages: totalCopiedPages,
    fileName,
    size: blob.size,
  };
}
