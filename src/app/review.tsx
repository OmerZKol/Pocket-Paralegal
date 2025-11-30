import React, { useState } from 'react';
import { useRouter, Href } from 'expo-router';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import { ReviewScreen } from '../screens/ReviewScreen';
import { useAppContext } from '../contexts/AppContext';
import { extractTextFromImage, isPDFFile } from '../utils/pdfProcessor';
import { PDFProcessorModal, PDFOCRPage } from '../components/PDFProcessorModal';

export default function Review() {
  const router = useRouter();
  const { scannedPages, setScannedPages, setRiskReport } = useAppContext();
  const [pdfProcessing, setPdfProcessing] = useState<{ visible: boolean; uri: string }>({
    visible: false,
    uri: '',
  });

  const handleBack = () => {
    setScannedPages([]);
    setRiskReport('');
    router.back();
  };

  const handleRemovePage = (index: number) => {
    setScannedPages(scannedPages.filter((_, i) => i !== index));
  };

  const addPageWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required.');
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
      }
    } catch (error) {
      console.error('Document scanning error:', error);
      Alert.alert('Error', 'Failed to scan document.');
    }
  };

  const addPageFromGallery = async () => {
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
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const addFileFromDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      if (isPDFFile(file.uri, file.mimeType)) {
        console.log('[FILE] Processing PDF file with OCR');
        // Start PDF OCR processing
        setPdfProcessing({ visible: true, uri: file.uri });
      } else {
        const fullText = await extractTextFromImage(file.uri);

        const newPage = {
          uri: file.uri,
          text: fullText,
        };

        setScannedPages([...scannedPages, newPage]);
      }
    } catch (error) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to process file.');
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
  };

  const handlePDFProcessingError = (error: string) => {
    console.error('[PDF OCR] Processing error:', error);
    Alert.alert('PDF Processing Error', error);
    setPdfProcessing({ visible: false, uri: '' });
  };

  const handleAnalyze = async () => {
    console.log('[ANALYZE] User clicked analyze button');

    // Clear previous analysis results
    setRiskReport('');

    // Navigate to analyzing screen
    router.push('/analyzing' as Href);
  };

  return (
    <>
      <ReviewScreen
        scannedPages={scannedPages}
        onBack={handleBack}
        onRemovePage={handleRemovePage}
        onAddPage={addPageWithCamera}
        onAddFromGallery={addPageFromGallery}
        onAddFromFile={addFileFromDocumentPicker}
        onAnalyze={handleAnalyze}
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
