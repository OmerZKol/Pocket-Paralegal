import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import { captureRef } from 'react-native-view-shot';
import MlkitOcr from 'react-native-mlkit-ocr';

export interface PDFOCRPage {
  uri: string;
  text: string;
  pageNumber: number;
  imageUri: string;
  ocrData: any[];
  originalWidth: number;
  originalHeight: number;
}

interface PDFOCRProcessorProps {
  pdfUri: string;
  onPageProcessed: (page: PDFOCRPage) => void;
  onComplete: (pages: PDFOCRPage[]) => void;
  onError: (error: string) => void;
}

/**
 * Component that renders PDF pages offscreen, captures them as images,
 * and runs OCR on each page.
 */
export function PDFOCRProcessor({
  pdfUri,
  onPageProcessed,
  onComplete,
  onError,
}: PDFOCRProcessorProps) {
  const pdfRef = useRef<any>(null);
  const viewRef = useRef<View>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedPages, setProcessedPages] = useState<PDFOCRPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (totalPages > 0 && !isProcessing && currentPage <= totalPages) {
      processCurrentPage();
    } else if (totalPages > 0 && currentPage > totalPages) {
      // All pages processed
      onComplete(processedPages);
    }
  }, [currentPage, totalPages, isProcessing]);

  const processCurrentPage = async () => {
    if (!viewRef.current) return;

    setIsProcessing(true);

    try {
      console.log(`[PDF OCR] Processing page ${currentPage} of ${totalPages}`);

      // Wait a bit for the PDF page to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the rendered PDF page as an image with explicit dimensions
      const imageUri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        width: 800,
        height: 1000,
      });

      console.log(`[PDF OCR] Captured page ${currentPage} as 800x1000 image:`, imageUri);

      // Run OCR on the captured image
      const ocrResult = await MlkitOcr.detectFromUri(imageUri);
      const text = ocrResult.map((block) => block.text).join('\n');

      // Capture OCR bounding boxes
      const ocrData = ocrResult.map((block) => ({
        text: block.text,
        lines: block.lines.map((line) => ({
          text: line.text,
          bounding: {
            top: line.bounding.top,
            left: line.bounding.left,
            width: line.bounding.width,
            height: line.bounding.height,
          }
        }))
      }));

      console.log(`[PDF OCR] Extracted ${text.length} characters from page ${currentPage}`);

      const page: PDFOCRPage = {
        uri: pdfUri,
        text,
        pageNumber: currentPage,
        imageUri,
        ocrData,
        originalWidth: 800,
        originalHeight: 1000,
      };

      setProcessedPages(prev => [...prev, page]);
      onPageProcessed(page);

      // Move to next page
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error(`[PDF OCR] Error processing page ${currentPage}:`, error);
      onError(`Failed to process page ${currentPage}: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadComplete = (numberOfPages: number) => {
    console.log(`[PDF OCR] PDF loaded with ${numberOfPages} pages`);
    setTotalPages(numberOfPages);
  };

  return (
    <View style={styles.container}>
      <View ref={viewRef} style={styles.pdfContainer} collapsable={false}>
        <Pdf
          ref={pdfRef}
          source={{ uri: pdfUri }}
          style={styles.pdf}
          page={currentPage}
          onLoadComplete={handleLoadComplete}
          enablePaging={false}
          trustAllCerts={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -10000, // Render offscreen
    top: 0,
    width: 800,
    height: 1000,
  },
  pdfContainer: {
    width: 800,
    height: 1000,
    backgroundColor: 'white',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
