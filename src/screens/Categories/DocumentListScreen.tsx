import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import SearchBar from '../../components/common/SearchBar';
import { color_1 } from '../../constants/colors';
import { Document, Document_data, categories_data } from '../../data/mockData';

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author'>('title');

  const categoryTitle = categories_data.find(cat => cat.id === categoryId)?.title || 'Tài liệu';

  useEffect(() => {
    // Filter documents by category
    const categoryDocuments = Document_data.filter(doc => doc.categoryId === categoryId);
    setDocuments(categoryDocuments);
    setFilteredDocuments(categoryDocuments);
  }, [categoryId]);

  useEffect(() => {
    // Filter documents based on search query
    let filtered = documents;
    
    if (searchQuery.trim()) {
      filtered = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort documents
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return a.author.localeCompare(b.author);
      }
    });

    setFilteredDocuments(filtered);
  }, [searchQuery, documents, sortBy]);

  const handleDocumentPress = (document: Document) => {
    if (document.access === 'VIP') {
      Alert.alert(
        'Tài liệu VIP',
        'Tài liệu này chỉ dành cho thành viên VIP. Bạn có muốn nâng cấp tài khoản?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => {/* Navigate to upgrade - remove in production */} },
        ]
      );
    } else {
      navigation.navigate('Reader', { document });
    }
  };

  const toggleSort = () => {
    setSortBy(prev => prev === 'title' ? 'author' : 'title');
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.documentImage} />
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.documentAuthor}>Tác giả: {item.author}</Text>
        <Text style={styles.documentDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.accessContainer}>
          <Text style={[
            styles.accessText,
            item.access === 'VIP' ? styles.vipText : styles.freeText
          ]}>
            {item.access}
          </Text>
          {item.access === 'VIP' && (
            <Ionicons name="diamond" size={16} color={color_1.primary} />
          )}
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
          Sắp xếp theo: {sortBy === 'title' ? 'Tên tài liệu' : 'Tác giả'}
        </Text>
        <Text style={styles.countText}>
          {filteredDocuments.length} tài liệu
        </Text>
      </View>

      {filteredDocuments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={color_1.textSecondary} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy tài liệu nào' : 'Chưa có tài liệu trong danh mục này'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocument}
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
