import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Citation, ScannedPage } from '../contexts/AppContext';

interface CitationModalProps {
  visible: boolean;
  citation: Citation | null;
  scannedPages: ScannedPage[];
  onClose: () => void;
}

export function CitationModal({
  visible,
  citation,
  scannedPages,
  onClose,
}: CitationModalProps) {
  const insets = useSafeAreaInsets();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLayout, setImageLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  if (!citation) return null;

  const page = scannedPages[citation.pageIndex];
  if (!page) {
    console.warn(`[CITATION] Page not found for citation: ${citation.id}`);
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const handleImageLoad = (event: any) => {
    // Use original dimensions if available, otherwise fall back to what Image component reports
    const width = page.originalWidth || event.nativeEvent.source.width;
    const height = page.originalHeight || event.nativeEvent.source.height;
    setImageSize({ width, height });
  };

  // Calculate the actual rendered image dimensions with resizeMode="contain"
  let displayWidth = 0;
  let displayHeight = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (imageSize.width > 0 && imageSize.height > 0 && imageLayout.width > 0) {
    const imageAspect = imageSize.width / imageSize.height;
    const containerAspect = imageLayout.width / imageLayout.height;

    if (imageAspect > containerAspect) {
      displayWidth = imageLayout.width;
      displayHeight = imageLayout.width / imageAspect;
      offsetX = imageLayout.x;
      offsetY = imageLayout.y + (imageLayout.height - displayHeight) / 2;
    } else {
      displayHeight = imageLayout.height;
      displayWidth = imageLayout.height * imageAspect;
      offsetX = imageLayout.x + (imageLayout.width - displayWidth) / 2;
      offsetY = imageLayout.y;
    }
  }

  const scaleX = imageSize.width > 0 ? displayWidth / imageSize.width : 1;
  const scaleY = imageSize.height > 0 ? displayHeight / imageSize.height : 1;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Citation Source</Text>
            <Text style={styles.headerSubtitle}>Page {citation.pageIndex + 1}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteIconContainer}>
            <Ionicons name="chatbox-ellipses" size={16} color="#d4a574" />
          </View>
          <Text style={styles.quoteText} numberOfLines={3}>
            "{citation.quote}"
          </Text>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: page.uri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={handleImageLoad}
            onLayout={(event: LayoutChangeEvent) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setImageLayout({ x, y, width, height });
            }}
          />

          {/* Overlay highlights */}
          {citation.highlightRanges.map((range, index) => {
            const left = range.left * scaleX + offsetX;
            const top = range.top * scaleY + offsetY;
            const width = range.width * scaleX;
            const height = range.height * scaleY;

            return (
              <View
                key={index}
                style={[
                  styles.highlight,
                  { top, left, width, height },
                ]}
              />
            );
          })}
        </View>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d4a574',
  },
  quoteIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 165, 116, 0.4)',
    borderWidth: 0.5,
    borderColor: '#d4a574',
    borderRadius: 2,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: '#1a2332',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});