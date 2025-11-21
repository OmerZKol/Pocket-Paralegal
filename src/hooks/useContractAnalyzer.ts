import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import type { LLMType } from 'react-native-executorch';
import type { ScanStep } from './useContractScanner';

export function useContractAnalyzer(llm: LLMType, step: ScanStep) {
  const [riskReport, setRiskReport] = useState('');
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Sync the LLM response to our risk report state
  useEffect(() => {
    if (isMountedRef.current && step === 'analyzing' && llm.response) {
      setRiskReport(llm.response);
    }
    // When generation completes, update step to 'done'
    // Note: The step update is handled in the parent component
  }, [llm.response, step]);

  const analyzeContract = async (text: string, setStep: (step: ScanStep) => void) => {
    if (!isMountedRef.current) return;

    if (!llm.isReady) {
      Alert.alert("Model Loading", "Please wait for the AI model to finish loading.");
      setStep('idle');
      return;
    }

    setStep('analyzing');

    // The "System Prompt" - We program the AI to be a lawyer here.
    const systemPrompt = `
      You are an expert lawyer. Review the following contract text.
      Identify exactly 3 risky clauses (e.g., hidden fees, data privacy, arbitration).
      Format your answer as a bulleted list. Keep it simple.

      Contract Text:
      "${text.substring(0, 6000)}"
    `; // Note: Truncate to fit context window if necessary, though Llama 3.2 handles 128k.

    try {
      if (!isMountedRef.current) return;

      setRiskReport(''); // Clear previous response
      await llm.generate([
        { role: 'user', content: systemPrompt }
      ]);
      // The response is accumulated in llm.response via the token callback
      // We'll use an effect to monitor when generation completes
    } catch (e) {
      console.error('Contract analysis error:', e);

      if (!isMountedRef.current) return;

      const errorMessage = e instanceof Error ? e.message : 'Failed to analyze text.';
      Alert.alert("AI Error", errorMessage);
      setStep('idle');
    }
  };

  return {
    riskReport,
    analyzeContract,
    isGenerating: llm.isGenerating,
  };
}
