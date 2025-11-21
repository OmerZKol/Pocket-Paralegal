import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MlkitOcr, { MlkitOcrResult } from 'react-native-mlkit-ocr';

export type ScanStep = 'idle' | 'scanning' | 'analyzing' | 'done';

export function useContractScanner() {
  const [step, setStep] = useState<ScanStep>('idle');
  const [contractText, setContractText] = useState('');
  const [result, setResult] = useState<MlkitOcrResult | undefined>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isMountedRef = useRef(true);

  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (isMountedRef.current) {
          setHasPermission(status === 'granted');
        }
      } catch (e) {
        console.error('Permission request error:', e);
        if (isMountedRef.current) {
          setHasPermission(false);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const scanDocument = async () => {
    try {
      // Check permissions first
      if (hasPermission === false) {
        Alert.alert(
          "Permission Required",
          "Camera access is required to scan documents. Please enable it in settings."
        );
        return null;
      }

      if (hasPermission === null) {
        Alert.alert("Loading", "Checking permissions...");
        return null;
      }

      setStep('scanning');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!isMountedRef.current) return null;

      if (!result.canceled) {
        // Run on-device OCR
        const processed = await MlkitOcr.detectFromUri(result.assets[0].uri);

        if (!isMountedRef.current) return null;

        setResult(processed);

        // Join all blocks into one massive string
        const fullText = processed.map((block) => block.text).join('\n');
        console.log("Full Extracted Text:", fullText);

        setContractText(fullText);
        return fullText;
      } else {
        if (isMountedRef.current) {
          setStep('idle');
        }
        return null;
      }
    } catch (e) {
      console.error('Document scanning error:', e);

      if (!isMountedRef.current) return null;

      const errorMessage = e instanceof Error ? e.message : 'Failed to scan document.';
      Alert.alert("Error", errorMessage);
      setStep('idle');
      return null;
    }
  };

  return {
    step,
    setStep,
    contractText,
    result,
    scanDocument,
  };
}
