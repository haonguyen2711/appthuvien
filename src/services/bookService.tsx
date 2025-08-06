import { formatValidationErrors, validateApiRequest, validateFileSize, validateFileType } from '../utils/apiValidation';
import { formatErrorMessage, logErrorDetails } from '../utils/errorHandler';
import api from './api';

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  originalFilename: string;
  totalPages: number;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookListResponse {
  success: boolean;
  data: {
    content: Book[];
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

export interface BookStatistics {
  totalViews: number;
  totalDownloads: number;
  uniqueUsers: number;
  lastAccessedAt: string;
  popularPages: number[];
}

class BookService {
  // Lấy danh sách sách với phân trang - tuân theo tiêu chuẩn API
  async getBooks(page = 0, size = 10, sort = 'createdAt,desc'): Promise<BookListResponse> {
    try {
      // Validate query parameters theo tiêu chuẩn API
      if (page < 0) throw new Error('Page number must be 0 or greater');
      if (size < 1 || size > 100) throw new Error('Page size must be between 1 and 100');
      
      const allowedSorts = ['createdAt,desc', 'createdAt,asc', 'title,asc', 'title,desc', 'author,asc', 'author,desc'];
      if (!allowedSorts.includes(sort)) {
        throw new Error('Invalid sort parameter');
      }

      const response = await api.get('/books/list', {
        params: { page, size, sort }
      });
      return response.data;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.getBooks');
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy danh sách sách';
      throw new Error(errorMessage);
    }
  }

  // Tìm kiếm sách - tuân theo tiêu chuẩn API
  async searchBooks(keyword: string, page = 0, size = 10): Promise<BookListResponse> {
    try {
      // Validate search parameters theo tiêu chuẩn API
      if (!keyword || keyword.trim().length === 0) {
        throw new Error('Search keyword is required');
      }
      if (keyword.length > 100) {
        throw new Error('Search keyword must not exceed 100 characters');
      }
      if (page < 0) throw new Error('Page number must be 0 or greater');
      if (size < 1 || size > 100) throw new Error('Page size must be between 1 and 100');

      const response = await api.get('/books/search', {
        params: { keyword: keyword.trim(), page, size }
      });
      return response.data;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.searchBooks');
      const errorMessage = formatErrorMessage(error) || 'Tìm kiếm thất bại';
      throw new Error(errorMessage);
    }
  }

  // Lấy thông tin chi tiết sách
  async getBookInfo(bookId: number): Promise<Book> {
    try {
      const response = await api.get(`/books/${bookId}/info`);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.getBookInfo');
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy thông tin sách';
      throw new Error(errorMessage);
    }
  }

  // Lấy trang sách (ảnh có watermark)
  async getBookPage(bookId: number, pageNumber: number): Promise<{ uri: string }> {
    try {
      const response = await api.get(`/books/${bookId}/page/${pageNumber}`, {
        responseType: 'blob'
      });
      
      // Convert blob to local URI for React Native Image
      const blob = response.data;
      const uri = URL.createObjectURL(blob);
      
      return { uri };
    } catch (error: any) {
      logErrorDetails(error, 'BookService.getBookPage');
      const errorMessage = formatErrorMessage(error) || 'Không thể tải trang sách';
      throw new Error(errorMessage);
    }
  }

  // Tải xuống PDF gốc (chỉ VIP)
  async downloadBook(bookId: number, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const response = await api.get(`/books/${bookId}/download`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });

      // Handle file download for mobile
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.downloadBook');
      if (error.response?.status === 403) {
        throw new Error('Chỉ thành viên VIP mới có thể tải sách');
      }
      const errorMessage = formatErrorMessage(error) || 'Tải sách thất bại';
      throw new Error(errorMessage);
    }
  }

  // Upload sách (chỉ Admin) - tuân theo tiêu chuẩn API
  async uploadBook(
    file: File, 
    title: string, 
    author: string, 
    description: string,
    onProgress?: (progress: number) => void
  ): Promise<Book> {
    try {
      // Validate input theo tiêu chuẩn API
      const uploadData = { title, author, description, file };
      const validation = validateApiRequest('books/upload', uploadData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      // Validate file size (100MB max theo tiêu chuẩn API)
      if (!validateFileSize(file, 100)) {
        throw new Error('File size exceeds maximum limit of 100MB');
      }

      // Validate file type (chỉ PDF theo tiêu chuẩn API)
      if (!validateFileType(file, ['application/pdf'])) {
        throw new Error('Only PDF files are allowed');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      if (description && description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await api.post('/books/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });

      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.uploadBook');
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 413) {
        throw new Error('File size exceeds maximum limit of 100MB');
      } else if (error.response?.status === 415) {
        throw new Error('Only PDF files are allowed');
      }
      const errorMessage = formatErrorMessage(error) || 'Upload sách thất bại';
      throw new Error(errorMessage);
    }
  }

  // Cập nhật thông tin sách (chỉ Admin) - tuân theo tiêu chuẩn API
  async updateBookInfo(
    bookId: number,
    updateData: { title?: string; author?: string; description?: string }
  ): Promise<Book> {
    try {
      // Validate input theo tiêu chuẩn API
      const validation = validateApiRequest('books/update', updateData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      // Clean up data - trim whitespace
      const cleanData: any = {};
      if (updateData.title && updateData.title.trim()) {
        cleanData.title = updateData.title.trim();
      }
      if (updateData.author && updateData.author.trim()) {
        cleanData.author = updateData.author.trim();
      }
      if (updateData.description !== undefined) {
        cleanData.description = updateData.description.trim();
      }

      const response = await api.put(`/books/${bookId}/info`, cleanData);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.updateBookInfo');
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      } else if (error.response?.status === 404) {
        throw new Error('Book not found');
      }
      const errorMessage = formatErrorMessage(error) || 'Cập nhật thông tin sách thất bại';
      throw new Error(errorMessage);
    }
  }

  // Xóa sách (chỉ Admin)
  async deleteBook(bookId: number): Promise<void> {
    try {
      await api.delete(`/books/${bookId}/delete`);
    } catch (error: any) {
      logErrorDetails(error, 'BookService.deleteBook');
      if (error.response?.status === 403) {
        throw new Error('Chỉ Admin mới có thể xóa sách');
      }
      const errorMessage = formatErrorMessage(error) || 'Xóa sách thất bại';
      throw new Error(errorMessage);
    }
  }

  // Lấy thống kê sách (chỉ Admin)
  async getBookStatistics(bookId: number): Promise<BookStatistics> {
    try {
      const response = await api.get(`/books/${bookId}/statistics`);
      return response.data.data;
    } catch (error: any) {
      logErrorDetails(error, 'BookService.getBookStatistics');
      if (error.response?.status === 403) {
        throw new Error('Chỉ Admin mới có thể xem thống kê');
      }
      const errorMessage = formatErrorMessage(error) || 'Không thể lấy thống kê';
      throw new Error(errorMessage);
    }
  }

  // Cache helper methods for offline support
  private getCacheKey(bookId: number, pageNumber: number): string {
    return `book_${bookId}_page_${pageNumber}`;
  }

  // Lưu trang vào cache (để đọc offline)
  async cacheBookPage(bookId: number, pageNumber: number, imageUri: string): Promise<void> {
    try {
      // Implement caching logic using AsyncStorage or FileSystem
      // This is a placeholder for actual implementation
      console.log(`Caching page ${pageNumber} of book ${bookId}`);
    } catch (error) {
      console.error('Error caching page:', error);
    }
  }

  // Lấy trang từ cache
  async getCachedBookPage(bookId: number, pageNumber: number): Promise<string | null> {
    try {
      // Implement cache retrieval logic
      // This is a placeholder for actual implementation
      return null;
    } catch (error) {
      console.error('Error getting cached page:', error);
      return null;
    }
  }
}

export default new BookService();
