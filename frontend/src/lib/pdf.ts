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

export interface PdfPageThumbnail {
  pageIndex: number; // 0-indexed
  thumbnailUrl: string;
}

export interface PdfPageItem {
  id: string; // unique ID for React rendering and drag & drop
  fileId: string;
  file: File;
  fileName: string;
  sourceIndex: number; // 0-indexed page in original file
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270 degrees
}

export async function renderAllPageThumbnails(file: File, scale = 0.4, onProgress?: (progress: number) => void): Promise<PdfPageThumbnail[]> {
  try {
    if (typeof window === 'undefined') return [];
    const pdfjs = await import('pdfjs-dist');
    // Configure worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;
    const thumbnails: PdfPageThumbnail[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });
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
        thumbnails.push({
          pageIndex: i - 1,
          thumbnailUrl: canvas.toDataURL('image/jpeg', 0.85)
        });
      }
      if (onProgress) {
         onProgress(Math.round((i / totalPages) * 100));
      }
    }
    return thumbnails;
  } catch (e) {
    console.warn('PDF thumbnail generation error:', e);
    throw e;
  }
}

export async function loadPagesFromPdf(
  file: File,
  scale = 0.35,
  onProgress?: (progress: number) => void
): Promise<PdfPageItem[]> {
  const fileId = `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 7)}`;
  const thumbnails = await renderAllPageThumbnails(file, scale, onProgress);
  return thumbnails.map((t) => ({
    id: `${fileId}-p${t.pageIndex}-${Math.random().toString(36).substring(2, 7)}`,
    fileId,
    file,
    fileName: file.name,
    sourceIndex: t.pageIndex,
    thumbnailUrl: t.thumbnailUrl,
    rotation: 0,
  }));
}

export async function exportOrganizedPdf(
  pages: { file: File; sourceIndex: number; rotation?: number }[],
  customFileName?: string,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; fileName: string; size: number }> {
  if (pages.length === 0) {
    throw new Error('Please include at least one page in your PDF document.');
  }

  const newPdf = await PDFDocument.create();

  // Cache loaded source documents by File reference to avoid re-parsing
  const fileDocCache = new Map<File, PDFDocument>();

  for (let i = 0; i < pages.length; i++) {
    const item = pages[i];
    let srcDoc = fileDocCache.get(item.file);
    if (!srcDoc) {
      const arrayBuffer = await item.file.arrayBuffer();
      srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      fileDocCache.set(item.file, srcDoc);
    }

    const [copiedPage] = await newPdf.copyPages(srcDoc, [item.sourceIndex]);
    const rot = item.rotation || 0;
    if (rot !== 0) {
      copiedPage.setRotation(degrees((copiedPage.getRotation().angle + rot) % 360));
    }
    newPdf.addPage(copiedPage);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pages.length) * 90));
    }
  }

  const pdfBytes = await newPdf.save();
  if (onProgress) onProgress(100);

  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  
  const baseName = pages[0]?.file.name.replace(/\.pdf$/i, '') || 'document';
  const fileName = customFileName?.trim()
    ? `${customFileName.trim().replace(/\.pdf$/i, '')}.pdf`
    : `${baseName}-organized.pdf`;

  return { blob, fileName, size: blob.size };
}

export async function extractPages(file: File, pageIndices: number[], customFileName?: string): Promise<{ blob: Blob; fileName: string; size: number }> {
  if (pageIndices.length === 0) {
    throw new Error('Please select at least one page to extract.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  
  const originalName = file.name.replace(/\.pdf$/i, '');
  const fileName = customFileName?.trim() ? `${customFileName.trim().replace(/\.pdf$/i, '')}.pdf` : `${originalName}-extracted.pdf`;

  return { blob, fileName, size: blob.size };
}

export async function deletePages(file: File, pageIndicesToRemove: number[], customFileName?: string): Promise<{ blob: Blob; fileName: string; size: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  
  const pagesToKeep = [];
  for (let i = 0; i < totalPages; i++) {
    if (!pageIndicesToRemove.includes(i)) {
      pagesToKeep.push(i);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('You cannot delete all pages from the PDF.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  
  const originalName = file.name.replace(/\.pdf$/i, '');
  const fileName = customFileName?.trim() ? `${customFileName.trim().replace(/\.pdf$/i, '')}.pdf` : `${originalName}-deleted.pdf`;

  return { blob, fileName, size: blob.size };
}

export interface ReorderAction {
  sourceIndex: number;
  rotation?: number; // accumulated rotation in degrees
}

export async function reorderPages(file: File, newOrder: ReorderAction[], customFileName?: string): Promise<{ blob: Blob; fileName: string; size: number }> {
  if (newOrder.length === 0) {
    throw new Error('No pages to organize.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const indicesToCopy = newOrder.map(item => item.sourceIndex);
  const copiedPages = await newPdf.copyPages(srcDoc, indicesToCopy);

  copiedPages.forEach((page, i) => {
    const rotation = newOrder[i].rotation || 0;
    if (rotation !== 0) {
      page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
    }
    newPdf.addPage(page);
  });

  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  
  const originalName = file.name.replace(/\.pdf$/i, '');
  const fileName = customFileName?.trim() ? `${customFileName.trim().replace(/\.pdf$/i, '')}.pdf` : `${originalName}-organized.pdf`;

  return { blob, fileName, size: blob.size };
}

// ---------------------------------------------------------------------------
// PDF → Image conversion
// ---------------------------------------------------------------------------

export async function pdfPagesToImages(
  file: File,
  format: 'jpeg' | 'png' | 'webp',
  scale = 2.0,
  onProgress?: (progress: number, text: string) => void
): Promise<{ name: string; dataUrl: string }[]> {
  if (typeof window === 'undefined') return [];

  // Check WebP support early
  if (format === 'webp') {
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 1;
    testCanvas.height = 1;
    if (!testCanvas.toDataURL('image/webp').startsWith('data:image/webp')) {
      throw new Error('WebP is not supported by your browser. Try JPG or PNG instead.');
    }
  }

  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const baseName = file.name.replace(/\.pdf$/i, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  const mimeType = `image/${format}`;
  const quality = format === 'png' ? undefined : 0.92;
  const padLen = String(totalPages).length;

  const results: { name: string; dataUrl: string }[] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(Math.round(((i - 1) / totalPages) * 95), `Rendering page ${i} of ${totalPages}…`);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
      const dataUrl = quality !== undefined
        ? canvas.toDataURL(mimeType, quality)
        : canvas.toDataURL(mimeType);

      const paddedNum = String(i).padStart(padLen, '0');
      results.push({ name: `${baseName}-page-${paddedNum}.${ext}`, dataUrl });
    }
  }

  onProgress?.(100, 'Done!');
  return results;
}

// ---------------------------------------------------------------------------
// Image → PDF conversion
// ---------------------------------------------------------------------------

async function fileToEmbeddableBytes(file: File): Promise<{ bytes: Uint8Array; type: 'jpg' | 'png' }> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const t = file.type;

  if (t === 'image/jpeg' || t === 'image/jpg') {
    return { bytes, type: 'jpg' };
  }
  if (t === 'image/png') {
    return { bytes, type: 'png' };
  }

  // WebP (or unknown): convert via canvas → PNG
  const blob = new Blob([bytes], { type: t });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  const pngDataUrl = canvas.toDataURL('image/png');
  const base64 = pngDataUrl.split(',')[1];
  const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return { bytes: pngBytes, type: 'png' };
}

export async function imagesToPdf(
  files: File[],
  customFileName?: string,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; fileName: string; size: number }> {
  if (files.length === 0) throw new Error('Please add at least one image.');

  const pdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const { bytes, type } = await fileToEmbeddableBytes(files[i]);
    const img = type === 'jpg' ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    onProgress?.(Math.round(((i + 1) / files.length) * 90));
  }

  const pdfBytes = await pdf.save();
  onProgress?.(100);

  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const baseName = files[0].name.replace(/\.[^.]+$/, '');
  const fileName = customFileName?.trim()
    ? `${customFileName.trim().replace(/\.pdf$/i, '')}.pdf`
    : `${baseName}-converted.pdf`;

  return { blob, fileName, size: blob.size };
}

// ---------------------------------------------------------------------------
// PDF Compression
// ---------------------------------------------------------------------------

export interface PdfCompressionOptions {
  preset: 'recommended' | 'extreme' | 'low' | 'custom';
  quality?: number; // 0.1 to 1.0
  scale?: number;   // 0.5 to 2.0
}

export async function compressPdfFile(
  file: File,
  options: PdfCompressionOptions = { preset: 'recommended' },
  onProgress?: (progress: number, statusText?: string) => void
): Promise<{
  blob: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  savingsPct: number;
  pageCount: number;
}> {
  if (typeof window === 'undefined') throw new Error('Client-side only');

  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
  }

  let scale = 1.25;
  let quality = 0.72;

  if (options.preset === 'extreme') {
    scale = 0.95;
    quality = 0.48;
  } else if (options.preset === 'recommended') {
    scale = 1.25;
    quality = 0.72;
  } else if (options.preset === 'low') {
    scale = 1.75;
    quality = 0.88;
  } else if (options.preset === 'custom') {
    scale = options.scale ?? 1.25;
    quality = options.quality ?? 0.72;
  }

  onProgress?.(5, 'Reading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(
      Math.round(5 + ((i - 1) / numPages) * 85),
      `Compressing page ${i} of ${numPages}...`
    );

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const originalViewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not create canvas context');

    await (page.render as any)({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const embeddedImage = await newPdf.embedJpg(imageBytes);
    const newPage = newPdf.addPage([originalViewport.width, originalViewport.height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: originalViewport.width,
      height: originalViewport.height,
    });
  }

  onProgress?.(95, 'Finalizing optimized PDF...');
  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  onProgress?.(100, 'Complete!');

  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const originalSize = file.size;
  const compressedSize = blob.size;
  const savingsPct = originalSize > 0
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  const baseName = file.name.replace(/\.[^.]+$/, '');
  const fileName = `${baseName}-compressed.pdf`;

  return {
    blob,
    fileName,
    originalSize,
    compressedSize,
    savingsPct,
    pageCount: numPages,
  };
}
