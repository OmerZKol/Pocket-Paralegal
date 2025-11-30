import * as FileSystem from 'expo-file-system';
import MlkitOcr from 'react-native-mlkit-ocr';

export interface PDFPage {
  uri: string;
  text: string;
  pageNumber: number;
}

/**
 * Process a PDF file by converting it to images and extracting text via OCR
 * Note: This is a simplified approach. For production, consider using a dedicated PDF text extraction library.
 *
 * Since react-native-pdf is primarily a viewer, we'll use a different approach:
 * 1. For PDFs with selectable text, we'd need a PDF.js or similar library
 * 2. For scanned PDFs (images), we can render pages and use OCR
 *
 * For now, we'll handle PDFs as documents that need to be processed page by page.
 */
export async function processPDFDocument(fileUri: string): Promise<PDFPage[]> {
  try {
    // For now, we'll treat the PDF as a single document
    // In a production app, you'd want to:
    // 1. Convert each PDF page to an image
    // 2. Run OCR on each image
    // 3. Return array of pages with extracted text

    // This is a placeholder implementation
    // The actual implementation would depend on whether you want to:
    // - Use a server-side PDF processing service
    // - Use a native PDF text extraction library
    // - Convert PDF pages to images client-side

    console.log('[PDF] Processing PDF file:', fileUri);

    // For the initial implementation, we'll just return the PDF URI
    // and handle it as a special case in the UI
    const pages: PDFPage[] = [{
      uri: fileUri,
      text: 'PDF processing: Text extraction from PDF files requires additional setup. This PDF has been loaded but text extraction is limited.',
      pageNumber: 1,
    }];

    return pages;
  } catch (error) {
    console.error('[PDF] Error processing PDF:', error);
    throw new Error('Failed to process PDF document');
  }
}

/**
 * Extract text from an image file using OCR
 */
export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    const processed = await MlkitOcr.detectFromUri(imageUri);
    const fullText = processed.map((block) => block.text).join('\n');
    return fullText;
  } catch (error) {
    console.error('[OCR] Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Determine if a file is a PDF based on its URI or MIME type
 */
export function isPDFFile(uri: string, mimeType?: string): boolean {
  if (mimeType) {
    return mimeType === 'application/pdf';
  }
  return uri.toLowerCase().endsWith('.pdf');
}

/**
 * Get file info including size and type
 */
export async function getFileInfo(uri: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo;
  } catch (error) {
    console.error('[FILE] Error getting file info:', error);
    return null;
  }
}
