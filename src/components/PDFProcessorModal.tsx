import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { captureRef } from 'react-native-view-shot';
import MlkitOcr from 'react-native-mlkit-ocr';

export interface PDFOCRPage {
  uri: string;
  text: string;
  pageNumber: number;
  imageUri: string;
}

interface PDFProcessorModalProps {
  visible: boolean;
  pdfUri: string;
  onComplete: (pages: PDFOCRPage[]) => void;
  onError: (error: string) => void;
}

/**
 * Modal that processes a PDF file by rendering each page, capturing it as an image,
 * and running OCR on it.
 */
export function PDFProcessorModal({
  visible,
  pdfUri,
  onComplete,
  onError,
}: PDFProcessorModalProps) {
  const viewRef = useRef<View>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedPages, setProcessedPages] = useState<PDFOCRPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Loading PDF...');

  // Reset state when modal becomes visible or PDF URI changes
  useEffect(() => {
    if (visible) {
      console.log('[PDF Modal] Resetting state for new PDF:', pdfUri);
      setTotalPages(0);
      setCurrentPage(1);
      setProcessedPages([]);
      setIsProcessing(false);
      setStatus('Loading PDF...');
    }
  }, [visible, pdfUri]);

  // Process pages when totalPages is set and we're not already processing
  useEffect(() => {
    if (visible && totalPages > 0 && !isProcessing && currentPage <= totalPages) {
      processCurrentPage();
    } else if (visible && totalPages > 0 && currentPage > totalPages) {
      // All pages processed
      console.log(`[PDF OCR] Processing complete. ${processedPages.length} pages processed`);
      onComplete(processedPages);
    }
  }, [visible, currentPage, totalPages, isProcessing]);

  const processCurrentPage = async () => {
    if (!viewRef.current || !visible) return;

    setIsProcessing(true);
    setStatus(`Processing page ${currentPage} of ${totalPages}...`);

    try {
      console.log(`[PDF OCR] Processing page ${currentPage} of ${totalPages}`);

      // Wait for PDF page to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture the rendered PDF page as an image
      const imageUri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9,
        result: 'tmpfile',
      });

      console.log(`[PDF OCR] Captured page ${currentPage}`);
      setStatus(`Running OCR on page ${currentPage} of ${totalPages}...`);

      // Run OCR on the captured image
      const ocrResult = await MlkitOcr.detectFromUri(imageUri);
      const text = ocrResult.map((block) => block.text).join('\n');

      console.log(`[PDF OCR] Extracted ${text.length} characters from page ${currentPage}`);

      const page: PDFOCRPage = {
        uri: pdfUri,
        text: text || `[Page ${currentPage} - No text detected]`,
        pageNumber: currentPage,
        imageUri,
      };

      setProcessedPages(prev => [...prev, page]);

      // Move to next page
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error(`[PDF OCR] Error processing page ${currentPage}:`, error);
      onError(`Failed to process page ${currentPage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadComplete = (numberOfPages: number) => {
    console.log(`[PDF OCR] PDF loaded with ${numberOfPages} pages`);
    setTotalPages(numberOfPages);
    setStatus(`PDF loaded. Found ${numberOfPages} page${numberOfPages !== 1 ? 's' : ''}. Starting OCR...`);
  };

  const handleError = (error: any) => {
    console.error('[PDF OCR] PDF load error:', error);
    onError('Failed to load PDF file');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Processing PDF</Text>
          <Text style={styles.status}>{status}</Text>

          {totalPages > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${((currentPage - 1) / totalPages) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Page {Math.min(currentPage, totalPages)} of {totalPages}
              </Text>
            </View>
          )}

          <ActivityIndicator size="large" color="#d4a574" style={styles.spinner} />

          {/* Hidden PDF renderer */}
          <View style={styles.hiddenContainer}>
            <View
              ref={viewRef}
              style={styles.pdfContainer}
              collapsable={false}
            >
              <Pdf
                key={pdfUri}
                source={{ uri: pdfUri }}
                style={styles.pdf}
                page={currentPage}
                onLoadComplete={handleLoadComplete}
                onError={handleError}
                enablePaging={false}
                trustAllCerts={false}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const pdfWidth = Math.min(600, screenWidth - 100);
const pdfHeight = pdfWidth * 1.4; // Approximate A4 ratio

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d4a574',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 10,
  },
  hiddenContainer: {
    position: 'absolute',
    left: -10000,
    top: 0,
    opacity: 0,
  },
  pdfContainer: {
    width: pdfWidth,
    height: pdfHeight,
    backgroundColor: 'white',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
