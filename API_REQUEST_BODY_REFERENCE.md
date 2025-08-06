# 📝 API Request Body Reference for AI Agents

## 🎯 Mục đích
Tài liệu này cung cấp chi tiết đầy đủ về **request body**, **response format**, và **validation rules** cho tất cả API endpoints của Online Library System. AI Agent sử dụng tài liệu này để tạo code chính xác và handle errors properly.

## 🌐 Base Configuration

```javascript
// Base API Configuration
const API_CONFIG = {
  baseURL: {
    development: 'http://localhost:7070/api',
    production: 'https://your-domain.com/api'
  },
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Authentication Header (required for protected endpoints)
const authHeaders = {
  'Authorization': `Bearer ${JWT_TOKEN}`
}
```

## 🔐 Authentication APIs

### 1. Register New User
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",     // REQUIRED, 3-50 chars, alphanumeric + underscore
  "email": "string",        // REQUIRED, valid email format
  "password": "string",     // REQUIRED, min 6 chars
  "fullName": "string"      // REQUIRED, 1-100 chars
}
```

**Validation Rules:**
```javascript
const registerValidation = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: "Username must be 3-50 characters, alphanumeric and underscore only"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  password: {
    required: true,
    minLength: 6,
    message: "Password must be at least 6 characters"
  },
  fullName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: "Full name is required and must be 1-100 characters"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "STANDARD",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "error": "Username already exists"
}

// 400 - Multiple validation errors
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "username": "Username must be 3-50 characters",
    "email": "Please enter a valid email address"
  }
}
```

### 2. Login User
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",     // REQUIRED, can be username or email
  "password": "string"      // REQUIRED
}
```

**Validation Rules:**
```javascript
const loginValidation = {
  username: {
    required: true,
    message: "Username or email is required"
  },
  password: {
    required: true,
    message: "Password is required"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaWF0IjoxNjk5...",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "STANDARD",
    "isVip": false,
    "isAdmin": false,
    "vipExpiresAt": null,
    "tokenExpiresAt": "2024-01-16T10:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

## 📚 Books Management APIs

### 1. Get Books List (GET - No Request Body)
```http
GET /books/list?page=0&size=10&sort=createdAt,desc
Authorization: Bearer <token>
```

**Query Parameters:**
```javascript
const booksListParams = {
  page: {
    type: 'number',
    default: 0,
    min: 0,
    description: 'Page number (0-based)'
  },
  size: {
    type: 'number',
    default: 10,
    min: 1,
    max: 100,
    description: 'Items per page'
  },
  sort: {
    type: 'string',
    default: 'createdAt,desc',
    options: ['createdAt,desc', 'createdAt,asc', 'title,asc', 'title,desc', 'author,asc', 'author,desc'],
    description: 'Sort field and direction'
  }
}
```

### 2. Search Books (GET - No Request Body)
```http
GET /books/search?keyword=java&page=0&size=10
Authorization: Bearer <token>
```

**Query Parameters:**
```javascript
const searchParams = {
  keyword: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Search keyword for title and author'
  },
  page: { /* same as books list */ },
  size: { /* same as books list */ }
}
```

### 3. Upload Book (Admin Only)
```http
POST /books/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```javascript
const uploadBookFormData = {
  file: {
    type: 'file',
    required: true,
    accept: '.pdf',
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'PDF file to upload'
  },
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    description: 'Book title'
  },
  author: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Author name'
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Book description (optional)'
  }
}
```

**JavaScript Example:**
```javascript
const uploadBook = async (file, title, author, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('author', author);
  if (description) formData.append('description', description);
  
  const response = await fetch('/api/books/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData
    },
    body: formData
  });
  
  return response.json();
};
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Book uploaded successfully",
  "data": {
    "id": 123,
    "title": "Java Programming Guide",
    "author": "John Doe",
    "description": "Complete guide to Java programming",
    "originalFilename": "java_guide.pdf",
    "totalPages": 350,
    "fileSize": 5242880,
    "uploadedBy": "admin",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// 400 - File too large
{
  "success": false,
  "error": "File size exceeds maximum limit of 100MB"
}

// 400 - Invalid file type
{
  "success": false,
  "error": "Only PDF files are allowed"
}

// 400 - Validation error
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "author": "Author is required"
  }
}

// 403 - Insufficient permissions
{
  "success": false,
  "error": "Admin access required"
}
```

### 4. Update Book Info (Admin Only)
```http
PUT /books/{bookId}/info
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "string",        // OPTIONAL, 1-200 chars
  "author": "string",       // OPTIONAL, 1-100 chars
  "description": "string"   // OPTIONAL, max 1000 chars
}
```

**Validation Rules:**
```javascript
const updateBookValidation = {
  title: {
    required: false,
    minLength: 1,
    maxLength: 200,
    message: "Title must be 1-200 characters if provided"
  },
  author: {
    required: false,
    minLength: 1,
    maxLength: 100,
    message: "Author must be 1-100 characters if provided"
  },
  description: {
    required: false,
    maxLength: 1000,
    message: "Description must not exceed 1000 characters"
  }
}
```

## 👥 User Management APIs

### 1. Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "string",     // OPTIONAL, 1-100 chars
  "email": "string"         // OPTIONAL, valid email format
}
```

**Validation Rules:**
```javascript
const updateProfileValidation = {
  fullName: {
    required: false,
    minLength: 1,
    maxLength: 100,
    message: "Full name must be 1-100 characters if provided"
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address if provided"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "user123",
    "email": "updated@example.com",
    "fullName": "Updated Name",
    "role": "STANDARD",
    "isVip": false,
    "vipExpiresAt": null,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Change Password
```http
POST /users/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "string",  // REQUIRED
  "newPassword": "string"   // REQUIRED, min 6 chars
}
```

**Validation Rules:**
```javascript
const changePasswordValidation = {
  oldPassword: {
    required: true,
    message: "Current password is required"
  },
  newPassword: {
    required: true,
    minLength: 6,
    message: "New password must be at least 6 characters"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

### 3. Create User (Admin Only)
```http
POST /users/manage/create
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",     // REQUIRED, 3-50 chars, unique
  "email": "string",        // REQUIRED, valid email, unique
  "password": "string",     // REQUIRED, min 6 chars
  "fullName": "string",     // REQUIRED, 1-100 chars
  "role": "string",         // REQUIRED, enum: "STANDARD", "VIP", "ADMIN"
  "isActive": boolean,      // OPTIONAL, default true
  "vipExpiresAt": "string"  // OPTIONAL, ISO date string, required if role = "VIP"
}
```

**Validation Rules:**
```javascript
const createUserValidation = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    unique: true,
    message: "Username must be 3-50 characters, alphanumeric and underscore only, and unique"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
    message: "Please enter a valid and unique email address"
  },
  password: {
    required: true,
    minLength: 6,
    message: "Password must be at least 6 characters"
  },
  fullName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: "Full name is required and must be 1-100 characters"
  },
  role: {
    required: true,
    enum: ['STANDARD', 'VIP', 'ADMIN'],
    message: "Role must be one of: STANDARD, VIP, ADMIN"
  },
  isActive: {
    required: false,
    type: 'boolean',
    default: true,
    message: "isActive must be a boolean value"
  },
  vipExpiresAt: {
    required: false,
    conditionalRequired: (data) => data.role === 'VIP',
    type: 'date',
    format: 'ISO8601',
    message: "VIP expiration date is required when role is VIP"
  }
}
```

### 4. Update User Role (Admin Only)
```http
POST /users/manage/{userId}/role
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "string",         // REQUIRED, enum: "STANDARD", "VIP", "ADMIN"
  "vipExpiresAt": "string"  // OPTIONAL, ISO date string, required if role = "VIP"
}
```

**Validation Rules:**
```javascript
const updateRoleValidation = {
  role: {
    required: true,
    enum: ['STANDARD', 'VIP', 'ADMIN'],
    message: "Role must be one of: STANDARD, VIP, ADMIN"
  },
  vipExpiresAt: {
    required: false,
    conditionalRequired: (data) => data.role === 'VIP',
    type: 'date',
    format: 'ISO8601',
    futureDate: true,
    message: "VIP expiration date is required when role is VIP and must be a future date"
  }
}
```

## 🚨 Error Handling Patterns

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.123Z",
  "path": "/api/books/1",
  "details": {
    // Additional error details (optional)
  }
}
```

### HTTP Status Codes
```javascript
const httpStatusCodes = {
  200: 'OK - Success',
  400: 'Bad Request - Validation error or malformed request',
  401: 'Unauthorized - Invalid or missing token',
  403: 'Forbidden - Insufficient permissions',
  404: 'Not Found - Resource not found',
  413: 'Payload Too Large - File size exceeds limit',
  415: 'Unsupported Media Type - Invalid file type',
  429: 'Too Many Requests - Rate limit exceeded',
  500: 'Internal Server Error - Server error'
}
```

### Error Handling in Frontend
```javascript
const handleApiError = (error, response) => {
  if (response?.status === 401) {
    // Token expired or invalid
    clearAuthToken();
    redirectToLogin();
    return 'Session expired. Please login again.';
  } else if (response?.status === 403) {
    return 'You do not have permission to perform this action.';
  } else if (response?.status === 400) {
    // Validation errors
    if (response.data?.details) {
      return Object.values(response.data.details).join(', ');
    }
    return response.data?.error || 'Invalid request.';
  } else if (response?.status === 404) {
    return 'Resource not found.';
  } else if (response?.status === 413) {
    return 'File is too large. Maximum size is 100MB.';
  } else if (response?.status === 415) {
    return 'File type not supported. Only PDF files are allowed.';
  } else if (response?.status >= 500) {
    return 'Server error. Please try again later.';
  } else {
    return 'An unexpected error occurred.';
  }
};
```

## 🔄 Request/Response Examples for AI Implementation

### React Hook Example
```javascript
// Custom hook for API calls with proper error handling
import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API call failed');
      }
      
      return data;
    } catch (err) {
      const errorMessage = handleApiError(err, response);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error };
};

// Usage examples
const { apiCall, loading, error } = useApi();

// Login
const login = async (username, password) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

// Upload book
const uploadBook = async (file, title, author, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('author', author);
  if (description) formData.append('description', description);
  
  return apiCall('/books/upload', {
    method: 'POST',
    headers: {}, // Remove Content-Type for FormData
    body: formData
  });
};

// Update profile
const updateProfile = async (fullName, email) => {
  return apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify({ fullName, email })
  });
};
```

### Form Validation Example
```javascript
// Validation utilities
export const validators = {
  required: (value) => value && value.trim() !== '',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (min) => (value) => value && value.length >= min,
  maxLength: (max) => (value) => !value || value.length <= max,
  username: (value) => /^[a-zA-Z0-9_]+$/.test(value),
  fileSize: (maxSize) => (file) => !file || file.size <= maxSize,
  fileType: (types) => (file) => !file || types.includes(file.type)
};

// Form validation hook
export const useFormValidation = (validationRules) => {
  const [errors, setErrors] = useState({});
  
  const validate = (data) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = data[field];
      
      for (const rule of rules) {
        if (!rule.validator(value)) {
          newErrors[field] = rule.message;
          break;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return { errors, validate };
};

// Usage in component
const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { errors, validate } = useFormValidation({
    username: [
      { validator: validators.required, message: 'Username is required' }
    ],
    password: [
      { validator: validators.required, message: 'Password is required' },
      { validator: validators.minLength(6), message: 'Password must be at least 6 characters' }
    ]
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate(formData)) {
      // Make API call
      await login(formData.username, formData.password);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
      />
      {errors.username && <span className="error">{errors.username}</span>}
      
      <input 
        type="password" 
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
};
```

## 📱 Mobile-Specific Considerations

### React Native FormData
```javascript
// React Native file upload
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const uploadBookMobile = async (title, author, description) => {
  try {
    // Pick PDF file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true
    });
    
    if (result.type === 'success') {
      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        type: 'application/pdf',
        name: result.name
      } as any);
      formData.append('title', title);
      formData.append('author', author);
      if (description) formData.append('description', description);
      
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await fetch(`${API_BASE_URL}/books/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });
      
      return response.json();
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

### Binary Data Handling
```javascript
// Handle book page images
const getBookPage = async (bookId, pageNumber) => {
  const token = await SecureStore.getItemAsync('authToken');
  
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/page/${pageNumber}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const base64 = await FileSystem.readAsStringAsync(response.uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    return `data:image/jpeg;base64,${base64}`;
  } else {
    throw new Error('Failed to load page');
  }
};

// Handle PDF downloads
const downloadPDF = async (bookId, filename) => {
  const token = await SecureStore.getItemAsync('authToken');
  
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const fileUri = `${FileSystem.documentDirectory}${filename}.pdf`;
    const downloadResult = await FileSystem.downloadAsync(
      `${API_BASE_URL}/books/${bookId}/download`,
      fileUri,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return downloadResult.uri;
  } else {
    throw new Error('Download failed');
  }
};
```

## 🎯 AI Agent Implementation Guidelines

### 1. Always validate inputs before API calls
### 2. Handle all possible error scenarios
### 3. Implement proper loading states
### 4. Use appropriate content types for different request types
### 5. Store JWT tokens securely
### 6. Implement token refresh logic
### 7. Handle file uploads with progress indicators
### 8. Cache responses appropriately
### 9. Implement offline support where possible
### 10. Follow security best practices

**Tài liệu này đảm bảo AI Agent tạo code chính xác và robust cho Online Library System! 🚀📝**
