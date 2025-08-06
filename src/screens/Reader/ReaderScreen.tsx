import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { color_1 } from '../../constants/colors';
import { comments_data, Document, UserComment } from '../../data/mockData';
import type { RootState } from '../../store';

interface ReaderScreenProps {
  route: {
    params: {
      document: Document | any; // Support both Document and manga types
      documentType?: 'book' | 'manga';
    };
  };
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ReaderScreen: React.FC<ReaderScreenProps> = ({ route, navigation }) => {
  const { document, documentType } = route.params;
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [documentComments, setDocumentComments] = useState<UserComment[]>(
    comments_data.filter(comment => comment.documentId === document.id)
  );
  const scrollViewRef = useRef<ScrollView>(null);

  // Get user state from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const isVip = user?.role === 'VIP' || user?.role === 'ADMIN';
  const isLoggedIn = !!user;

  const handleDownload = () => {
    // Đối với manga từ MangaDX, không cho phép download vì đây là nội dung online
    if (document.id && document.id.length > 20) { // MangaDX IDs are longer
      Alert.alert(
        'Thông báo',
        'Truyện tranh chỉ có thể đọc online. Vui lòng truy cập trang gốc để tải xuống.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để tải xuống tài liệu.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (document.access === 'VIP' && !isVip) {
      Alert.alert(
        'Tài liệu VIP',
        'Bạn cần tài khoản VIP để tải tài liệu này. Nâng cấp ngay?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nâng cấp', onPress: () => {/* Navigate to upgrade - remove in production */} },
        ]
      );
    } else {
      Alert.alert('Thành công', 'Tài liệu đã được tải xuống!');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: UserComment = {
        id: `comment_${Date.now()}`,
        documentId: document.id,
        userName: 'Người dùng hiện tại',
        userAvatar: 'https://placehold.co/100x100/3498db/ffffff?text=U',
        commentText: newComment.trim(),
        timestamp: new Date().toISOString(),
      };
      
      setDocumentComments([...documentComments, comment]);
      setNewComment('');
      Alert.alert('Thành công', 'Bình luận đã được thêm!');
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = fontSize + delta;
    if (newSize >= 12 && newSize <= 24) {
      setFontSize(newSize);
    }
  };

  const renderComment = ({ item }: { item: UserComment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>{item.userName}</Text>
        <Text style={styles.commentText}>{item.commentText}</Text>
        <Text style={styles.commentTime}>
          {new Date(item.timestamp).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={color_1.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {document.title}
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowComments(true)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={color_1.textPrimary} />
            {documentComments.length > 0 && (
              <View style={styles.commentBadge}>
                <Text style={styles.commentBadgeText}>{documentComments.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={color_1.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Document Info */}
      <View style={styles.documentInfo}>
        <Image source={{ uri: document.image }} style={styles.documentCover} />
        <View style={styles.documentDetails}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <Text style={styles.documentAuthor}>Tác giả: {document.author}</Text>
          {/* Show chapter count for manga */}
          {(document as any).totalChapters && (
            <Text style={styles.documentChapters}>
              📚 {(document as any).totalChapters} chương
            </Text>
          )}
          <Text style={styles.documentDescription} numberOfLines={3}>
            {document.description}
          </Text>
          
          {/* Conditional download button */}
          {!(document.id && document.id.length > 20) && ( // Hide for manga
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
              <Ionicons name="download-outline" size={20} color={color_1.white} />
              <Text style={styles.downloadButtonText}>Tải xuống</Text>
            </TouchableOpacity>
          )}
          
          {/* Show online reading notice for manga */}
          {document.id && document.id.length > 20 && (
            <View style={styles.onlineNotice}>
              <Ionicons name="globe-outline" size={16} color={color_1.primary} />
              <Text style={styles.onlineNoticeText}>Đọc trực tuyến</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Check if this is a manga with chapters */}
          {(document as any).chapters && (document as any).chapters.length > 0 ? (
            <View>
              <Text style={styles.chaptersHeader}>Danh sách chương</Text>
              {(document as any).chapters.map((chapter: any, index: number) => (
                <TouchableOpacity 
                  key={chapter.id} 
                  style={styles.chapterItem}
                  onPress={() => {
                    Alert.alert(
                      'Đọc chương',
                      `Bạn muốn đọc ${chapter.title}?\n\nChương này sẽ được đọc trực tuyến từ MangaDX.`,
                      [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Đọc Online', onPress: () => {
                          // Open MangaDX chapter URL
                          const chapterUrl = `https://mangadx.org/chapter/${chapter.id}`;
                          Alert.alert(
                            'Mở trình duyệt',
                            `Đang mở chương trong trình duyệt web:\n${chapterUrl}`,
                            [{ text: 'OK' }]
                          );
                          // In production: Linking.openURL(chapterUrl);
                        }},
                      ]
                    );
                  }}
                >
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterDetails}>
                      Chương {chapter.chapter} • {chapter.pages} trang
                    </Text>
                    <Text style={styles.chapterDate}>
                      {new Date(chapter.publishedAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Traditional text content
            <Text style={[styles.contentText, { fontSize }]}>
              {document.content}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cài đặt đọc</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={color_1.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Kích thước chữ: {fontSize}px</Text>
              <View style={styles.fontControls}>
                <TouchableOpacity
                  style={styles.fontButton}
                  onPress={() => changeFontSize(-2)}
                >
                  <Ionicons name="remove" size={20} color={color_1.textPrimary} />
                </TouchableOpacity>
                
                <Text style={styles.fontSizeDisplay}>A</Text>
                
                <TouchableOpacity
                  style={styles.fontButton}
                  onPress={() => changeFontSize(2)}
                >
                  <Ionicons name="add" size={20} color={color_1.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bình luận ({documentComments.length})</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color={color_1.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={documentComments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentTextInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Viết bình luận..."
                placeholderTextColor={color_1.textSecondary}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, newComment.trim() && styles.sendButtonActive]}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newComment.trim() ? color_1.primary : color_1.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: color_1.textPrimary,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  commentBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: color_1.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBadgeText: {
    color: color_1.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  documentInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: color_1.surface,
  },
  documentCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginRight: 16,
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 8,
  },
  documentAuthor: {
    fontSize: 16,
    color: color_1.textSecondary,
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: color_1.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color_1.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    color: color_1.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  contentText: {
    lineHeight: 28,
    color: color_1.textPrimary,
    textAlign: 'justify',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: color_1.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  commentsModal: {
    backgroundColor: color_1.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color_1.textPrimary,
  },
  settingItem: {
    padding: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: color_1.textPrimary,
    marginBottom: 16,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontButton: {
    backgroundColor: color_1.border,
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 16,
  },
  fontSizeDisplay: {
    fontSize: 24,
    color: color_1.textPrimary,
  },
  commentsList: {
    maxHeight: screenHeight * 0.5,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: color_1.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: color_1.textSecondary,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: color_1.border,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: color_1.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: color_1.textPrimary,
  },
  sendButton: {
    padding: 12,
  },
  sendButtonActive: {
    backgroundColor: color_1.primary + '20',
    borderRadius: 20,
  },
  documentChapters: {
    fontSize: 14,
    color: color_1.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  onlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color_1.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  onlineNoticeText: {
    fontSize: 12,
    color: color_1.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  chaptersHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color_1.background,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color_1.border,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: color_1.textPrimary,
    marginBottom: 4,
  },
  chapterDetails: {
    fontSize: 14,
    color: color_1.textSecondary,
    marginBottom: 2,
  },
  chapterDate: {
    fontSize: 12,
    color: color_1.textSecondary,
  },
});

export default ReaderScreen;
