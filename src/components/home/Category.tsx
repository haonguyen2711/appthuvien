import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { color_1 } from '../../constants/colors';
import { RootState } from '../../store';
import CategoryGridItem from '../categories/CategoryGridItemProps';

// Use the Category type from Redux state instead of mockData
interface Category {
  id: string;
  title: string;
  image: string;
  icon: string;
}

interface CategoryProps {
  onCategoryPress: (categoryId: string) => void;
}

const Category: React.FC<CategoryProps> = ({ onCategoryPress }) => {
  const categories = useSelector((state: RootState) => state.books.categories);
  const categoriesLoading = useSelector((state: RootState) => state.books.categoriesLoading);
  
  // Debug logging
  console.log('🏷️ Category component - categories:', categories);
  console.log('🏷️ Category component - categoriesLoading:', categoriesLoading);
  console.log('🏷️ Category component - categories length:', categories?.length || 0);
  
  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryGridItem
      category={item}
      onPress={onCategoryPress}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Mục</Text>
      {categoriesLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      ) : categories && categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có danh mục nào</Text>
          <Text style={styles.emptySubText}>Có thể đang có lỗi kết nối</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: color_1.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: color_1.textPrimary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: color_1.textSecondary,
  },
});

export default Category;
