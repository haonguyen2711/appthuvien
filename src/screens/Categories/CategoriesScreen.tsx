
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryGridItemSimple from '../../components/categories/CategoryGridItemSimple';
import { color_1 } from '../../constants/colors';
import { categories_data } from '../../data/mockData';

interface CategoriesScreenProps {
  navigation: any;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  // Sắp xếp theo bảng chữ cái tiếng Việt
  // Chỉ sắp xếp khi dữ liệu gốc thay đổi
  const sortedCategories = useMemo(() => {
    return [...categories_data].sort((a, b) => 
      a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' })
    );
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('DocumentList', { categoryId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tất cả thể loại</Text>
      </View>
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
});

export default CategoriesScreen;
