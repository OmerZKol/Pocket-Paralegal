import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Image, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';

export interface ScannedPage {
  uri: string;
  text: string;
}

interface ReviewScreenProps {
  scannedPages: ScannedPage[];
  onBack: () => void;
  onRemovePage: (index: number) => void;
  onAddPage: () => void;
  onAddFromGallery: () => void;
  onAnalyze: () => void;
}

export function ReviewScreen({
  scannedPages,
  onBack,
  onRemovePage,
  onAddPage,
  onAddFromGallery,
  onAnalyze,
}: ReviewScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Review Pages</Text>
            <Text style={styles.subtitle}>Check your scanned documents</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.pageCountContainer}>
          <Text style={styles.pageCount}>
            {scannedPages.length} page{scannedPages.length !== 1 ? 's' : ''} scanned
          </Text>
        </View>

        {scannedPages.map((page, index) => (
          <View key={index} style={styles.pageCard}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageNumber}>Page {index + 1}</Text>
              <TouchableOpacity
                onPress={() => onRemovePage(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: page.uri }}
              style={styles.pageImage}
              resizeMode="contain"
            />
            <Text style={styles.pageTextPreview} numberOfLines={3}>
              {page.text}
            </Text>
          </View>
        ))}

        <View style={styles.actions}>
          <Text style={styles.addMoreText}>Add more pages:</Text>
          <View style={styles.addPageButtons}>
            <PrimaryButton
              onPress={onAddPage}
              disabled={false}
              text="Take Photo"
            />
            <PrimaryButton
              onPress={onAddFromGallery}
              disabled={false}
              text="From Gallery"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          onPress={onAnalyze}
          disabled={scannedPages.length === 0}
          text={`Analyze ${scannedPages.length} Page${scannedPages.length !== 1 ? 's' : ''}`}
        />
        <TouchableOpacity onPress={onBack} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  pageCountContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  pageCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2332',
  },
  pageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2332',
  },
  removeButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  pageTextPreview: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2332',
    marginBottom: 12,
  },
  addPageButtons: {
    gap: 12,
  },
  footer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
