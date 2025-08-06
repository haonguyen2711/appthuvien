import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { color_1 } from '../../constants/colors';
import { Category } from '../../data/mockData';

interface CategoryGridItemProps {
  category: Category;
  onPress: (categoryId: string) => void;
}

const CategoryGridItem: React.FC<CategoryGridItemProps> = ({ category, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(category.id)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image 
            source={{ uri: category.image }} 
            style={styles.image}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoading(false)}
            onLoadStart={() => setImageLoading(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={40} color={color_1.textSecondary} />
          </View>
        )}
        
        {imageLoading && !imageError && (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={24} color={color_1.textSecondary} />
          </View>
        )}
      </View>
      
      <Text style={styles.title}>{category.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    backgroundColor: color_1.surface,
    borderRadius: 12,
    shadowColor: color_1.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: color_1.background,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color_1.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: color_1.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});

export default CategoryGridItem;
