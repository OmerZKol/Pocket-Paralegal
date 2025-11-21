import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Button, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLLM, ResourceFetcher } from 'react-native-executorch';
import { ModelSelector } from '../components/ModelSelector';
import { useContractScanner } from '../hooks/useContractScanner';
import { useContractAnalyzer } from '../hooks/useContractAnalyzer';
import { useDownloadedModels } from '../hooks/useDownloadedModels';
import { AVAILABLE_MODELS } from '../constants/models';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PrimaryButton } from '../components/PrimaryButton';

export default function Index() {
  const [selectedModelId, setSelectedModelId] = useState('llama-3.2-1b');
  const [preventModelLoad, setPreventModelLoad] = useState(true); // Start with model NOT loaded
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  const [backgroundDownloadProgress, setBackgroundDownloadProgress] = useState<number>(0);
  const [isBackgroundDownloading, setIsBackgroundDownloading] = useState(false);
  const previousModelRef = useRef<string | null>(null);
  const memoryCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unloadDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the selected model configuration
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  // Log initial memory state
  useEffect(() => {
    console.log('=== APP MOUNTED ===');

    return () => {
      console.log('=== APP UNMOUNTING ===');
      if (memoryCheckIntervalRef.current) {
        clearInterval(memoryCheckIntervalRef.current);
      }
      if (unloadDelayRef.current) {
        clearTimeout(unloadDelayRef.current);
      }
    };
  }, []);

  // Track which models are downloaded (must be declared before using in effects)
  const { isModelDownloaded, refresh: refreshDownloadedModels, isLoading: isCheckingDownloads } = useDownloadedModels();

  // Initialize the Arm-optimized LLM with preventLoad control
  const llm = useLLM({
    model: selectedModel.model,
    preventLoad: preventModelLoad,
  });

  // Contract scanning logic
  const { step, setStep, scanDocument } = useContractScanner();

  // Contract analysis logic
  const { riskReport, analyzeContract, isGenerating } = useContractAnalyzer(llm, step);

  // Monitor LLM state changes
  useEffect(() => {
    console.log(`[LLM STATE] isReady: ${llm.isReady}, isGenerating: ${llm.isGenerating}, downloadProgress: ${(llm.downloadProgress * 100).toFixed(1)}%`);

    if (llm.isReady) {
      console.log('=== MODEL LOADED SUCCESSFULLY ===');

      // Refresh downloaded models list after successful load
      console.log('[MODEL LOAD] Refreshing downloaded models list...');
      refreshDownloadedModels();

      // If we were downloading for a scan, mark as complete
      if (isDownloadingModel) {
        console.log('[MODEL LOAD] Model loaded after scan request, ready to proceed');
        setIsDownloadingModel(false);
      }
    }

    if (llm.error) {
      console.error('[LLM ERROR]', llm.error);
    }
  }, [llm.isReady, llm.isGenerating, llm.downloadProgress, llm.error, refreshDownloadedModels, isDownloadingModel]);

  // Track model selection changes
  useEffect(() => {
    if (previousModelRef.current && previousModelRef.current !== selectedModelId) {
      console.log(`[MODEL CHANGE] User changed model selection: ${previousModelRef.current} -> ${selectedModelId}`);

      // Unload any currently loaded model
      if (llm.isReady) {
        console.log('[MODEL CHANGE] Unloading previously loaded model');
        setPreventModelLoad(true);
      }

      // Reset to idle state when switching models
      if (step !== 'idle') {
        console.log(`[MODEL CHANGE] Resetting step from ${step} to idle`);
        setStep('idle');
      }
    }
    previousModelRef.current = selectedModelId;
  }, [selectedModelId, step, setStep, llm.isReady]);

  // Handle model selection - downloads model if needed, but doesn't load it
  const handleModelSelect = async (modelId: string) => {
    try {
      console.log(`[MODEL SELECT] User attempting to select: ${modelId}`);

      // Prevent switching during analysis
      if (step === 'analyzing') {
        console.log('[MODEL SELECT] Blocked - analysis in progress');
        Alert.alert(
          "Analysis in Progress",
          "Cannot change model while analyzing. Please wait for completion or go back.",
          [{ text: "OK" }]
        );
        return;
      }

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

      // Allow switching during download or when model is loaded
      if (selectedModelId !== modelId) {
        console.log('[MODEL SELECT] User selected model:', modelId);

        // If a model is currently loaded, unload it first
        if (llm.isReady) {
          console.log('[MODEL SELECT] Unloading current model...');
          setPreventModelLoad(true);
        }

        setSelectedModelId(modelId);

        // Check if the new model needs to be downloaded
        const newModel = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (newModel) {
          // Wait for download check to complete if still loading
          if (isCheckingDownloads) {
            console.log('[MODEL SELECT] Waiting for download check to complete...');
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          const isDownloaded = isModelDownloaded(newModel.model.modelSource);
          console.log(`[MODEL SELECT] Download check result for ${newModel.name}: ${isDownloaded}`);

          if (!isDownloaded) {
            console.log('[MODEL SELECT] Model not downloaded, starting download...');

            // Show confirmation dialog
            Alert.alert(
              "Download Model?",
              `${newModel.name} is not downloaded. Would you like to download it now? The model will be ready for use after download.`,
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Download",
                  onPress: async () => {
                    try {
                      setIsBackgroundDownloading(true);
                      setBackgroundDownloadProgress(0);
                      console.log('[DOWNLOAD] Starting background download...');

                      // Download all model files (model, tokenizer, tokenizer config)
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

                      // Refresh the downloaded models list
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
          } else {
            console.log('[MODEL SELECT] Model already downloaded, ready for use');
          }
        }
      }
    } catch (error) {
      console.error('[MODEL SELECT] CRASH CAUGHT:', error);
      Alert.alert("Error", "An error occurred. Please restart the app.");
    }
  };

  // Handle document scanning and analysis
  const handleScanDocument = async () => {
    console.log('[SCAN] handleScanDocument called');

    // Step 1: Load the model if it's not already loaded
    if (!llm.isReady) {
      console.log('[SCAN] Model not loaded, loading now...');
      setIsDownloadingModel(true);
      setPreventModelLoad(false); // Allow the model to load

      // Wait for model to be ready
      console.log('[SCAN] Waiting for model to load...');
      // The model will load automatically when preventModelLoad becomes false
      // We'll continue once llm.isReady becomes true
      return; // Exit and let the useEffect handle the rest
    }

    // Model is ready, proceed with scan

    console.log('[SCAN] Starting document scan');
    const text = await scanDocument();

    if (text) {
      console.log(`[SCAN] Document scanned successfully, text length: ${text.length}`);
      await analyzeContract(text, setStep);
      console.log('[ANALYZE] Analysis complete');
    } else {
      console.log('[SCAN] No text returned from scan');
    }
  };

  // Monitor when generation completes
  useEffect(() => {
    if (step === 'analyzing' && !isGenerating && llm.response) {
      console.log('[GENERATE] Generation complete, transitioning to done');
      console.log(`[GENERATE] Response length: ${llm.response.length}`);
      setStep('done');
    }
  }, [step, isGenerating, llm.response]);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Pocket Paralegal ⚖️</Text>
          <Text style={styles.subtitle}>Powered by Arm ExecuTorch</Text>
        </View>

        <View style={styles.content}>
          {step === 'idle' && (
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
              <PrimaryButton
                onPress={handleScanDocument}
                disabled={false}
                text={'Scan Document (Camera)'}
              />

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

              {isDownloadingModel && !llm.isReady && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading Model...</Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.round(llm.downloadProgress * 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(llm.downloadProgress * 100)}%
                  </Text>
                </View>
              )}

            </View>
          )}

          {step === 'scanning' && (
            <ActivityIndicator size="large" color="#0000ff" />
          )}

          {step === 'analyzing' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.status}>
                Reading Contract...{'\n'}
                Running Llama 3.2 locally...
              </Text>
            </View>
          )}

          {step === 'done' && (
            <ScrollView style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>Risk Report</Text>
              {riskReport.split('\n').map((line, index) => {
                // Handle bullet points (lines starting with * or -)
                if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                  const text = line.trim().substring(1).trim();
                  return (
                    <View key={index} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{text}</Text>
                    </View>
                  );
                }
                // Handle numbered lists
                else if (/^\d+\./.test(line.trim())) {
                  const match = line.trim().match(/^(\d+)\.\s*(.*)$/);
                  if (match) {
                    return (
                      <View key={index} style={styles.bulletItem}>
                        <Text style={styles.numberPoint}>{match[1]}.</Text>
                        <Text style={styles.bulletText}>{match[2]}</Text>
                      </View>
                    );
                  }
                }
                // Regular text or headers
                else if (line.trim()) {
                  return (
                    <Text key={index} style={styles.reportText}>
                      {line.trim()}
                    </Text>
                  );
                }
                // Empty line for spacing
                return <View key={index} style={styles.spacing} />;
              })}

              <View style={styles.footerButtons}>
                <PrimaryButton
                onPress={() => setStep('idle')}
                disabled={false}
                text={'Scan Another Document'}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c3e50' },
  header: { padding: 10, backgroundColor: '#2c3e50', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#bdc3c7', marginTop: 5 },
  content: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instruction: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  status: { marginTop: 20, fontSize: 16, textAlign: 'center' },
  resultContainer: { flex: 1 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10 },
  reportText: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 8 },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 10,
  },
  bulletPoint: {
    fontSize: 20,
    lineHeight: 24,
    color: '#e74c3c',
    marginRight: 10,
    fontWeight: 'bold',
  },
  numberPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e74c3c',
    marginRight: 10,
    fontWeight: 'bold',
    minWidth: 25,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  spacing: {
    height: 8,
  },
  footerButtons: { marginTop: 30, marginBottom: 50 },
  debug: { textAlign: 'center', color: '#7f8c8d', marginBottom: 14, fontSize: 15 },
  scanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
});
