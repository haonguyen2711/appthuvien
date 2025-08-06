import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../../components/common/SearchBar';
import { color_1 } from '../../constants/colors';
import type { AppDispatch, RootState } from '../../store';
import { fetchMangaByCategory } from '../../store/slices/bookSlice';

interface DocumentListScreenProps {
  route: {
    params: {
      categoryId: string;
    };
  };
  navigation: any;
}

const DocumentListScreen: React.FC<DocumentListScreenProps> = ({ route, navigation }) => {
  const { categoryId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author'>('title');
  
  const dispatch = useDispatch<AppDispatch>();
  const { 
    categoryManga, 
    categoryMangaLoading, 
    categories, 
    error 
  } = useSelector((state: RootState) => state.books);

  // Get category info
  const category = categories.find(cat => cat.id === categoryId);
  const categoryTitle = category?.title || 'Tài liệu';

  useEffect(() => {
    // Fetch manga for this category
    console.log('📂 Fetching manga for category:', categoryId);
    dispatch(fetchMangaByCategory({ categoryId, limit: 50 }));
  }, [dispatch, categoryId]);

  // Filter and sort manga
  const filteredManga = React.useMemo(() => {
    if (!categoryManga || categoryManga.length === 0) {
      return [];
    }

    let filtered = [...categoryManga]; // Create a copy to avoid read-only array issue

    // Search filter
    if (searchQuery.trim()) {
      filtered = categoryManga.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manga.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return a.author.localeCompare(b.author);
      }
    });

    return filtered;
  }, [searchQuery, categoryManga, sortBy]);

  const handleDocumentPress = (manga: any) => {
    // Navigate to Reader with manga data
    navigation.navigate('Reader', { 
      document: manga, 
      documentType: 'manga' 
    });
  };
  const toggleSort = () => {
    setSortBy(prev => prev === 'title' ? 'author' : 'title');
  };

  const renderManga = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(item)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image || 'https://placehold.co/120x160/3498db/ffffff?text=No+Cover' }} 
        style={styles.documentImage} 
      />
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.documentAuthor}>Tác giả: {item.author}</Text>
        <Text style={styles.documentDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.accessContainer}>
          <Text style={[styles.accessText, styles.freeText]}>
            Manga
          </Text>
          <Text style={styles.accessText}>
            📖 {item.totalChapters || 0} chương
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={color_1.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <Ionicons name="swap-vertical" size={24} color={color_1.primary} />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={`Tìm kiếm trong ${categoryTitle}...`}
      />

      <View style={styles.sortInfo}>
        <Text style={styles.sortText}>
          Sắp xếp theo: {sortBy === 'title' ? 'Tên manga' : 'Tác giả'}
        </Text>
        <Text style={styles.countText}>
          {filteredManga.length} manga
        </Text>
      </View>

      {categoryMangaLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang tải manga...</Text>
        </View>
      ) : filteredManga.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={color_1.textSecondary} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy manga nào' : 'Chưa có manga trong danh mục này'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredManga}
          renderItem={renderManga}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: color_1.surface,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    textAlign: 'center',
  },
  sortButton: {
    padding: 8,
  },
  sortInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortText: {
    fontSize: 14,
    color: color_1.textSecondary,
  },
  countText: {
    fontSize: 14,
    color: color_1.textSecondary,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: color_1.surface,
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: color_1.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  documentImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 4,
  },
  documentAuthor: {
    fontSize: 14,
    color: color_1.textSecondary,
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 13,
    color: color_1.textSecondary,
    lineHeight: 18,
  },
  accessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  accessText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  freeText: {
    backgroundColor: color_1.primary,
    color: color_1.white,
  },
  vipText: {
    backgroundColor: '#FFD700',
    color: color_1.black,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: color_1.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DocumentListScreen;
