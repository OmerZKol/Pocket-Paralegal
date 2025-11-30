import FontAwesome5 from '@expo/vector-icons/build/FontAwesome5';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface PrimaryButtonProps {
  text?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string; //fontawesome5 icon name
}

export function PrimaryButton({ onPress, disabled, text, icon }: PrimaryButtonProps) {
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
        {icon && !showSpinner && (
          <FontAwesome5 
            name={icon} 
            size={16} 
            color="white"
            style={styles.icon}
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
    backgroundColor: '#1a2332', // Professional navy blue
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 10,
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
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
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});