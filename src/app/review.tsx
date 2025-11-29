import React from 'react';
import { useRouter, Href } from 'expo-router';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import { ReviewScreen } from '../screens/ReviewScreen';
import { useAppContext } from '../contexts/AppContext';

export default function Review() {
  const router = useRouter();
  const { scannedPages, setScannedPages, setRiskReport } = useAppContext();

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

  const handleAnalyze = async () => {
    console.log('[ANALYZE] User clicked analyze button');

    // Clear previous analysis results
    setRiskReport('');

    // Navigate to analyzing screen
    router.push('/analyzing' as Href);
  };

  return (
    <ReviewScreen
      scannedPages={scannedPages}
      onBack={handleBack}
      onRemovePage={handleRemovePage}
      onAddPage={addPageWithCamera}
      onAddFromGallery={addPageFromGallery}
      onAnalyze={handleAnalyze}
    />
  );
}
