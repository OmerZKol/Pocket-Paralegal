import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface PrimaryButtonProps {
  text?: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ onPress, disabled, text }: PrimaryButtonProps) {
  const isDisabled = disabled;

  const getButtonText = () => {
    return text || 'Scan Document (Camera)';
  };

  const showSpinner = false;

  return (
    <TouchableOpacity
      style={[
        styles.scanButton,
        isDisabled && styles.scanButtonDisabled
      ]}
      onPress={onPress}
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled}
    >
      <View style={styles.buttonContent}>
        {showSpinner && (
          <ActivityIndicator 
            size="small" 
            color="white" 
            style={styles.spinner}
          />
        )}
        <Text style={styles.scanButtonText}>
          {!showSpinner}
          {getButtonText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    minWidth: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});