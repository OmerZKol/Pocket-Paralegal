import { Citation, ScannedPage, OCRLine } from '../contexts/AppContext';

interface ParsedCitation {
  quote: string;
  fullMatch: string;
}

/**
 * Extract citations from LLM response
 * Format: [CITE: "quote text"] or (CITE: "quote text")
 */
export function parseCitations(reportText: string): ParsedCitation[] {
  const citationRegex = /[\[\(]CITE:\s*"([^"]+)"\s*[\]\)]/g;
  const citations: ParsedCitation[] = [];

  let match;
  while ((match = citationRegex.exec(reportText)) !== null) {
    citations.push({
      quote: match[1],
      fullMatch: match[0],
    });
  }

  return citations;
}

/**
 * Normalize text for fuzzy matching
 * Removes extra spaces, converts to lowercase, and strips trailing ellipses
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.\.\.+\s*$/g, '') // Remove trailing ellipses (... or ....)
    .replace(/…\s*$/g, '')        // Remove trailing ellipsis character
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find bounding boxes for a quote within a page's OCR data
 * Uses fuzzy matching to handle minor OCR variations
 */
export function findQuoteBoundingBoxes(
  quote: string,
  page: ScannedPage
): Citation['highlightRanges'] {
  if (!page.ocrData) {
    console.warn('[CITATION] No OCR data available for page');
    return [];
  }

  const ranges: Citation['highlightRanges'] = [];
  const normalizedQuote = normalizeText(quote);

  // Flatten all lines from all blocks
  const allLines: OCRLine[] = [];
  page.ocrData.forEach(block => {
    allLines.push(...block.lines);
  });

  // Try to find the quote in the text
  // Could be single-line or multi-line
  let searchText = '';
  let startLineIndex = -1;

  for (let i = 0; i < allLines.length; i++) {
    searchText += allLines[i].text + ' ';
    const normalizedSearch = normalizeText(searchText);

    // Check if we're starting to match the quote
    if (startLineIndex === -1 && normalizedSearch.includes(normalizedQuote.substring(0, Math.min(10, normalizedQuote.length)))) {
      startLineIndex = i;
    }

    // Check if we found the complete quote
    if (startLineIndex !== -1 && normalizedSearch.includes(normalizedQuote)) {
      // Found the complete quote
      const endLineIndex = i;

      // Collect bounding boxes for all lines in range
      for (let j = startLineIndex; j <= endLineIndex; j++) {
        ranges.push({
          top: allLines[j].bounding.top,
          left: allLines[j].bounding.left,
          width: allLines[j].bounding.width,
          height: allLines[j].bounding.height,
        });
      }
      break;
    }
  }

  if (ranges.length === 0) {
    console.warn(`[CITATION] Could not find quote in page OCR data: "${quote.substring(0, 50)}..."`);
  }

  return ranges;
}

/**
 * Find which page contains the quote by searching through all pages
 */
function findQuoteInPages(
  quote: string,
  scannedPages: ScannedPage[]
): { pageIndex: number; highlightRanges: Citation['highlightRanges'] } | null {
  const normalizedQuote = normalizeText(quote);

  // Search through all pages
  for (let pageIndex = 0; pageIndex < scannedPages.length; pageIndex++) {
    const page = scannedPages[pageIndex];
    const normalizedPageText = normalizeText(page.text);

    // Check if this page contains the quote
    if (normalizedPageText.includes(normalizedQuote)) {
      // Found the page, now get bounding boxes
      const highlightRanges = findQuoteBoundingBoxes(quote, page);
      return { pageIndex, highlightRanges };
    }
  }

  // Enhanced debugging: show full quote and snippet of where we tried to find it
  console.warn(`[CITATION] Could not find quote in any page`);
  console.warn(`[CITATION] Full quote: "${quote}"`);
  console.warn(`[CITATION] Normalized quote: "${normalizedQuote}"`);
  console.warn(`[CITATION] First page text sample (first 200 chars): "${scannedPages[0]?.text.substring(0, 200)}"`);
  return null;
}

/**
 * Main function: Convert parsed citations to Citation objects with bounding boxes
 */
export function extractCitations(
  reportText: string,
  scannedPages: ScannedPage[]
): Citation[] {
  const parsed = parseCitations(reportText);
  console.log(`[CITATION] Parsed ${parsed.length} citations from report`);

  return parsed.map((pc, index) => {
    // Search all pages to find where this quote appears
    const result = findQuoteInPages(pc.quote, scannedPages);

    if (!result) {
      return null;
    }

    return {
      id: `citation-${index}`,
      quote: pc.quote,
      pageIndex: result.pageIndex,
      highlightRanges: result.highlightRanges,
    };
  }).filter((c): c is Citation => c !== null);
}
