import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { color_1 } from '../../constants/colors';

// Test component để kiểm tra hiển thị ảnh
const TestImageComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Image Display</Text>
      
      {/* Test với URL từ placeholder.co */}
      <Image 
        source={{ uri: 'https://placehold.co/300x300/3498db/ffffff?text=Test' }} 
        style={styles.testImage}
        onError={(e) => console.log('Image Error:', e.nativeEvent.error)}
        onLoad={() => console.log('Image Loaded Successfully')}
      />
      
      {/* Test với ảnh local/require */}
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Comic</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: color_1.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: color_1.textPrimary,
  },
  testImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: color_1.border,
  },
  fallbackContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestImageComponent;
