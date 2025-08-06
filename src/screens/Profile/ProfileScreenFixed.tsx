import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { color_1 } from '../../constants/colors';
import type { AppDispatch, RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

// Define interfaces locally to avoid import issues
interface Document {
  id: string;
  title: string;
  author: string;
  image: string;
  description: string;
  categoryId: string;
  access: 'Free' | 'VIP';
  content: string;
}

interface UserComment {
  id: string;
  documentId: string;
  userName: string;
  userAvatar: string;
  commentText: string;
  timestamp: string;
  documentTitle?: string;
}

interface UserProfile {
  id: string;
  name: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatar: string;
  role: 'Free' | 'VIP' | 'Admin';
  downloadedIds: string[];
  comments?: UserComment[];
  documentTitle: string;
}

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'downloaded' | 'comments'>('downloaded');
  
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Default user profile data
  const defaultUserProfile: UserProfile = {
    id: 'user1',
    name: 'Nguyễn Văn A',
    fullName: 'Nguyễn Văn A',
    username: 'user1',
    email: 'user@example.com',
    avatar: 'https://placehold.co/100x100/3498db/ffffff?text=A',
    role: 'Free',
    downloadedIds: [],
    documentTitle: 'React Native cho người mới',
    comments: []
  };
  
  // Use user data or fallback to default
  const userProfile = user ? {
    ...defaultUserProfile,
    ...user,
    name: user.fullName || user.username || defaultUserProfile.name,
  } : defaultUserProfile;

  // Mock documents data - simplified
  const mockDocuments: Document[] = [
    {
      id: 'doc1',
      title: 'React Native Fundamentals',
      author: 'John Doe',
      image: 'https://placehold.co/150x200/3498db/ffffff?text=RN',
      description: 'Learn React Native basics',
      categoryId: 'cat1',
      access: 'Free',
      content: 'Content here...'
    },
    {
      id: 'doc2',
      title: 'Advanced React Native',
      author: 'Jane Smith',
      image: 'https://placehold.co/150x200/e74c3c/ffffff?text=ARN',
      description: 'Advanced React Native concepts',
      categoryId: 'cat1',
      access: 'VIP',
      content: 'Advanced content...'
    }
  ];

  const downloadedDocuments = mockDocuments.filter(doc => 
    userProfile.downloadedIds?.includes(doc.id)
  );

  const handleUpgradePress = useCallback(() => {
    Alert.alert(
      'Nâng cấp VIP',
      'Bạn có muốn nâng cấp lên tài khoản VIP để truy cập tất cả tài liệu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nâng cấp', onPress: () => console.log('Navigate to upgrade') },
      ]
    );
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        },
      ]
    );
  }, [dispatch]);

  const renderDownloadedDocument = useCallback(({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentItem}
      onPress={() => {
        if (navigation?.navigate) {
          navigation.navigate('Reader', { document: item });
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.documentThumbnail} />
      <View style={styles.documentDetails}>
        <Text style={styles.documentTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.documentAuthor}>{item.author}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
    </TouchableOpacity>
  ), [navigation]);

  const renderComment = useCallback(({ item }: { item: UserComment }) => {
    return (
      <View style={styles.commentItem}>
        <Text style={styles.commentDocument}>{item.documentTitle || 'Tài liệu'}</Text>
        <Text style={styles.commentText}>{item.commentText}</Text>
        <Text style={styles.commentDate}>
          {new Date(item.timestamp).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    );
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{userProfile.name}</Text>
          {userProfile.email && <Text style={styles.email}>{userProfile.email}</Text>}
          
          <View style={styles.statusBadge}>
            <Text style={[
              styles.statusText,
              userProfile.role === 'VIP' && styles.vipStatus
            ]}>
              {userProfile.role}
            </Text>
          </View>
        </View>

        {userProfile.role !== 'VIP' && (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.upgradeText}>Nâng cấp VIP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings-outline" size={24} color={color_1.primary} />
          <Text style={styles.actionText}>Cài đặt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={24} color={color_1.primary} />
          <Text style={styles.actionText}>Hỗ trợ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={[styles.actionText, { color: '#e74c3c' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloaded' && styles.activeTab]}
          onPress={() => setActiveTab('downloaded')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'downloaded' && styles.activeTabText
          ]}>
            Đã tải ({downloadedDocuments.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'comments' && styles.activeTabText
          ]}>
            Bình luận ({userProfile.comments?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'downloaded' ? (
          downloadedDocuments.length > 0 ? (
            <FlatList
              data={downloadedDocuments}
              renderItem={renderDownloadedDocument}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="download-outline" size={64} color={color_1.textSecondary} />
              <Text style={styles.emptyText}>Chưa có tài liệu nào được tải</Text>
              <Text style={styles.emptySubText}>
                Hãy khám phá và tải xuống các tài liệu yêu thích
              </Text>
            </View>
          )
        ) : (
          (userProfile.comments && userProfile.comments.length > 0) ? (
            <FlatList
              data={userProfile.comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={64} color={color_1.textSecondary} />
              <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
              <Text style={styles.emptySubText}>
                Hãy chia sẻ ý kiến của bạn về các tài liệu
              </Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color_1.background,
  },
  header: {
    backgroundColor: color_1.surface,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: color_1.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: color_1.textSecondary,
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: color_1.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vipStatus: {
    backgroundColor: '#f39c12',
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: '#f39c12',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: color_1.surface,
    marginTop: 10,
    paddingVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: color_1.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: color_1.surface,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: color_1.primary,
  },
  tabText: {
    fontSize: 16,
    color: color_1.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: color_1.primary,
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: color_1.surface,
    minHeight: 200,
  },
  documentItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
    alignItems: 'center',
  },
  documentThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: color_1.border,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 15,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color_1.textPrimary,
    marginBottom: 5,
  },
  documentAuthor: {
    fontSize: 14,
    color: color_1.textSecondary,
  },
  commentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  commentDocument: {
    fontSize: 16,
    fontWeight: '600',
    color: color_1.textPrimary,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: color_1.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 12,
    color: color_1.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: color_1.textPrimary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: color_1.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfileScreen;
