import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Alert, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceFetcher } from 'react-native-executorch';
import { ModelSelector } from '../components/ModelSelector';
import { useDownloadedModels } from '../hooks/useDownloadedModels';
import { AVAILABLE_MODELS } from '../constants/models';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PrimaryButton } from '../components/PrimaryButton';

interface ScannerScreenProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onBack?: () => void;
  onScanComplete: (type: 'camera' | 'gallery') => void;
}

export function ScannerScreen({
  selectedModelId,
  onSelectModel,
  onBack,
  onScanComplete,
}: ScannerScreenProps) {
  const [backgroundDownloadProgress, setBackgroundDownloadProgress] = useState<number>(0);
  const [isBackgroundDownloading, setIsBackgroundDownloading] = useState(false);
  const previousModelRef = useRef<string | null>(null);

  // Get the selected model configuration
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  // Track which models are downloaded
  const { isModelDownloaded, refresh: refreshDownloadedModels, isLoading: isCheckingDownloads } = useDownloadedModels();

  // Track model selection changes
  useEffect(() => {
    if (previousModelRef.current && previousModelRef.current !== selectedModelId) {
      console.log(`[MODEL CHANGE] User changed model selection: ${previousModelRef.current} -> ${selectedModelId}`);
    }
    previousModelRef.current = selectedModelId;
  }, [selectedModelId]);

  // Handle model selection - downloads model if needed
  const handleModelSelect = async (modelId: string) => {
    try {
      console.log(`[MODEL SELECT] User attempting to select: ${modelId}`);

      // Prevent switching during background download
      if (isBackgroundDownloading) {
        console.log('[MODEL SELECT] Blocked - model downloading');
        Alert.alert(
          "Download in Progress",
          "Please wait for the current model download to complete.",
          [{ text: "OK" }]
        );
        return;
      }

      if (selectedModelId !== modelId) {
        console.log('[MODEL SELECT] User selected model:', modelId);
        onSelectModel(modelId);

        // Check if the new model needs to be downloaded
        const newModel = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (newModel) {
          if (isCheckingDownloads) {
            console.log('[MODEL SELECT] Waiting for download check to complete...');
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          const isDownloaded = isModelDownloaded(newModel.model.modelSource);
          console.log(`[MODEL SELECT] Download check result for ${newModel.name}: ${isDownloaded}`);

          if (!isDownloaded) {
            console.log('[MODEL SELECT] Model not downloaded, starting download...');

            Alert.alert(
              "Download Model?",
              `${newModel.name} is not downloaded. Would you like to download it now?`,
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Download",
                  onPress: async () => {
                    try {
                      setIsBackgroundDownloading(true);
                      setBackgroundDownloadProgress(0);
                      console.log('[DOWNLOAD] Starting background download...');

                      await ResourceFetcher.fetch(
                        (progress) => {
                          console.log(`[DOWNLOAD] Progress: ${(progress * 100).toFixed(1)}%`);
                          setBackgroundDownloadProgress(progress);
                        },
                        newModel.model.modelSource,
                        newModel.model.tokenizerSource,
                        newModel.model.tokenizerConfigSource
                      );

                      console.log('[DOWNLOAD] Download complete!');
                      setIsBackgroundDownloading(false);
                      setBackgroundDownloadProgress(0);

                      await refreshDownloadedModels();

                      Alert.alert(
                        "Download Complete",
                        `${newModel.name} is ready to use!`,
                        [{ text: "OK" }]
                      );
                    } catch (error) {
                      console.error('[DOWNLOAD] Download failed:', error);
                      setIsBackgroundDownloading(false);
                      setBackgroundDownloadProgress(0);
                      Alert.alert(
                        "Download Failed",
                        "Failed to download the model. Please try again.",
                        [{ text: "OK" }]
                      );
                    }
                  }
                }
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error('[MODEL SELECT] CRASH CAUGHT:', error);
      Alert.alert("Error", "An error occurred. Please restart the app.");
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {onBack && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Pocket Paralegal ⚖️</Text>
              <Text style={styles.subtitle}>Powered by Arm ExecuTorch</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.center}>
            <Text style={styles.instruction}>
              Scan a contract to find hidden risks instantly.
            </Text>

            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={handleModelSelect}
              disabled={false}
              loadingMessage={'Select your AI model'}
              isModelDownloaded={isModelDownloaded}
            />

            <View style={styles.scanButtonsContainer}>
              <PrimaryButton
                onPress={() => onScanComplete('camera')}
                disabled={isBackgroundDownloading}
                text={'Take Photo'}
              />
              <PrimaryButton
                onPress={() => onScanComplete('gallery')}
                disabled={isBackgroundDownloading}
                text={'Select from Gallery'}
              />
            </View>

            {isBackgroundDownloading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Downloading Model...</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.round(backgroundDownloadProgress * 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(backgroundDownloadProgress * 100)}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2332' },
  header: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, backgroundColor: '#1a2332' },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitles: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255, 255, 255, 0.7)', marginTop: 2, fontSize: 12 },
  content: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instruction: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#1a2332' },
  scanButtonsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#1a2332',
    marginBottom: 10,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#d4a574',
    borderRadius: 9999,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
