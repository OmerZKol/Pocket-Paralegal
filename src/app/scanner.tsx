import React, { useState } from 'react';
import { useRouter, Href } from 'expo-router';
import { Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import { ScannerScreen } from '../screens/ScannerScreen';
import { useAppContext } from '../contexts/AppContext';
import { extractTextFromImage, isPDFFile } from '../utils/pdfProcessor';
import { PDFProcessorModal, PDFOCRPage } from '../components/PDFProcessorModal';

export default function Scanner() {
  const router = useRouter();
  const { selectedModelId, setSelectedModelId, scannedPages, setScannedPages, setRiskReport, loadedModelId } = useAppContext();
  const [pdfProcessing, setPdfProcessing] = useState<{ visible: boolean; uri: string }>({
    visible: false,
    uri: '',
  });

  const handleBack = () => {
    setScannedPages([]);
    setRiskReport('');
    router.push('/' as Href);
  };

  const scanWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required to scan documents.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const processed = await MlkitOcr.detectFromUri(result.assets[0].uri);
        const fullText = processed.map((block) => block.text).join('\n');

        // Log the actual image dimensions from the asset
        console.log('[SCAN] Camera image dimensions from asset:', result.assets[0].width, 'x', result.assets[0].height);

        // Capture OCR bounding boxes
        const ocrData = processed.map((block) => ({
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

        // Log sample OCR coordinates
        if (processed.length > 0 && processed[0].lines.length > 0) {
          console.log('[SCAN] Sample OCR coordinate:', processed[0].lines[0].bounding);
        }

        const newPage = {
          uri: result.assets[0].uri,
          text: fullText,
          ocrData,
          originalWidth: result.assets[0].width,
          originalHeight: result.assets[0].height,
        };

        setScannedPages([...scannedPages, newPage]);
        console.log('[SCAN] Page scanned successfully');
      }
    } catch (error) {
      console.error('Document scanning error:', error);
      Alert.alert('Error', 'Failed to scan document.');
    }
  };

  const scanWithGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const processed = await MlkitOcr.detectFromUri(result.assets[0].uri);
        const fullText = processed.map((block) => block.text).join('\n');

        // Log the actual image dimensions from the asset
        console.log('[SCAN] Gallery image dimensions from asset:', result.assets[0].width, 'x', result.assets[0].height);

        // Capture OCR bounding boxes
        const ocrData = processed.map((block) => ({
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

        // Log sample OCR coordinates
        if (processed.length > 0 && processed[0].lines.length > 0) {
          console.log('[SCAN] Sample OCR coordinate:', processed[0].lines[0].bounding);
        }

        const newPage = {
          uri: result.assets[0].uri,
          text: fullText,
          ocrData,
          originalWidth: result.assets[0].width,
          originalHeight: result.assets[0].height,
        };

        setScannedPages([...scannedPages, newPage]);
        console.log('[SCAN] Page selected successfully');
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const selectFile = async (): Promise<boolean> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('[FILE] File selection cancelled');
        return false;
      }

      const file = result.assets[0];
      console.log('[FILE] File selected:', file.name, file.mimeType);
      console.log('[FILE] File URI:', file.uri);

      // Check if it's a PDF
      if (isPDFFile(file.uri, file.mimeType)) {
        console.log('[FILE] Processing PDF file with OCR, URI:', file.uri);
        // Start PDF OCR processing
        setPdfProcessing({ visible: true, uri: file.uri });
        console.log('[FILE] PDF processing state set with URI:', file.uri);
        return true; // Indicates PDF processing started
      } else {
        // Handle as image file
        console.log('[FILE] Processing image file');
        const { text, ocrData } = await extractTextFromImage(file.uri);

        // Get image dimensions
        const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
          Image.getSize(
            file.uri,
            (width, height) => resolve({ width, height }),
            (error) => {
              console.warn('[FILE] Could not get image dimensions:', error);
              resolve({ width: 0, height: 0 });
            }
          );
        });

        const newPage = {
          uri: file.uri,
          text,
          ocrData,
          originalWidth: width,
          originalHeight: height,
        };

        setScannedPages([...scannedPages, newPage]);
        console.log('[FILE] Image file processed successfully with dimensions:', width, 'x', height);
        return false; // Regular image, not a PDF
      }
    } catch (error) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to process file.');
      return false;
    }
  };

  const handlePDFProcessingComplete = (pages: PDFOCRPage[]) => {
    console.log(`[PDF OCR] Processing complete. Adding ${pages.length} pages`);

    // Convert PDFOCRPage to ScannedPage format
    const newPages = pages.map(page => ({
      uri: page.imageUri, // Use the captured image instead of the PDF URI
      text: page.text,
      ocrData: page.ocrData,
      pageNumber: page.pageNumber,
      originalWidth: page.originalWidth,
      originalHeight: page.originalHeight,
    }));

    // Use functional update to avoid stale closure
    setScannedPages((currentPages) => [...currentPages, ...newPages]);
    setPdfProcessing({ visible: false, uri: '' });

    // Navigate to review screen after PDF processing completes
    console.log('[PDF] Processing complete, navigating to review');
    router.push('/review' as Href);
  };

  const handlePDFProcessingError = (error: string) => {
    console.error('[PDF OCR] Processing error:', error);
    Alert.alert('PDF Processing Error', error);
    setPdfProcessing({ visible: false, uri: '' });
  };

  const handleScanComplete = async (type: 'camera' | 'gallery' | 'file') => {
    console.log(`[SCAN] User clicked ${type} button, starting document scan`);

    if (type === 'camera') {
      await scanWithCamera();
      console.log('[SCAN] Camera scan completed, navigating to review');
      router.push('/review' as Href);
    } else if (type === 'gallery') {
      await scanWithGallery();
      console.log('[SCAN] Gallery scan completed, navigating to review');
      router.push('/review' as Href);
    } else if (type === 'file') {
      const isPDFProcessing = await selectFile();
      // Only navigate if it's not a PDF (image files are processed immediately)
      // PDF processing will handle navigation when it completes
      if (!isPDFProcessing) {
        console.log('[SCAN] Image file processed, navigating to review');
        router.push('/review' as Href);
      } else {
        console.log('[SCAN] PDF processing started, will navigate when complete');
      }
    }
  };

  return (
    <>
      <ScannerScreen
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
        onBack={handleBack}
        onScanComplete={handleScanComplete}
        loadedModelId={loadedModelId}
      />
      {pdfProcessing.visible && (
        <PDFProcessorModal
          key={pdfProcessing.uri}
          visible={pdfProcessing.visible}
          pdfUri={pdfProcessing.uri}
          onComplete={handlePDFProcessingComplete}
          onError={handlePDFProcessingError}
        />
      )}
    </>
  );
}
