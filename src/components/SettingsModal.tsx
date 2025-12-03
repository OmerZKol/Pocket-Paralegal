import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { File } from 'expo-file-system/next';
import { ResourceFetcher } from 'react-native-executorch';
import { AVAILABLE_MODELS } from '../constants/models';
import { useDownloadedModels } from '../hooks/useDownloadedModels';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ModelInfo {
  id: string;
  name: string;
  sizeBytes: number;
  filePaths: string[];
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const [downloadedModels, setDownloadedModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingModelId, setDeletingModelId] = useState<string | null>(null);
  const { refresh: refreshDownloadedModels } = useDownloadedModels();

  useEffect(() => {
    if (visible) {
      loadDownloadedModels();
    }
  }, [visible]);

  const loadDownloadedModels = async () => {
    setIsLoading(true);
    try {
      const allFiles = await ResourceFetcher.listDownloadedFiles();

      // Group files by model
      const modelMap = new Map<string, ModelInfo>();

      for (const filePath of allFiles) {
        // Find which model this file belongs to
        const model = AVAILABLE_MODELS.find(m => {
          const modelFilename = m.model.modelSource.split('/').pop() || '';
          const tokenizerFilename = m.model.tokenizerSource.split('/').pop() || '';
          const tokenizerConfigFilename = m.model.tokenizerConfigSource.split('/').pop() || '';

          return filePath.endsWith(modelFilename) ||
                 filePath.endsWith(tokenizerFilename) ||
                 filePath.endsWith(tokenizerConfigFilename);
        });

        if (model) {
          // Get file size using new File API
          try {
            const file = new File(filePath);
            const sizeBytes = file.size;

            if (modelMap.has(model.id)) {
              const existing = modelMap.get(model.id)!;
              existing.sizeBytes += sizeBytes;
              existing.filePaths.push(filePath);
            } else {
              modelMap.set(model.id, {
                id: model.id,
                name: model.name,
                sizeBytes,
                filePaths: [filePath],
              });
            }
          } catch (error) {
            console.warn('[SETTINGS] Could not get file size for:', filePath, error);
          }
        }
      }

      setDownloadedModels(Array.from(modelMap.values()));
    } catch (error) {
      console.error('[SETTINGS] Error loading downloaded models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleDeleteModel = (modelInfo: ModelInfo) => {
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete ${modelInfo.name}? This will free up ${formatFileSize(modelInfo.sizeBytes)} of storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteModel(modelInfo),
        },
      ]
    );
  };

  const confirmDeleteModel = async (modelInfo: ModelInfo) => {
    setDeletingModelId(modelInfo.id);
    try {
      // Delete all files associated with this model using new File API
      for (const filePath of modelInfo.filePaths) {
        try {
          const file = new File(filePath);
          file.delete();
          console.log('[SETTINGS] Deleted file:', filePath);
        } catch (error) {
          console.warn('[SETTINGS] Could not delete file:', filePath, error);
        }
      }

      // Immediately remove from local state
      setDownloadedModels(prev => prev.filter(m => m.id !== modelInfo.id));

      // Refresh the downloaded models cache for other components
      await refreshDownloadedModels();

      Alert.alert(
        'Model Deleted',
        `${modelInfo.name} has been removed from your device.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[SETTINGS] Error deleting model:', error);
      Alert.alert(
        'Delete Failed',
        'Failed to delete the model. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setDeletingModelId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Downloaded Models</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d4a574" />
                <Text style={styles.loadingText}>Loading models...</Text>
              </View>
            ) : downloadedModels.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="database" size={40} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyText}>No models downloaded yet</Text>
                <Text style={styles.emptySubtext}>
                  Download models from the scanner screen
                </Text>
              </View>
            ) : (
              downloadedModels.map((model) => (
                <View key={model.id} style={styles.modelCard}>
                  <View style={styles.modelInfo}>
                    <Text style={styles.modelName}>{model.name}</Text>
                    <Text style={styles.modelSize}>{formatFileSize(model.sizeBytes)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      deletingModelId === model.id && styles.deleteButtonDisabled,
                    ]}
                    onPress={() => handleDeleteModel(model)}
                    disabled={deletingModelId === model.id}
                  >
                    {deletingModelId === model.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  modelSize: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});
