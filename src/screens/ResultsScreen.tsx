import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { CitationModal } from '../components/CitationModal';
import { Citation, ScannedPage } from '../contexts/AppContext';

interface ResultsScreenProps {
  riskReport: string;
  citations: Citation[];
  scannedPages: ScannedPage[];
  onBack: () => void;
  onStartOver: () => void;
}

export function ResultsScreen({
  riskReport,
  citations,
  scannedPages,
  onBack,
  onStartOver,
}: ResultsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Function to render text with clickable citations
  const renderTextWithCitations = (text: string, textStyle: any) => {
    // Match citations in format: [CITE: "quote"] or (CITE: "quote")
    const citationRegex = /[\[\(]CITE:\s*"([^"]+)"\s*[\]\)]/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;
    let citationIndex = 0;

    while ((match = citationRegex.exec(text)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Find matching citation object by quote
      const quote = match[1];
      const citation = citations.find(c => c.quote === quote);

      // Add clickable citation
      if (citation) {
        parts.push(
          <TouchableOpacity
            key={`citation-${citationIndex}`}
            onPress={() => setSelectedCitation(citation)}
            style={styles.citationButton}
          >
            <Text style={styles.citationText}>[Citation: Page {citation.pageIndex + 1}]</Text>
          </TouchableOpacity>
        );
      } else {
        // Fallback if citation not found
        parts.push('[Citation]');
      }

      lastIndex = match.index + match[0].length;
      citationIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // If no citations found, just return the text
    if (parts.length === 0) {
      return <Text style={textStyle}>{text}</Text>;
    }

    return (
      <Text style={textStyle}>
        {parts.map((part, index) =>
          typeof part === 'string' ? part : <React.Fragment key={index}>{part}</React.Fragment>
        )}
      </Text>
    );
  };

  // Parse the new markdown-formatted report
  const parseReport = (report: string) => {
    const lines = report.split('\n');
    let documentType = '';
    let summary = '';
    const criticalClauses: string[] = [];
    const recommendedAdditions: string[] = [];
    let currentSection = 'none';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect H2 heading: ## Document Analysis: [Type]
      if (trimmed.startsWith('## Document Analysis:')) {
        documentType = trimmed.replace('## Document Analysis:', '').trim();
        continue;
      }

      // Detect H3 section headers
      if (trimmed.startsWith('### Summary')) {
        currentSection = 'summary';
        continue;
      } else if (trimmed.startsWith('### Critical Missing Clauses')) {
        currentSection = 'critical';
        continue;
      } else if (trimmed.startsWith('### Recommended Additions')) {
        currentSection = 'recommended';
        continue;
      }

      // Parse bullet points with bold clause names: * **[Name]**: Description
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const text = trimmed.substring(1).trim();
        if (currentSection === 'critical') {
          criticalClauses.push(text);
        } else if (currentSection === 'recommended') {
          recommendedAdditions.push(text);
        }
      } else if (currentSection === 'summary') {
        summary += trimmed + ' ';
      }
    }

    return {
      documentType: documentType || 'Contract Analysis',
      summary: summary.trim(),
      criticalClauses,
      recommendedAdditions
    };
  };

  const { documentType, summary, criticalClauses, recommendedAdditions } = parseReport(riskReport);

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
        {/* Document Type Header */}
        {documentType && (
          <View style={styles.documentTypeCard}>
            <View style={styles.cardHeaderTop}>
              <Ionicons name="document" size={20} color="#d4a574" />
              <Text style={styles.documentTypeText}>{documentType}</Text>
            </View>
          </View>
        )}

        {/* Summary Section */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#1a2332" />
              <Text style={styles.cardTitle}>Summary</Text>
            </View>
            {renderTextWithCitations(summary, styles.summaryText)}
          </View>
        )}

        {/* Critical Missing Clauses Section */}
        {criticalClauses.length > 0 && (
          <View style={styles.riskCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={20} color="#dc2626" />
              <Text style={styles.riskTitle}>Critical Missing Clauses</Text>
              <View style={styles.countBadge}>
                <Text style={styles.badgeText}>{criticalClauses.length}</Text>
              </View>
            </View>
            {criticalClauses.map((clause, index) => {
              // Parse bold clause name: **[Name]**: Description
              const match = clause.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
              if (match) {
                return (
                  <View key={index} style={styles.clauseItem}>
                    <View style={styles.bulletDot} />
                    <View style={styles.clauseContent}>
                      <Text style={styles.clauseName}>{match[1]}</Text>
                      {renderTextWithCitations(match[2], styles.clauseDescription)}
                    </View>
                  </View>
                );
              }
              return (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  {renderTextWithCitations(clause, styles.bulletText)}
                </View>
              );
            })}
          </View>
        )}

        {/* Recommended Additions Section */}
        {recommendedAdditions.length > 0 && (
          <View style={styles.warningCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb-outline" size={20} color="#92400e" />
              <Text style={styles.warningTitle}>Recommended Additions</Text>
              <View style={[styles.countBadge, styles.warningBadge]}>
                <Text style={styles.warningBadgeText}>{recommendedAdditions.length}</Text>
              </View>
            </View>
            {recommendedAdditions.map((addition, index) => {
              // Parse bold clause name: **[Name]**: Description
              const match = addition.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
              if (match) {
                return (
                  <View key={index} style={styles.clauseItem}>
                    <View style={[styles.bulletDot, styles.warningDot]} />
                    <View style={styles.clauseContent}>
                      <Text style={styles.clauseName}>{match[1]}</Text>
                      {renderTextWithCitations(match[2], styles.clauseDescription)}
                    </View>
                  </View>
                );
              }
              return (
                <View key={index} style={styles.bulletItem}>
                  <View style={[styles.bulletDot, styles.warningDot]} />
                  {renderTextWithCitations(addition, styles.bulletText)}
                </View>
              );
            })}
          </View>
        )}

        {/* If no structured data, show raw report */}
        {criticalClauses.length === 0 && recommendedAdditions.length === 0 && !summary && (
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

      {/* Citation Modal */}
      <CitationModal
        visible={selectedCitation !== null}
        citation={selectedCitation}
        scannedPages={scannedPages}
        onClose={() => setSelectedCitation(null)}
      />
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
  documentTypeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4a574',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  documentTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2332',
    // flex: 1, //uncomment to push text to the left
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
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clauseItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  clauseContent: {
    flex: 1,
  },
  clauseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2332',
    marginBottom: 4,
  },
  clauseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
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
    borderTopColor: '#cccccc',
  },
  citationButton: {
    display: 'inline-flex' as any,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    borderWidth: 1,
    borderColor: '#d4a574',
  },
  citationText: {
    fontSize: 13,
    color: '#d4a574',
    fontWeight: '600',
  },
});
