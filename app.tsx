import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Button, ScrollView, 
  ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MlkitOcr, { MlkitOcrResult } from 'react-native-mlkit-ocr';
import { useLLM, LLAMA3_2_1B } from 'react-native-executorch';

export default function App() {
  const [step, setStep] = useState<'idle' | 'scanning' | 'analyzing' | 'done'>('idle');
  const [contractText, setContractText] = useState('');
  const [riskReport, setRiskReport] = useState('');
  const [result, setResult] = React.useState<MlkitOcrResult | undefined>();

  // 1. Initialize the Arm-optimized LLM (Llama 3.2 1B)
  // This automatically handles the XNNPACK delegate for Arm chips.
  const llm = useLLM({
    model: LLAMA3_2_1B,
    // Optional: Adjust temperature for more precise/legal answers
    // temperature: 0.3
  });

  // Sync the LLM response to our risk report state
  React.useEffect(() => {
    if (step === 'analyzing' && llm.response) {
      setRiskReport(llm.response);
    }
    // When generation completes, update step to 'done'
    if (step === 'analyzing' && !llm.isGenerating && llm.response) {
      setStep('done');
    }
  }, [llm.response, llm.isGenerating, step]);

  // 2. The "Eyes": Capture Image & Extract Text
  const scanDocument = async () => {
    try {
      setStep('scanning');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        // Run on-device OCR
        const processed = await MlkitOcr.detectFromUri(result.assets[0].uri);
        setResult(processed);

        // Join all blocks into one massive string
        const fullText = processed.map((block) => block.text).join('\n');
        console.log("Full Extracted Text:", fullText);

        setContractText(fullText);
        analyzeContract(fullText);
      } else {
        setStep('idle');
      }
    } catch (e) {
      Alert.alert("Error", "Failed to scan document.");
      setStep('idle');
    }
  };

  // 3. The "Brain": Analyze using Context Injection
  const analyzeContract = async (text: string) => {
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
      setRiskReport(''); // Clear previous response
      await llm.generate([
        { role: 'user', content: systemPrompt }
      ]);
      // The response is accumulated in llm.response via the token callback
      // We'll use an effect to monitor when generation completes
    } catch (e) {
      Alert.alert("AI Error", "Failed to analyze text.");
      setStep('idle');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Button title="Scan Document (Camera)" onPress={scanDocument} />
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
            <Text style={styles.sectionTitle}>⚠️ Risk Report</Text>
            <Text style={styles.reportText}>{riskReport}</Text>
            
            <View style={styles.footerButtons}>
              <Button title="Scan Another" onPress={() => setStep('idle')} />
            </View>
          </ScrollView>
        )}
      </View>
      
      {/* Debug Info for Judges */}
      <Text style={styles.debug}>
        Model Ready: {llm.isReady ? "✅" : "⏳"} | Device: Arm64
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#2c3e50', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#bdc3c7', marginTop: 5 },
  content: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instruction: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  status: { marginTop: 20, fontSize: 16, textAlign: 'center' },
  resultContainer: { flex: 1 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10 },
  reportText: { fontSize: 16, lineHeight: 24, color: '#333' },
  footerButtons: { marginTop: 30, marginBottom: 50 },
  debug: { textAlign: 'center', color: '#7f8c8d', marginBottom: 10, fontSize: 10 }
});