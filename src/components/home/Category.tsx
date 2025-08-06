import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { color_1 } from '../../constants/colors';
import { categories_data, Category as CategoryType } from '../../data/mockData';
import CategoryGridItem from '../categories/CategoryGridItemProps';

interface CategoryProps {
  onCategoryPress: (categoryId: string) => void;
}

const Category: React.FC<CategoryProps> = ({ onCategoryPress }) => {
  const renderCategory = ({ item }: { item: CategoryType }) => (
    <CategoryGridItem
      category={item}
      onPress={onCategoryPress}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Mục</Text>
      <FlatList
        data={categories_data}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
});

export default Category;
