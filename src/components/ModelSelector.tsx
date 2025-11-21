import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { AVAILABLE_MODELS } from '../constants/models';

interface Model {
  id: string;
  name: string;
  description: string;
  model: {
    modelSource: string;
    tokenizerSource: string;
    tokenizerConfigSource: string;
  };
}

interface ModelSelectorProps {
  selectedModel: Model;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
  loadingMessage?: string;
  isModelDownloaded: (modelUrl: string) => boolean;
}

export function ModelSelector({ selectedModel, onSelectModel, disabled = false, loadingMessage, isModelDownloaded }: ModelSelectorProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.modelSelector, disabled && styles.modelSelectorDisabled]}
        onPress={handlePress}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text style={styles.modelSelectorLabel}>AI Model:</Text>
        <Text style={[styles.modelSelectorValue, disabled && styles.modelSelectorTextDisabled]}>
          {selectedModel.name}
        </Text>
        <Text style={styles.modelSelectorDescription}>
          {disabled && loadingMessage ? loadingMessage : selectedModel.description}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select AI Model</Text>
            <ScrollView style={styles.modelList}>
              {AVAILABLE_MODELS.map((model) => {
                const isDownloaded = isModelDownloaded(model.model.modelSource);
                const isSelected = selectedModel.id === model.id;

                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelOption,
                      isSelected && styles.modelOptionSelected
                    ]}
                    onPress={() => {
                      onSelectModel(model.id);
                      setShowPicker(false);
                    }}
                  >
                    <View style={styles.modelOptionContent}>
                      <View style={styles.modelOptionTextContainer}>
                        <Text style={styles.modelOptionName}>{model.name}</Text>
                        <Text style={styles.modelOptionDescription}>{model.description}</Text>
                      </View>
                      {isDownloaded ? (
                        <Text style={styles.modelReadyIcon}>✓</Text>
                      ) : (
                        <Text style={styles.modelDownloadIcon}>⬇</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modelSelector: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2c3e50',
    width: '100%',
    maxWidth: 300,
  },
  modelSelectorLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  modelSelectorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modelSelectorDescription: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 2,
  },
  modelSelectorDisabled: {
    opacity: 0.5,
    borderColor: '#95a5a6',
  },
  modelSelectorTextDisabled: {
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modelList: {
    maxHeight: 400,
  },
  modelOption: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelOptionSelected: {
    backgroundColor: '#e8f4f8',
    borderColor: '#2c3e50',
  },
  modelOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  modelOptionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modelOptionCheck: {
    position: 'absolute',
    right: 15,
    top: 15,
    fontSize: 24,
    color: '#2c3e50',
  },
  modelOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelOptionTextContainer: {
    flex: 1,
  },
  modelReadyIcon: {
    fontSize: 18,
    color: '#27ae60',
    marginLeft: 8,
  },
  modelDownloadIcon: {
    fontSize: 18,
    color: '#3498db',
    marginLeft: 8,
  },
  modalCloseButton: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
