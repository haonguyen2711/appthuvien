import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { color_1 } from '../../constants/colors';
import type { AppDispatch, RootState } from '../../store';
import { downloadBook, fetchBookInfo } from '../../store/slices/bookSlice';

interface BookDetailScreenProps {
  navigation: any;
  route: {
    params: {
      bookId: number;
    };
  };
}

const BookDetailScreen: React.FC<BookDetailScreenProps> = ({ navigation, route }) => {
  const { bookId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentBook, loading, downloadProgress } = useSelector((state: RootState) => state.books);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isVip = user?.role === 'VIP' || user?.role === 'Admin';
  const downloadProgressValue = downloadProgress[bookId] || 0;

  useEffect(() => {
    dispatch(fetchBookInfo(bookId));
  }, [dispatch, bookId]);

  const handleDownload = async () => {
    if (!currentBook) return;

    if (currentBook.requiresVip && !isVip) {
      Alert.alert(
        'Yêu cầu VIP',
        'Tài liệu này chỉ dành cho thành viên VIP. Bạn có muốn nâng cấp tài khoản không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => navigation.navigate('Upgrade') },
        ]
      );
      return;
    }

    try {
      await dispatch(downloadBook(bookId)).unwrap();
      Alert.alert('Thành công', 'Tải xuống hoàn tất!');
    } catch (error) {
      Alert.alert('Lỗi', error as string);
    }
  };

  const handleRead = () => {
    if (!currentBook) return;

    if (currentBook.requiresVip && !isVip) {
      Alert.alert(
        'Yêu cầu VIP',
        'Tài liệu này chỉ dành cho thành viên VIP. Bạn có muốn nâng cấp tài khoản không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => navigation.navigate('Upgrade') },
        ]
      );
      return;
    }

    navigation.navigate('Reader', { book: currentBook });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color_1.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin sách...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentBook) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin sách</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={color_1.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sách</Text>
        </View>

        <View style={styles.bookInfo}>
          <Image source={{ uri: currentBook.coverImage }} style={styles.bookCover} />
          
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{currentBook.title}</Text>
            <Text style={styles.bookAuthor}>Tác giả: {currentBook.author}</Text>
            <Text style={styles.bookCategory}>Thể loại: {currentBook.category}</Text>
            
            {currentBook.requiresVip && (
              <View style={styles.vipBadge}>
                <Ionicons name="star" size={16} color={color_1.warning} />
                <Text style={styles.vipText}>VIP</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.description}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>{currentBook.description}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentBook.pages}</Text>
            <Text style={styles.statLabel}>Trang</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentBook.downloads}</Text>
            <Text style={styles.statLabel}>Lượt tải</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentBook.rating}/5</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.readButton} onPress={handleRead}>
            <Ionicons name="book-outline" size={20} color={color_1.white} />
            <Text style={styles.readButtonText}>Đọc sách</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.downloadButton, downloadProgressValue > 0 && downloadProgressValue < 100 && styles.downloadingButton]} 
            onPress={handleDownload}
            disabled={downloadProgressValue > 0 && downloadProgressValue < 100}
          >
            {downloadProgressValue > 0 && downloadProgressValue < 100 ? (
              <>
                <ActivityIndicator size={20} color={color_1.white} />
                <Text style={styles.downloadButtonText}>
                  Đang tải {downloadProgressValue}%
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color={color_1.primary} />
                <Text style={styles.downloadButtonText}>Tải xuống</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color_1.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: color_1.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: color_1.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: color_1.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: color_1.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bookInfo: {
    flexDirection: 'row',
    padding: 16,
  },
  bookCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginRight: 16,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    color: color_1.textSecondary,
    marginBottom: 4,
  },
  bookCategory: {
    fontSize: 16,
    color: color_1.textSecondary,
    marginBottom: 8,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color_1.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vipText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: color_1.warning,
  },
  description: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: color_1.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: color_1.textSecondary,
    lineHeight: 24,
  },
  stats: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: color_1.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color_1.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: color_1.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  readButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color_1.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  readButtonText: {
    color: color_1.white,
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color_1.white,
    borderWidth: 1,
    borderColor: color_1.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  downloadingButton: {
    backgroundColor: color_1.primary,
  },
  downloadButtonText: {
    color: color_1.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookDetailScreen;
