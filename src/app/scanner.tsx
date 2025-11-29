import React from 'react';
import { useRouter, Href } from 'expo-router';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import { ScannerScreen } from '../screens/ScannerScreen';
import { useAppContext } from '../contexts/AppContext';

export default function Scanner() {
  const router = useRouter();
  const { selectedModelId, setSelectedModelId, scannedPages, setScannedPages, setRiskReport } = useAppContext();

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

  const handleScanComplete = async (type: 'camera' | 'gallery') => {
    console.log(`[SCAN] User clicked ${type} button, starting document scan`);

    if (type === 'camera') {
      await scanWithCamera();
    } else {
      await scanWithGallery();
    }

    console.log('[SCAN] Scan completed, navigating to review');
    router.push('/review' as Href);
  };

  return (
    <ScannerScreen
      selectedModelId={selectedModelId}
      onSelectModel={setSelectedModelId}
      onBack={handleBack}
      onScanComplete={handleScanComplete}
    />
  );
}
