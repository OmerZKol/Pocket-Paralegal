import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLayout, setImageLayout] = useState({ x : 0, y: 0, width: 0, height: 0 });

  if (!citation) return null;

  const page = scannedPages[citation.pageIndex];
  if (!page) {
    console.warn(`[CITATION] Page not found for citation: ${citation.id}`);
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    console.log('[CITATION] Image size:', width, 'x', height);
    setImageSize({ width, height });
  };

  // Calculate the actual rendered image dimensions with resizeMode="contain"
  // This accounts for letterboxing (empty space around the image)
  let displayWidth = 0;
  let displayHeight = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (imageSize.width > 0 && imageSize.height > 0) {
    const imageAspect = imageSize.width / imageSize.height;
    const containerAspect = screenWidth / screenHeight;

    if (imageAspect > containerAspect) {
      // Image is wider than screen - will have top/bottom padding
      displayWidth = imageLayout.width;
      displayHeight = imageLayout.width / imageAspect;
      offsetX = imageLayout.x;
      offsetY = imageLayout.y + (imageLayout.height - displayHeight) / 2;
    } else {
      // Image is taller than screen - will have left/right padding
      displayHeight = imageLayout.height;
      displayWidth = imageLayout.height * imageAspect;
      offsetX = imageLayout.x + (imageLayout.width - displayWidth) / 2;
      offsetY = imageLayout.y;
    }

    console.log('[CITATION] Display calc:', {
      imageAspect,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY
    });
  }

  // Simple proportional scaling with offset
  const scaleX = imageSize.width > 0 ? displayWidth / imageSize.width : 1;
  const scaleY = imageSize.height > 0 ? displayHeight / imageSize.height : 1;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: page.uri }}
            style={{ width: screenWidth, height: screenHeight }}
            resizeMode="contain"
            onLoad={handleImageLoad}
            onLayout={(event: LayoutChangeEvent) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              console.log('[CITATION] Image layout:', { x, y, width, height });
              setImageLayout({ x, y, width, height });
            }}
          />

          {/* Overlay highlights */}
          {citation.highlightRanges.map((range, index) => {
            const left = range.left * scaleX + offsetX;
            const top = range.top * scaleY + offsetY;
            const width = range.width * scaleX;
            const height = range.height * scaleY;


          console.log(`[CITATION] Range ${index}:`, {
            original: range,
            scaled: { top, left, width, height },
            scaleX,
            scaleY,
            displayWidth,
            displayHeight,
            offsetX,
            offsetY,
            imageSize,
            screen: { screenWidth, screenHeight }
          });

          return (
            <View
              key={index}
              style={{
                backgroundColor: '#d4a57480',
                position: 'absolute',
                top,
                left,
                width,
                height,
                borderWidth: 1,
                borderColor: '#d4a574',
              }}
            />
          );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
