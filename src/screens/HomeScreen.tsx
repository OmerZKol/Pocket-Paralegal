import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppContext } from '../contexts/AppContext';

export function HomeScreen() {
  const router = useRouter();
  const { setScannedPages, setRiskReport } = useAppContext();

  const handleGetStarted = () => {
    console.log('[GET STARTED] Button clicked, navigating to scanner');
    // Reset shared state
    setScannedPages([]);
    setRiskReport('');
    router.push('/scanner' as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <FontAwesome5 name="balance-scale" size={32} color="#1a2332" />
          </View>
          <Text style={styles.heroTitle}>Pocket Paralegal</Text>
          <Text style={styles.heroSubtitle}>
            Privacy and security focused AI-powered contract analysis. No data leaves your device.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome5 name="camera" size={24} color="#6b7280" />
              </View>
              <Text style={styles.featureTitle}>Scan Documents</Text>
              <Text style={styles.featureDescription}>
                Capture via camera, gallery, or PDFs
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome5 name="robot" size={24} color="#6b7280" />
              </View>
              <Text style={styles.featureTitle}>On-Device AI</Text>
              <Text style={styles.featureDescription}>
                Powered by a fully local AI model
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome5 name="exclamation-triangle" size={24} color="#6b7280" />
              </View>
              <Text style={styles.featureTitle}>Risk Detection</Text>
              <Text style={styles.featureDescription}>
                Identify unfavorable terms and clauses
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome5 name="lock" size={24} color="#6b7280" />
              </View>
              <Text style={styles.featureTitle}>Private & Secure</Text>
              <Text style={styles.featureDescription}>
                Your data stays on device
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Select your preferred AI model</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Scan with camera, upload images, or select PDF files</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Review and add more pages if needed</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>Get instant AI-powered risk analysis</Text>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <PrimaryButton
            onPress={handleGetStarted}
            disabled={false}
            text="Get Started"
          />
          <Text style={styles.disclaimer}>
            Disclaimer: This app is for informational purposes only and does not constitute legal advice. Always consult with a qualified attorney for legal matters.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: '#1a2332',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    marginBottom: -24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a2332',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a2332',
    marginBottom: 16,
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d4a574',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#1a2332',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#1a2332',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 2,
    paddingBottom: 6,
    paddingTop: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
