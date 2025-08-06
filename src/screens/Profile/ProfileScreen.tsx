import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { Document_data, USER_PROFILE_DATA, UserComment } from '../../data/mockData';
import type { AppDispatch, RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'downloaded' | 'comments'>('downloaded');
  
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  // Fallback to mock data if user is not loaded
  const userProfile = user || USER_PROFILE_DATA;

  const downloadedDocuments = Document_data.filter(doc => 
    userProfile.downloadedIds?.includes(doc.id)
  );

  const handleUpgradePress = () => {
    Alert.alert(
      'Nâng cấp VIP',
      'Bạn có muốn nâng cấp lên tài khoản VIP để truy cập tất cả tài liệu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nâng cấp', onPress: () => {/* Navigate to upgrade - remove in production */} },
      ]
    );
  };

  const handleLogout = () => {
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
              // Navigation will be handled automatically by AppNavigator
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        },
      ]
    );
  };

  const renderDownloadedDocument = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.documentItem}
      onPress={() => navigation.navigate('Reader', { document: item })}
    >
      <Image source={{ uri: item.image }} style={styles.documentThumbnail} />
      <View style={styles.documentDetails}>
        <Text style={styles.documentTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.documentAuthor}>{item.author}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
    </TouchableOpacity>
  );

  const renderComment = ({ item }: { item: UserComment }) => {
    const document = Document_data.find(doc => doc.id === item.documentId);
    return (
      <View style={styles.commentItem}>
        <Text style={styles.commentDocument}>{document?.title || 'Tài liệu không tồn tại'}</Text>
        <Text style={styles.commentText}>{item.commentText}</Text>
        <Text style={styles.commentDate}>
          {new Date(item.timestamp).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <View style={styles.roleContainer}>
              <Text style={[
                styles.roleText,
                userProfile.role === 'VIP' ? styles.vipRole : styles.freeRole
              ]}>
                {userProfile.role}
              </Text>
              {userProfile.role === 'VIP' && (
                <Ionicons name="diamond" size={16} color="#FFD700" style={styles.vipIcon} />
              )}
            </View>
          </View>
        </View>
        
        {userProfile.role === 'Free' && (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
            <Ionicons name="diamond-outline" size={20} color={color_1.white} />
            <Text style={styles.upgradeText}>Nâng cấp VIP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.downloadedIds.length}</Text>
          <Text style={styles.statLabel}>Đã tải</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.comments?.length || 0}</Text>
          <Text style={styles.statLabel}>Bình luận</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Yêu thích</Text>
        </View>
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
            Đã tải
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
            Bình luận
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
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="download-outline" size={64} color={color_1.textSecondary} />
              <Text style={styles.emptyText}>Chưa có tài liệu nào được tải</Text>
            </View>
          )
        ) : (
          userProfile.comments && userProfile.comments.length > 0 ? (
            <FlatList
              data={userProfile.comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={64} color={color_1.textSecondary} />
              <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
            </View>
          )
        )}
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="settings-outline" size={24} color={color_1.textPrimary} />
          <Text style={styles.settingText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="help-circle-outline" size={24} color={color_1.textPrimary} />
          <Text style={styles.settingText}>Trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={color_1.error} />
          <Text style={[styles.settingText, { color: color_1.error }]}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.textPrimary,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeRole: {
    backgroundColor: color_1.primary,
    color: color_1.white,
  },
  vipRole: {
    backgroundColor: '#FFD700',
    color: color_1.black,
  },
  vipIcon: {
    marginLeft: 4,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  upgradeText: {
    color: color_1.black,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: color_1.surface,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color_1.primary,
  },
  statLabel: {
    fontSize: 14,
    color: color_1.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: color_1.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: color_1.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: color_1.textSecondary,
  },
  activeTabText: {
    color: color_1.white,
  },
  tabContent: {
    margin: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color_1.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  documentThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color_1.textPrimary,
    marginBottom: 4,
  },
  documentAuthor: {
    fontSize: 14,
    color: color_1.textSecondary,
  },
  commentItem: {
    backgroundColor: color_1.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentDocument: {
    fontSize: 14,
    fontWeight: '600',
    color: color_1.primary,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: color_1.textSecondary,
    marginTop: 16,
  },
  settingsContainer: {
    backgroundColor: color_1.surface,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: color_1.textPrimary,
    marginLeft: 12,
  },
});

export default ProfileScreen;
