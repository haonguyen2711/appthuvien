import { formatValidationErrors, validateApiRequest } from '../utils/apiValidation';
import { formatErrorMessage, logErrorDetails } from '../utils/errorHandler';
import api from './api';

// Interfaces theo tiêu chuẩn API document
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'STANDARD' | 'VIP' | 'ADMIN';
  isActive?: boolean;
  vipExpiresAt?: string; // ISO date string, required if role = "VIP"
}

export interface UpdateUserRoleRequest {
  role: 'STANDARD' | 'VIP' | 'ADMIN';
  vipExpiresAt?: string; // ISO date string, required if role = "VIP"
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'STANDARD' | 'VIP' | 'ADMIN';
  isActive: boolean;
  isVip: boolean;
  vipExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    content: User[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        sorted: boolean;
        direction: string;
        property: string;
      };
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
  };
}

class AdminService {
  // Tạo user mới (Admin only) - tuân theo tiêu chuẩn API
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Validate input theo tiêu chuẩn API
      const validation = validateApiRequest('users/manage/create', userData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      // Clean up data - trim whitespace và validate conditional fields
      const cleanData = {
        ...userData,
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        fullName: userData.fullName.trim(),
        isActive: userData.isActive !== undefined ? userData.isActive : true
      };

      // Validate conditional required field
      if (cleanData.role === 'VIP' && !cleanData.vipExpiresAt) {
        throw new Error('VIP expiration date is required when role is VIP');
      }

      // Validate VIP expiration date format and future date
      if (cleanData.vipExpiresAt) {
        const expirationDate = new Date(cleanData.vipExpiresAt);
        if (isNaN(expirationDate.getTime())) {
          throw new Error('VIP expiration date must be a valid ISO date string');
        }
        if (expirationDate <= new Date()) {
          throw new Error('VIP expiration date must be a future date');
        }
      }

      const response = await api.post('/users/manage/create', cleanData);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.createUser');
      
      // Handle specific API errors
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 400) {
        // Handle validation errors from backend
        const backendMessage = error.response?.data?.error;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
        // Handle multiple validation errors
        if (error.response?.data?.details) {
          const validationErrors = Object.values(error.response.data.details).join(', ');
          throw new Error(validationErrors);
        }
      }
      
      const errorMessage = formatErrorMessage(error) || 'Tạo user thất bại';
      throw new Error(errorMessage);
    }
  }

  // Cập nhật role user (Admin only) - tuân theo tiêu chuẩn API
  async updateUserRole(userId: number, roleData: UpdateUserRoleRequest): Promise<User> {
    try {
      // Validate input theo tiêu chuẩn API
      const validation = validateApiRequest('users/manage/role', roleData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      // Validate conditional required field
      if (roleData.role === 'VIP' && !roleData.vipExpiresAt) {
        throw new Error('VIP expiration date is required when role is VIP');
      }

      // Validate VIP expiration date format and future date
      if (roleData.vipExpiresAt) {
        const expirationDate = new Date(roleData.vipExpiresAt);
        if (isNaN(expirationDate.getTime())) {
          throw new Error('VIP expiration date must be a valid ISO date string');
        }
        if (expirationDate <= new Date()) {
          throw new Error('VIP expiration date must be a future date');
        }
      }

      const response = await api.post(`/users/manage/${userId}/role`, roleData);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.updateUserRole');
      
      // Handle specific API errors
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.error;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
      }
      
      const errorMessage = formatErrorMessage(error) || 'Cập nhật role user thất bại';
      throw new Error(errorMessage);
    }
  }

  // Lấy danh sách users (Admin only)
  async getUsers(page = 0, size = 10, sort = 'createdAt,desc'): Promise<UsersListResponse> {
    try {
      // Validate query parameters
      if (page < 0) throw new Error('Page number must be 0 or greater');
      if (size < 1 || size > 100) throw new Error('Page size must be between 1 and 100');
      
      const allowedSorts = ['createdAt,desc', 'createdAt,asc', 'username,asc', 'username,desc', 'email,asc', 'email,desc'];
      if (!allowedSorts.includes(sort)) {
        throw new Error('Invalid sort parameter');
      }

      const response = await api.get('/users/manage/list', {
        params: { page, size, sort }
      });
      return response.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.getUsers');
      
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      }
      
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy danh sách users';
      throw new Error(errorMessage);
    }
  }

  // Tìm kiếm users (Admin only)
  async searchUsers(keyword: string, page = 0, size = 10): Promise<UsersListResponse> {
    try {
      // Validate search parameters
      if (!keyword || keyword.trim().length === 0) {
        throw new Error('Search keyword is required');
      }
      if (keyword.length > 100) {
        throw new Error('Search keyword must not exceed 100 characters');
      }
      if (page < 0) throw new Error('Page number must be 0 or greater');
      if (size < 1 || size > 100) throw new Error('Page size must be between 1 and 100');

      const response = await api.get('/users/manage/search', {
        params: { keyword: keyword.trim(), page, size }
      });
      return response.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.searchUsers');
      
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      }
      
      const errorMessage = formatErrorMessage(error) || 'Tìm kiếm users thất bại';
      throw new Error(errorMessage);
    }
  }

  // Lấy thông tin chi tiết user (Admin only)
  async getUserInfo(userId: number): Promise<User> {
    try {
      const response = await api.get(`/users/manage/${userId}/info`);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.getUserInfo');
      
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy thông tin user';
      throw new Error(errorMessage);
    }
  }

  // Kích hoạt/vô hiệu hóa user (Admin only)
  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    try {
      const response = await api.post(`/users/manage/${userId}/status`, { isActive });
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.toggleUserStatus');
      
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      
      const errorMessage = formatErrorMessage(error) || 'Cập nhật trạng thái user thất bại';
      throw new Error(errorMessage);
    }
  }

  // Xóa user (Admin only)
  async deleteUser(userId: number): Promise<void> {
    try {
      await api.delete(`/users/manage/${userId}/delete`);
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.deleteUser');
      
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.status === 409) {
        throw new Error('Cannot delete user with existing data');
      }
      
      const errorMessage = formatErrorMessage(error) || 'Xóa user thất bại';
      throw new Error(errorMessage);
    }
  }

  // Lấy thống kê hệ thống (Admin only)
  async getSystemStatistics(): Promise<any> {
    try {
      const response = await api.get('/admin/statistics');
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'AdminService.getSystemStatistics');
      
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      }
      
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy thống kê hệ thống';
      throw new Error(errorMessage);
    }
  }

  // Helper function để format date cho VIP expiration
  static formatVipExpirationDate(date: Date): string {
    return date.toISOString();
  }

  // Helper function để validate VIP expiration date
  static validateVipExpirationDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date > new Date();
  }
}

export default new AdminService();
