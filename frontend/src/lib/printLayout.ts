export interface PaperSize {
  id: string
  name: string
  widthMm: number
  heightMm: number
  inchesLabel?: string
}

export interface PhotoSize {
  id: string
  name: string
  widthMm: number
  heightMm: number
}

export interface PrintPhotoItem {
  id: string
  personNumber: number
  name: string
  imageUrl: string
  filter?: string
  documentType: string
  documentTitle: string
  widthMm: number
  heightMm: number
  copies: number
}

export type OrientationSetting = 'auto' | 'portrait' | 'landscape'
export type ResolvedOrientation = 'portrait' | 'landscape'
export type LayoutMode = 'custom' | 'maximum'

export interface PhotoPosition {
  index: number
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
  row: number
  col: number
  photoItem?: PrintPhotoItem
}

export interface SheetPage {
  pageNumber: number
  positions: PhotoPosition[]
  actualPhotos: number
  gridColumns: number
  gridRows: number
  boundingBox: {
    xMm: number
    yMm: number
    widthMm: number
    heightMm: number
  }
}

export interface LayoutResult {
  paper: PaperSize
  photo: PhotoSize
  orientationSetting: OrientationSetting
  resolvedOrientation: ResolvedOrientation
  paperWidthMm: number
  paperHeightMm: number
  maxColumns: number
  maxRows: number
  maxPhotos: number
  requestedPhotos: number
  actualPhotos: number
  isValid: boolean
  errorMessage?: string
  gridColumns: number
  gridRows: number
  positions: PhotoPosition[]
  boundingBox: {
    xMm: number
    yMm: number
    widthMm: number
    heightMm: number
  }
  totalRequestedPhotos: number
  totalSheetsRequired: number
  pages: SheetPage[]
}

// 7 Supported Paper Sizes (Default: 5 × 7 in)
export const SUPPORTED_PAPER_SIZES: PaperSize[] = [
  { id: '5x7', name: '5 × 7 in — 127 × 178 mm', widthMm: 127, heightMm: 178, inchesLabel: '5 × 7 in' },
  { id: '4x6', name: '4 × 6 in — 102 × 152 mm', widthMm: 102, heightMm: 152, inchesLabel: '4 × 6 in' },
  { id: '3.5x5', name: '3.5 × 5 in — 89 × 127 mm', widthMm: 89, heightMm: 127, inchesLabel: '3.5 × 5 in' },
  { id: 'A6', name: 'A6 — 105 × 148 mm', widthMm: 105, heightMm: 148 },
  { id: 'A5', name: 'A5 — 148 × 210 mm', widthMm: 148, heightMm: 210 },
  { id: 'A4', name: 'A4 — 210 × 297 mm', widthMm: 210, heightMm: 297 },
  { id: 'Letter', name: 'Letter — 216 × 279 mm', widthMm: 216, heightMm: 279, inchesLabel: '8.5 × 11 in' },
]

export const DEFAULT_PAPER_SIZE_ID = '5x7'

// Standard Photo Sizes
export const STANDARD_PHOTO_SIZES: PhotoSize[] = [
  { id: '35x45', name: '35 × 45 mm (EU, UK, Schengen, Standard)', widthMm: 35, heightMm: 45 },
  { id: '51x51', name: '2 × 2 in / 51 × 51 mm (US, India, Tanzania)', widthMm: 51, heightMm: 51 },
  { id: '50x70', name: '50 × 70 mm (Canada)', widthMm: 50, heightMm: 70 },
  { id: '33x48', name: '33 × 48 mm (China Visa)', widthMm: 33, heightMm: 48 },
  { id: '40x40', name: '40 × 40 mm (Rwanda / Visa)', widthMm: 40, heightMm: 40 },
  { id: '35x35', name: '35 × 35 mm (Square)', widthMm: 35, heightMm: 35 },
]

export const PRINT_MARGIN_MM = 5
export const PHOTO_SPACING_MM = 2.5

interface OrientationCapacity {
  orientation: ResolvedOrientation
  paperWidthMm: number
  paperHeightMm: number
  maxColumns: number
  maxRows: number
  maxCapacity: number
}

export function calculateOrientationCapacity(
  basePaper: PaperSize,
  orientation: ResolvedOrientation,
  photo: PhotoSize,
  marginMm: number = PRINT_MARGIN_MM,
  spacingMm: number = PHOTO_SPACING_MM
): OrientationCapacity {
  const isPortrait = orientation === 'portrait'
  const minDim = Math.min(basePaper.widthMm, basePaper.heightMm)
  const maxDim = Math.max(basePaper.widthMm, basePaper.heightMm)

  const paperWidthMm = isPortrait ? minDim : maxDim
  const paperHeightMm = isPortrait ? maxDim : minDim

  const usableWidth = paperWidthMm - marginMm * 2
  const usableHeight = paperHeightMm - marginMm * 2

  const maxColumns = Math.max(0, Math.floor((usableWidth + spacingMm) / (photo.widthMm + spacingMm)))
  const maxRows = Math.max(0, Math.floor((usableHeight + spacingMm) / (photo.heightMm + spacingMm)))
  const maxCapacity = maxColumns * maxRows

  return {
    orientation,
    paperWidthMm,
    paperHeightMm,
    maxColumns,
    maxRows,
    maxCapacity,
  }
}

/**
 * Finds the cleanest grid dimensions (cols, rows) to arrange requestedCount photos,
 * fitting within maxCols and maxRows.
 */
export function findBestGrid(
  requestedCount: number,
  maxCols: number,
  maxRows: number,
  photoWidth: number,
  photoHeight: number,
  usableWidth: number,
  usableHeight: number
): { cols: number; rows: number; score: number } | null {
  if (requestedCount <= 0 || maxCols <= 0 || maxRows <= 0) return null
  if (requestedCount > maxCols * maxRows) return null

  let bestGrid: { cols: number; rows: number; score: number } | null = null

  // Evaluate all possible (cols, rows) that can hold requestedCount photos
  for (let c = 1; c <= maxCols; c++) {
    for (let r = 1; r <= maxRows; r++) {
      if (c * r < requestedCount) continue
      // Don't have an entire extra empty row
      if ((r - 1) * c >= requestedCount) continue

      const emptySlots = c * r - requestedCount
      const gridWidth = c * photoWidth
      const gridHeight = r * photoHeight

      // Aspect ratio comparison between grid bounding box and usable paper
      const gridAspect = gridWidth / gridHeight
      const paperAspect = usableWidth / usableHeight
      const aspectDifference = Math.abs(Math.log(gridAspect / paperAspect))

      // Penalties:
      // 1. Prefer minimal empty slots
      // 2. Prefer aspect ratio harmony with the paper
      // 3. Prefer balanced row/col distribution
      const score = 1000 - emptySlots * 50 - aspectDifference * 100 - Math.abs(c - r) * 10

      if (!bestGrid || score > bestGrid.score) {
        bestGrid = { cols: c, rows: r, score }
      }
    }
  }

  return bestGrid
}

export interface LayoutOptions {
  paper: PaperSize
  photo?: PhotoSize
  photos?: PrintPhotoItem[]
  orientationSetting: OrientationSetting
  layoutMode: LayoutMode
  requestedPhotosPerSheet?: number
  marginMm?: number
  spacingMm?: number
}

/**
 * Multi-Person & Quantity-Aware layout calculation engine.
 * Automatically derives photo dimensions from the Document Type of each photo.
 */
export function calculatePrintLayout(options: LayoutOptions): LayoutResult {
  const {
    paper,
    orientationSetting,
    layoutMode,
    marginMm = PRINT_MARGIN_MM,
    spacingMm = PHOTO_SPACING_MM,
  } = options

  // 1. Determine active photo dimensions from Document Type (or options.photo fallback)
  let photoWidth = 35
  let photoHeight = 45
  let photoName = 'Standard Photo'

  if (options.photos && options.photos.length > 0) {
    photoWidth = options.photos[0].widthMm || 35
    photoHeight = options.photos[0].heightMm || 45
    photoName = options.photos[0].documentTitle || `${photoWidth} × ${photoHeight} mm`
  } else if (options.photo) {
    photoWidth = options.photo.widthMm
    photoHeight = options.photo.heightMm
    photoName = options.photo.name
  }

  const effectivePhotoSize: PhotoSize = {
    id: `size-${photoWidth}x${photoHeight}`,
    name: photoName,
    widthMm: photoWidth,
    heightMm: photoHeight,
  }

  // 2. Flatten copies into individual slot items
  const flatItems: PrintPhotoItem[] = []
  if (options.photos && options.photos.length > 0) {
    options.photos.forEach((item) => {
      const copies = Math.max(0, item.copies)
      for (let i = 0; i < copies; i++) {
        flatItems.push(item)
      }
    })
  }

  const totalRequested = flatItems.length > 0
    ? flatItems.length
    : (options.requestedPhotosPerSheet || 4)

  // 3. Evaluate Portrait & Landscape capacities for the paper
  const portraitCap = calculateOrientationCapacity(paper, 'portrait', effectivePhotoSize, marginMm, spacingMm)
  const landscapeCap = calculateOrientationCapacity(paper, 'landscape', effectivePhotoSize, marginMm, spacingMm)
  const globalMax = Math.max(portraitCap.maxCapacity, landscapeCap.maxCapacity)

  // 4. Orientation Decision
  let chosenOrientation: ResolvedOrientation
  let activeCap: OrientationCapacity

  if (orientationSetting === 'portrait') {
    chosenOrientation = 'portrait'
    activeCap = portraitCap
  } else if (orientationSetting === 'landscape') {
    chosenOrientation = 'landscape'
    activeCap = landscapeCap
  } else {
    // Auto: Smart decision based on requested count & capacity
    const target = Math.min(totalRequested, globalMax)
    const portraitFits = target <= portraitCap.maxCapacity
    const landscapeFits = target <= landscapeCap.maxCapacity

    if (portraitFits && !landscapeFits) {
      chosenOrientation = 'portrait'
      activeCap = portraitCap
    } else if (!portraitFits && landscapeFits) {
      chosenOrientation = 'landscape'
      activeCap = landscapeCap
    } else if (portraitFits && landscapeFits) {
      const pGrid = findBestGrid(
        target,
        portraitCap.maxColumns,
        portraitCap.maxRows,
        effectivePhotoSize.widthMm,
        effectivePhotoSize.heightMm,
        portraitCap.paperWidthMm - marginMm * 2,
        portraitCap.paperHeightMm - marginMm * 2
      )

      const lGrid = findBestGrid(
        target,
        landscapeCap.maxColumns,
        landscapeCap.maxRows,
        effectivePhotoSize.widthMm,
        effectivePhotoSize.heightMm,
        landscapeCap.paperWidthMm - marginMm * 2,
        landscapeCap.paperHeightMm - marginMm * 2
      )

      const pScore = pGrid ? pGrid.score : -9999
      const lScore = lGrid ? lGrid.score : -9999

      if (lScore > pScore) {
        chosenOrientation = 'landscape'
        activeCap = landscapeCap
      } else {
        chosenOrientation = 'portrait'
        activeCap = portraitCap
      }
    } else {
      if (landscapeCap.maxCapacity >= portraitCap.maxCapacity) {
        chosenOrientation = 'landscape'
        activeCap = landscapeCap
      } else {
        chosenOrientation = 'portrait'
        activeCap = portraitCap
      }
    }
  }

  const { paperWidthMm, paperHeightMm, maxColumns, maxRows, maxCapacity } = activeCap
  const capacityPerSheet = Math.max(1, maxCapacity)

  // 5. Calculate pages & sheet requirements
  let totalSheets = 1
  let itemsToDistribute = [...flatItems]

  if (layoutMode === 'maximum') {
    if (itemsToDistribute.length > 0) {
      if (itemsToDistribute.length <= capacityPerSheet) {
        // In maximum mode with <= sheet capacity, duplicate items proportionally to fill sheet
        const originalCount = itemsToDistribute.length
        while (itemsToDistribute.length < capacityPerSheet) {
          const idx = itemsToDistribute.length % originalCount
          itemsToDistribute.push(itemsToDistribute[idx])
        }
        totalSheets = 1
      } else {
        totalSheets = Math.ceil(itemsToDistribute.length / capacityPerSheet)
      }
    } else {
      totalSheets = 1
    }
  } else {
    // Custom mode
    totalSheets = itemsToDistribute.length > 0
      ? Math.ceil(itemsToDistribute.length / capacityPerSheet)
      : 1
  }

  const pages: SheetPage[] = []

  if (itemsToDistribute.length === 0) {
    // Fallback single-slot preview if no photos yet
    const targetCount = layoutMode === 'maximum' ? capacityPerSheet : Math.min(totalRequested, capacityPerSheet)
    const grid = findBestGrid(
      targetCount,
      maxColumns,
      maxRows,
      effectivePhotoSize.widthMm,
      effectivePhotoSize.heightMm,
      paperWidthMm - marginMm * 2,
      paperHeightMm - marginMm * 2
    ) || { cols: maxColumns, rows: Math.ceil(targetCount / maxColumns), score: 0 }

    const gridWidthMm = grid.cols * effectivePhotoSize.widthMm + (grid.cols - 1) * spacingMm
    const gridHeightMm = grid.rows * effectivePhotoSize.heightMm + (grid.rows - 1) * spacingMm
    const startXMm = Math.max(marginMm, (paperWidthMm - gridWidthMm) / 2)
    const startYMm = Math.max(marginMm, (paperHeightMm - gridHeightMm) / 2)

    const positions: PhotoPosition[] = []
    for (let i = 0; i < targetCount; i++) {
      const col = i % grid.cols
      const row = Math.floor(i / grid.cols)
      positions.push({
        index: i,
        xMm: startXMm + col * (effectivePhotoSize.widthMm + spacingMm),
        yMm: startYMm + row * (effectivePhotoSize.heightMm + spacingMm),
        widthMm: effectivePhotoSize.widthMm,
        heightMm: effectivePhotoSize.heightMm,
        row,
        col,
      })
    }

    pages.push({
      pageNumber: 1,
      positions,
      actualPhotos: targetCount,
      gridColumns: grid.cols,
      gridRows: grid.rows,
      boundingBox: { xMm: startXMm, yMm: startYMm, widthMm: gridWidthMm, heightMm: gridHeightMm },
    })
  } else {
    // Distribute flat items across sheet pages
    for (let p = 0; p < totalSheets; p++) {
      const pageItems = itemsToDistribute.slice(p * capacityPerSheet, (p + 1) * capacityPerSheet)
      const pageCount = pageItems.length

      const grid = findBestGrid(
        pageCount,
        maxColumns,
        maxRows,
        effectivePhotoSize.widthMm,
        effectivePhotoSize.heightMm,
        paperWidthMm - marginMm * 2,
        paperHeightMm - marginMm * 2
      ) || { cols: maxColumns, rows: Math.ceil(pageCount / maxColumns), score: 0 }

      const gridWidthMm = grid.cols * effectivePhotoSize.widthMm + (grid.cols - 1) * spacingMm
      const gridHeightMm = grid.rows * effectivePhotoSize.heightMm + (grid.rows - 1) * spacingMm
      const startXMm = Math.max(marginMm, (paperWidthMm - gridWidthMm) / 2)
      const startYMm = Math.max(marginMm, (paperHeightMm - gridHeightMm) / 2)

      const pagePositions: PhotoPosition[] = []
      for (let i = 0; i < pageCount; i++) {
        const col = i % grid.cols
        const row = Math.floor(i / grid.cols)
        pagePositions.push({
          index: p * capacityPerSheet + i,
          xMm: startXMm + col * (effectivePhotoSize.widthMm + spacingMm),
          yMm: startYMm + row * (effectivePhotoSize.heightMm + spacingMm),
          widthMm: effectivePhotoSize.widthMm,
          heightMm: effectivePhotoSize.heightMm,
          row,
          col,
          photoItem: pageItems[i],
        })
      }

      pages.push({
        pageNumber: p + 1,
        positions: pagePositions,
        actualPhotos: pageCount,
        gridColumns: grid.cols,
        gridRows: grid.rows,
        boundingBox: { xMm: startXMm, yMm: startYMm, widthMm: gridWidthMm, heightMm: gridHeightMm },
      })
    }
  }

  const firstPage = pages[0] || {
    positions: [],
    actualPhotos: 0,
    gridColumns: maxColumns,
    gridRows: maxRows,
    boundingBox: { xMm: 0, yMm: 0, widthMm: 0, heightMm: 0 },
  }

  return {
    paper,
    photo: effectivePhotoSize,
    orientationSetting,
    resolvedOrientation: chosenOrientation,
    paperWidthMm,
    paperHeightMm,
    maxColumns,
    maxRows,
    maxPhotos: capacityPerSheet,
    requestedPhotos: totalRequested,
    actualPhotos: itemsToDistribute.length || firstPage.actualPhotos,
    isValid: true,
    gridColumns: firstPage.gridColumns,
    gridRows: firstPage.gridRows,
    positions: firstPage.positions,
    boundingBox: firstPage.boundingBox,
    totalRequestedPhotos: totalRequested,
    totalSheetsRequired: totalSheets,
    pages,
  }
}
