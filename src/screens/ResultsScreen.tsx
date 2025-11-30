import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';

interface ResultsScreenProps {
  riskReport: string;
  onBack: () => void;
  onStartOver: () => void;
}

export function ResultsScreen({
  riskReport,
  onBack,
  onStartOver,
}: ResultsScreenProps) {
  // Parse the report to separate risks and warnings
  const insets = useSafeAreaInsets();
  const parseReport = (report: string) => {
    const lines = report.split('\n');
    let summary = '';
    const risks: string[] = [];
    const warnings: string[] = [];
    let currentSection = 'summary';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect section headers
      if (trimmed.toLowerCase().includes('risk') && trimmed.length < 50) {
        currentSection = 'risks';
        continue;
      } else if (trimmed.toLowerCase().includes('warning') && trimmed.length < 50) {
        currentSection = 'warnings';
        continue;
      } else if (trimmed.toLowerCase().includes('summary') && trimmed.length < 50) {
        currentSection = 'summary';
        continue;
      }

      // Parse bullet points
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const text = trimmed.substring(1).trim();
        if (currentSection === 'risks') {
          risks.push(text);
        } else if (currentSection === 'warnings') {
          warnings.push(text);
        }
      } else if (/^\d+\./.test(trimmed)) {
        const match = trimmed.match(/^\d+\.\s*(.*)$/);
        if (match) {
          if (currentSection === 'risks') {
            risks.push(match[1]);
          } else if (currentSection === 'warnings') {
            warnings.push(match[1]);
          }
        }
      } else if (currentSection === 'summary') {
        summary += trimmed + ' ';
      }
    }

    return { summary: summary.trim(), risks, warnings };
  };

  const { summary, risks, warnings } = parseReport(riskReport);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Analysis Results</Text>
            <Text style={styles.subtitle}>AI-Powered Risk Assessment</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Section */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color="#1a2332" />
              <Text style={styles.cardTitle}>Summary</Text>
            </View>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Risks Section */}
        {risks.length > 0 && (
          <View style={styles.riskCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={20} color="#dc2626" />
              <Text style={styles.riskTitle}>Potential Risks</Text>
              <View style={styles.countBadge}>
                <Text style={styles.badgeText}>{risks.length} found</Text>
              </View>
            </View>
            {risks.map((risk, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{risk}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle-outline" size={20} color="#92400e" />
              <Text style={styles.warningTitle}>Warnings</Text>
              <View style={[styles.countBadge, styles.warningBadge]}>
                <Text style={styles.warningBadgeText}>{warnings.length} found</Text>
              </View>
            </View>
            {warnings.map((warning, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={[styles.bulletDot, styles.warningDot]} />
                <Text style={styles.bulletText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* If no structured data, show raw report */}
        {risks.length === 0 && warnings.length === 0 && !summary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color="#1a2332" />
              <Text style={styles.cardTitle}>Analysis Report</Text>
            </View>
            {riskReport.split('\n').map((line, index) => {
              const trimmed = line.trim();
              if (!trimmed) return <View key={index} style={styles.spacing} />;

              if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                return (
                  <View key={index} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{trimmed.substring(1).trim()}</Text>
                  </View>
                );
              }

              return (
                <Text key={index} style={styles.reportText}>
                  {trimmed}
                </Text>
              );
            })}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only and does not constitute legal advice.
            Please consult with a qualified attorney for professional legal guidance.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom+4, 14) }]}>
        <PrimaryButton
          onPress={onStartOver}
          disabled={false}
          text="Analyze Another Document"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#1a2332',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontSize: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 16,
  },
  riskCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    padding: 16,
    marginBottom: 16,
  },
  warningCard: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2332',
    flex: 1,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  warningBadge: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  warningBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1a2332',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    marginTop: 7,
    marginRight: 12,
    flexShrink: 0,
  },
  warningDot: {
    backgroundColor: '#d4a574',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1a2332',
  },
  reportText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1a2332',
    marginBottom: 8,
  },
  spacing: {
    height: 8,
  },
  disclaimerCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
