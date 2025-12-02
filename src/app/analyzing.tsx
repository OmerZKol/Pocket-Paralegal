import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { LLMModule } from 'react-native-executorch';
import { useAppContext } from '../contexts/AppContext';
import { AVAILABLE_MODELS } from '../constants/models';
import { Prompts } from '../constants/prompt';
import { extractCitations } from '../utils/citationParser';

export default function Analyzing() {
  const router = useRouter();
  const { selectedModelId, scannedPages, setRiskReport, setCitations } = useAppContext();
  const [isModelReady, setIsModelReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localReport, setLocalReport] = useState('');

  // Get the selected model configuration
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  // Store the LLM instance
  const llmRef = useRef<LLMModule | null>(null);

  // Store the combined text once
  const combinedTextRef = useRef<string | null>(null);
  const hasStartedAnalysisRef = useRef(false);

  // Initialize LLM and load model on mount
  useEffect(() => {
    let isMounted = true;

    const initializeLLM = async () => {
      try {
        console.log('[MODEL] Initializing LLM...');

        // Get combined text with page numbers
        const combinedText = scannedPages.map((page, index) => {
          const pageNum = page.pageNumber || (index + 1);
          return `--- Page ${pageNum} ---\n${page.text}`;
        }).join('\n\n');
        combinedTextRef.current = combinedText;
        console.log('[ANALYSIS] Text prepared, length:', combinedText.length);

        // Create LLM instance with token callback
        console.log('[MODEL] Creating new LLMModule instance...');
        const llm = new LLMModule({
          tokenCallback: (token: string) => {
            if (isMounted) {
              setLocalReport((prev) => prev + token);
            }
          },
        });
        console.log('[MODEL] LLMModule instance created');

        llmRef.current = llm;

        // Load the model
        console.log('[MODEL] Loading model...');
        await llm.load(selectedModel.model, (progress: number) => {
          if (isMounted) {
            console.log('[MODEL] Download progress:', progress);
            setDownloadProgress(progress);
          }
        });

        if (!isMounted) return;

        console.log('[MODEL] Model loaded successfully');
        setIsModelReady(true);

        // Start analysis
        if (!hasStartedAnalysisRef.current && combinedTextRef.current) {
          hasStartedAnalysisRef.current = true;
          setIsGenerating(true);

          const text = combinedTextRef.current;
          console.log('[ANALYSIS] Starting analysis...');
          console.log(`[ANALYSIS] Analyzing combined text, length: ${text.length}`);

          // System prompt - Defines the AI's role and behavior
          // const systemPrompt = `You are an expert lawyer specialized in contract analysis. Your role is to review contracts and identify potential risks, hidden clauses, and problematic terms that could negatively impact the signing party.`;
          const systemPrompt = `You are an expoer lawyer specialized in contract analysis. Your goal is to protect the user by identifying risks and missing clauses in the provided text.`;

          // User prompt with the actual contract text
          // const systemPrompt = Prompts.basicPrompt;
          const userPrompt = Prompts.basicPrompt + text;

          const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPrompt }
          ];

          try {
            console.log('[ANALYSIS] Generating analysis with LLM...');
            await llm.generate(messages);
            console.log('[ANALYSIS] Generation complete');

            if (isMounted) {
              console.log('[ANALYSIS] Complete');
              setIsGenerating(false);
            }
          } catch (error) {
            console.error('[ANALYSIS] Error during analysis:', error);
            if (isMounted) {
              setIsGenerating(false);
              hasStartedAnalysisRef.current = false;
            }
          }
        }
      } catch (error) {
        console.error('[MODEL] Error loading model:', error);
      }
    };

    initializeLLM();

    // Cleanup function
    return () => {
      isMounted = false;
      // if (llmRef.current) {
      //   console.log('[MODEL] Cleaning up LLM instance...');
      //   try {
      //     llmRef.current.interrupt();
      //     llmRef.current.delete();
      //     console.log('[MODEL] Model deleted from memory');
      //   } catch (error) {
      //     console.error('[MODEL] Error cleaning up:', error);
      //   }
      //   llmRef.current = null;
      // }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Monitor analysis completion and navigate to results
  useEffect(() => {
    if (localReport && !isGenerating && isModelReady) {
      console.log('[ANALYSIS] Complete, extracting citations');

      // Extract citations from the report
      const extractedCitations = extractCitations(localReport, scannedPages);
      console.log(`[CITATIONS] Found ${extractedCitations.length} citations`);

      // Save the report and citations to context
      setRiskReport(localReport);
      setCitations(extractedCitations);

      // Delete model from memory before navigation
      // const llm = llmRef.current;
      // if (llm) {
      //   console.log('[MODEL] Deleting model from memory before navigation...');
      //   try {
      //     llm.interrupt();
      //     llm.delete();
      //     console.log('[MODEL] Model successfully deleted');
      //   } catch (error) {
      //     console.error('[MODEL] Error deleting model:', error);
      //   }
      //   llmRef.current = null;
      // }

      // Add a small delay to ensure deletion completes before navigation
      setTimeout(() => {
        router.replace('/results' as Href);
      }, 200);
    }
  }, [localReport, isGenerating, isModelReady, router, setRiskReport, setCitations, scannedPages]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.analyzingContainer}>
        <ActivityIndicator size="large" color="#1a2332" />
        {!isModelReady ? (
          <>
            <Text style={styles.analyzingText}>
              Loading AI Model...
            </Text>
            {downloadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.round(downloadProgress * 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.analyzingText}>
            Analysing Contract...{'\n'}
            Running AI model locally...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  analyzingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyzingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#1a2332',
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d4a574', // Gold/amber accent
    borderRadius: 9999,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
