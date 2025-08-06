import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { color_1 } from '../../constants/colors';
import { Category } from '../../data/mockData';

interface CategoryGridItemSimpleProps {
  category: Category;
  onPress: (categoryId: string) => void;
}

// Mapping colors for categories (fallback khi không có ảnh)
const categoryColors: Record<string, string> = {
  '1': '#3498db', // Truyện Tranh - Blue
  '2': '#e74c3c', // Khóa Học - Red
  '3': '#2ecc71', // Khoa Học - Green
  '4': '#f1c40f', // Lịch Sử - Yellow
  '5': '#9b59b6', // Văn Học - Purple
  '6': '#e67e22', // Kinh Tế - Orange
  '7': '#1abc9c', // Nghệ Thuật - Turquoise
  '8': '#34495e', // Âm Nhạc - Dark Blue
  '9': '#7f8c8d', // Đời Sống - Gray
  '10': '#c0392b', // Thể Thao - Dark Red
  '11': '#8e44ad', // Công Nghệ - Dark Purple
  '12': '#27ae60', // Ẩm Thực - Dark Green
};

const CategoryGridItemSimple: React.FC<CategoryGridItemSimpleProps> = ({ category, onPress }) => {
  const backgroundColor = categoryColors[category.id] || color_1.primary;
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(category.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { backgroundColor }]}>
        <Ionicons 
          name="library-outline" 
          size={40} 
          color="white" 
        />
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
    justifyContent: 'center',
    alignItems: 'center',
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

export default CategoryGridItemSimple;
