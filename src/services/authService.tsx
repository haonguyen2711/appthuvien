import { formatValidationErrors, validateApiRequest } from '../utils/apiValidation';
import { formatErrorMessage, logErrorDetails } from '../utils/errorHandler';
import storageService from '../utils/storage';
import api from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    username: string;
    email: string;
    fullName: string;
    role: 'STANDARD' | 'VIP' | 'ADMIN';
    isVip: boolean;
    isAdmin: boolean;
    vipExpiresAt: string | null;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'STANDARD' | 'VIP' | 'ADMIN';
  isVip: boolean;
  vipExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input theo tiêu chuẩn API
      const validation = validateApiRequest('auth/login', credentials);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Lưu token và user info vào storage
        await storageService.setItem('authToken', response.data.data.token);
        await storageService.setItem('userProfile', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      logErrorDetails(error, 'AuthService.login');
      const errorMessage = formatErrorMessage(error) || 'Đăng nhập thất bại';
      throw new Error(errorMessage);
    }
  }

  // Đăng ký
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input theo tiêu chuẩn API
      const validation = validateApiRequest('auth/register', userData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      logErrorDetails(error, 'AuthService.register');
      const errorMessage = formatErrorMessage(error) || 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  }

  // Lấy thông tin profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/users/profile');
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AuthService.getProfile');
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy thông tin profile';
      throw new Error(errorMessage);
    }
  }

  // Cập nhật profile
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Validate input theo tiêu chuẩn API
      const validation = validateApiRequest('users/profile', profileData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      const response = await api.put('/users/profile', profileData);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AuthService.updateProfile');
      const errorMessage = formatErrorMessage(error) || 'Cập nhật profile thất bại';
      throw new Error(errorMessage);
    }
  }

  // Đổi mật khẩu
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Validate input theo tiêu chuẩn API
      const passwordData = { oldPassword, newPassword };
      const validation = validateApiRequest('users/change-password', passwordData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      await api.post('/users/change-password', passwordData);
    } catch (error: any) {
      logErrorDetails(error, 'AuthService.changePassword');
      const errorMessage = formatErrorMessage(error) || 'Đổi mật khẩu thất bại';
      throw new Error(errorMessage);
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await storageService.removeItem('authToken');
      await storageService.removeItem('userProfile');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Kiểm tra xem đã đăng nhập chưa
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await storageService.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Lấy token hiện tại
  async getToken(): Promise<string | null> {
    try {
      return await storageService.getItem('authToken');
    } catch (error) {
      return null;
    }
  }

  // Lấy user profile từ storage
  async getStoredProfile(): Promise<UserProfile | null> {
    try {
      const profileString = await storageService.getItem('userProfile');
      return profileString ? JSON.parse(profileString) : null;
    } catch (error) {
      return null;
    }
  }

  // Refresh profile từ server và cập nhật storage
  async refreshProfile(): Promise<UserProfile> {
    try {
      const profile = await this.getProfile();
      await storageService.setItem('userProfile', JSON.stringify(profile));
      return profile;
    } catch (error: any) {
      throw new Error('Không thể refresh profile');
    }
  }
}

export default new AuthService();
