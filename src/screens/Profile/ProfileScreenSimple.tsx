import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { color_1 } from '../../constants/colors';
import type { AppDispatch, RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

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
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        },
      ]
    );
  };

  // Simple profile screen for testing
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={50} color={color_1.textSecondary} />
          </View>
          <Text style={styles.name}>
            {user?.fullName || user?.username || 'Người dùng'}
          </Text>
          <Text style={styles.email}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color={color_1.primary} />
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="bookmark-outline" size={24} color={color_1.primary} />
          <Text style={styles.menuText}>Tài liệu đã lưu</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="download-outline" size={24} color={color_1.primary} />
          <Text style={styles.menuText}>Tài liệu đã tải</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={color_1.primary} />
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color={color_1.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color_1.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
  },
  section: {
    backgroundColor: color_1.surface,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: color_1.textPrimary,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: color_1.border,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: color_1.textPrimary,
    marginLeft: 15,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e74c3c',
  },
});

export default ProfileScreen;
