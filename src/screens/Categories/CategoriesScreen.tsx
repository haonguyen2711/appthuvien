
import React, { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import CategoryGridItemSimple from '../../components/categories/CategoryGridItemSimple';
import { color_1 } from '../../constants/colors';
import type { AppDispatch, RootState } from '../../store';
import { fetchCategories } from '../../store/slices/bookSlice';

interface CategoriesScreenProps {
  navigation: any;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, categoriesLoading } = useSelector((state: RootState) => state.books);

  // Fetch categories on mount if not already loaded
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, categoriesLoading]);

  // Sắp xếp theo bảng chữ cái tiếng Việt
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => 
      a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' })
    );
  }, [categories]);

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('DocumentList', { categoryId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tất cả thể loại</Text>
      </View>
      
      {categoriesLoading && categories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thể loại...</Text>
        </View>
      ) : sortedCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy thể loại nào</Text>
        </View>
      ) : (
        <FlatList
          data={sortedCategories}
          renderItem={({ item }) => (
            <CategoryGridItemSimple 
              category={item}
              onPress={handleCategoryPress}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2} // hiển thị dưới dạng lưới 2 cột
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingTop: 20,
    paddingHorizontal: 7.5, // (SPACING / 2)
  },
  row: {
    justifyContent: 'space-around', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: color_1.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: color_1.textSecondary,
  },
});

export default CategoriesScreen;
