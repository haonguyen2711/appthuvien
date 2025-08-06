import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import bookService, { Book } from '../../services/bookService';

interface BookState {
  books: Book[];
  currentBook: Book | null;
  searchResults: Book[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    hasMore: boolean;
  };
  searchPagination: {
    page: number;
    size: number;
    totalPages: number;
    hasMore: boolean;
  };
  currentPage: number;
  bookmarks: number[];
  downloadProgress: { [bookId: number]: number };
}

const initialState: BookState = {
  books: [],
  currentBook: null,
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    hasMore: true,
  },
  searchPagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    hasMore: true,
  },
  currentPage: 1,
  bookmarks: [],
  downloadProgress: {},
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ page = 0, size = 10, sort = 'createdAt,desc', append = false }: 
    { page?: number; size?: number; sort?: string; append?: boolean }, 
    { rejectWithValue }) => {
    try {
      const response = await bookService.getBooks(page, size, sort);
      return { ...response, append };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async ({ keyword, page = 0, size = 10, append = false }: 
    { keyword: string; page?: number; size?: number; append?: boolean }, 
    { rejectWithValue }) => {
    try {
      const response = await bookService.searchBooks(keyword, page, size);
      return { ...response, append };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookInfo = createAsyncThunk(
  'books/fetchBookInfo',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const book = await bookService.getBookInfo(bookId);
      return book;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const downloadBook = createAsyncThunk(
  'books/downloadBook',
  async (bookId: number, { dispatch, rejectWithValue }) => {
    try {
      const url = await bookService.downloadBook(bookId, (progress: number) => {
        dispatch(updateDownloadProgress({ bookId, progress }));
      });
      dispatch(updateDownloadProgress({ bookId, progress: 100 }));
      return { bookId, url };
    } catch (error: any) {
      dispatch(updateDownloadProgress({ bookId, progress: 0 }));
      return rejectWithValue(error.message);
    }
  }
);

export const uploadBook = createAsyncThunk(
  'books/uploadBook',
  async ({ file, title, author, description }: 
    { file: File; title: string; author: string; description: string }, 
    { rejectWithValue }) => {
    try {
      const book = await bookService.uploadBook(file, title, author, description);
      return book;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      await bookService.deleteBook(bookId);
      return bookId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setCurrentBook: (state, action: PayloadAction<Book | null>) => {
      state.currentBook = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    addBookmark: (state, action: PayloadAction<number>) => {
      if (!state.bookmarks.includes(action.payload)) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmark: (state, action: PayloadAction<number>) => {
      state.bookmarks = state.bookmarks.filter(page => page !== action.payload);
    },
    clearBookmarks: (state) => {
      state.bookmarks = [];
    },
    updateDownloadProgress: (state, action: PayloadAction<{ bookId: number; progress: number }>) => {
      state.downloadProgress[action.payload.bookId] = action.payload.progress;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = initialState.searchPagination;
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    // Fetch books
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        const { data, append } = action.payload;
        
        if (append) {
          state.books = [...state.books, ...data.content];
        } else {
          state.books = data.content;
        }
        
        state.pagination = {
          page: data.pageable.pageNumber,
          size: data.pageable.pageSize,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          hasMore: !data.last,
        };
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search books
    builder
      .addCase(searchBooks.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.searchLoading = false;
        const { data, append } = action.payload;
        
        if (append) {
          state.searchResults = [...state.searchResults, ...data.content];
        } else {
          state.searchResults = data.content;
        }
        
        state.searchPagination = {
          page: data.pageable.pageNumber,
          size: data.pageable.pageSize,
          totalPages: data.totalPages,
          hasMore: !data.last,
        };
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      });

    // Fetch book info
    builder
      .addCase(fetchBookInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Download book
    builder
      .addCase(downloadBook.fulfilled, (state, action) => {
        // Reset download progress
        delete state.downloadProgress[action.payload.bookId];
      })
      .addCase(downloadBook.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Upload book
    builder
      .addCase(uploadBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.unshift(action.payload);
      })
      .addCase(uploadBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete book
    builder
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book: Book) => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentBook,
  setCurrentPage,
  addBookmark,
  removeBookmark,
  clearBookmarks,
  updateDownloadProgress,
  clearError,
  clearSearchResults,
  resetPagination,
} = bookSlice.actions;

export default bookSlice.reducer;
