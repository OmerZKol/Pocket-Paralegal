import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

interface HomePageProps {
  onGetStarted: () => void;
}

export function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroSection}>
        <View style={styles.iconBadge}>
          <Text style={styles.heroIcon}>⚖️</Text>
        </View>
        <Text style={styles.heroTitle}>Pocket Paralegal</Text>
        <Text style={styles.heroSubtitle}>
          AI-powered contract analysis with complete privacy. No data leaves your device.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📸</Text>
            </View>
            <Text style={styles.featureTitle}>Scan Documents</Text>
            <Text style={styles.featureDescription}>
              Capture contracts via camera or gallery
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🤖</Text>
            </View>
            <Text style={styles.featureTitle}>On-Device AI</Text>
            <Text style={styles.featureDescription}>
              Powered by Llama 3.2 locally
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>⚠️</Text>
            </View>
            <Text style={styles.featureTitle}>Risk Detection</Text>
            <Text style={styles.featureDescription}>
              Identify unfavorable terms
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🔒</Text>
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
          <Text style={styles.stepText}>Scan or upload contract pages</Text>
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
          onPress={onGetStarted}
          disabled={false}
          text="Get Started"
        />
        <Text style={styles.disclaimer}>
          Disclaimer: This app is for informational purposes only and does not constitute legal advice. Always consult with a qualified attorney for legal matters.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: '#1a2332', // Professional navy blue
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    marginBottom: -24, // Overlap with feature cards
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#d4a574', // Gold/amber accent
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    fontSize: 32,
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
    paddingHorizontal: 20,
    marginBottom: 30,
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
  featureIcon: {
    fontSize: 20,
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
    marginBottom: 30,
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
    backgroundColor: '#d4a574', // Gold/amber accent
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
    paddingBottom: 32,
    paddingTop: 24,
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
