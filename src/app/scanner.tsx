import React, { useState } from 'react';
import { useRouter, Href } from 'expo-router';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import { ScannerScreen } from '../screens/ScannerScreen';
import { useAppContext } from '../contexts/AppContext';
import { extractTextFromImage, isPDFFile } from '../utils/pdfProcessor';
import { PDFProcessorModal, PDFOCRPage } from '../components/PDFProcessorModal';

export default function Scanner() {
  const router = useRouter();
  const { selectedModelId, setSelectedModelId, scannedPages, setScannedPages, setRiskReport } = useAppContext();
  const [pdfProcessing, setPdfProcessing] = useState<{ visible: boolean; uri: string }>({
    visible: false,
    uri: '',
  });

  const handleBack = () => {
    setScannedPages([]);
    setRiskReport('');
    router.back();
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

        const newPage = {
          uri: result.assets[0].uri,
          text: fullText,
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

        const newPage = {
          uri: result.assets[0].uri,
          text: fullText,
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
        const fullText = await extractTextFromImage(file.uri);

        const newPage = {
          uri: file.uri,
          text: fullText,
        };

        setScannedPages([...scannedPages, newPage]);
        console.log('[FILE] Image file processed successfully');
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
