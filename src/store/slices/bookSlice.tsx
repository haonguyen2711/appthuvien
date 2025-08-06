import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import bookService, { Book } from '../../services/bookService';
import mangaDXService, { LibraryDocument } from '../../services/mangaDXService';
import netTromService, { NetTromDocument } from '../../services/netTromService';

interface Category {
  id: string;
  title: string;
  image: string;
  icon: string;
}

interface BookState {
  books: Book[];
  mangaBooks: LibraryDocument[]; // MangaDX books
  netTromBooks: NetTromDocument[]; // NetTrom books
  categories: Category[]; // Dynamic categories from MangaDX
  categoryManga: LibraryDocument[]; // Manga for selected category
  currentBook: Book | null;
  currentManga: LibraryDocument | null; // Current MangaDX manga
  currentNetTrom: NetTromDocument | null; // Current NetTrom manga
  searchResults: Book[];
  mangaSearchResults: LibraryDocument[]; // MangaDX search results
  netTromSearchResults: NetTromDocument[]; // NetTrom search results
  loading: boolean;
  mangaLoading: boolean; // MangaDX loading state
  netTromLoading: boolean; // NetTrom loading state
  categoriesLoading: boolean; // Categories loading state
  categoryMangaLoading: boolean; // Category manga loading state
  searchLoading: boolean;
  mangaSearchLoading: boolean; // MangaDX search loading
  netTromSearchLoading: boolean; // NetTrom search loading
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
  mangaBooks: [], // MangaDX books
  netTromBooks: [], // NetTrom books
  categories: [], // Dynamic categories from MangaDX
  categoryManga: [], // Manga for selected category
  currentBook: null,
  currentManga: null, // Current MangaDX manga
  currentNetTrom: null, // Current NetTrom manga
  searchResults: [],
  mangaSearchResults: [], // MangaDX search results
  netTromSearchResults: [], // NetTrom search results
  loading: false,
  mangaLoading: false, // MangaDX loading state
  netTromLoading: false, // NetTrom loading state
  categoriesLoading: false, // Categories loading state
  categoryMangaLoading: false, // Category manga loading state
  searchLoading: false,
  mangaSearchLoading: false, // MangaDX search loading
  netTromSearchLoading: false, // NetTrom search loading
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

// MangaDX async thunks
export const fetchMangaBooks = createAsyncThunk(
  'books/fetchMangaBooks',
  async ({ limit = 20, append = false }: { limit?: number; append?: boolean } = {}, { rejectWithValue }) => {
    try {
      const manga = await mangaDXService.getPopularManga(limit);
      return { manga, append };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchMangaBooks = createAsyncThunk(
  'books/searchMangaBooks',
  async ({ 
    title, 
    limit = 20, 
    append = false 
  }: { 
    title: string; 
    limit?: number; 
    append?: boolean; 
  }, { rejectWithValue }) => {
    try {
      const manga = await mangaDXService.searchManga({ title, limit });
      return { manga, append };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// NetTrom async thunks
export const fetchNetTromBooks = createAsyncThunk(
  'books/fetchNetTromBooks',
  async ({ page = 1, limit = 20, append = false }: { page?: number; limit?: number; append?: boolean } = {}, { rejectWithValue }) => {
    try {
      const manga = await netTromService.getPopularManga(page, limit);
      return { manga, append };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchNetTromBooks = createAsyncThunk(
  'books/searchNetTromBooks',
  async ({ 
    keyword, 
    page = 1, 
    limit = 20, 
    append = false 
  }: { 
    keyword: string; 
    page?: number; 
    limit?: number; 
    append?: boolean; 
  }, { rejectWithValue }) => {
    try {
      const manga = await netTromService.searchManga({ keyword, page, limit });
      return { manga, append };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Categories async thunk
export const fetchCategories = createAsyncThunk(
  'books/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await mangaDXService.getCategories();
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch manga by category
export const fetchMangaByCategory = createAsyncThunk(
  'books/fetchMangaByCategory',
  async ({ 
    categoryId, 
    limit = 20, 
    append = false 
  }: { 
    categoryId: string; 
    limit?: number; 
    append?: boolean; 
  }, { rejectWithValue }) => {
    try {
      console.log('📂 Fetching manga by category:', categoryId);
      
      // Check if categoryId is a valid MangaDX tag ID or fallback category
      if (categoryId.startsWith('default-') || categoryId.startsWith('fallback-')) {
        console.log('📂 Using fallback for category:', categoryId);
        // For default/fallback categories, fetch general manga
        const manga = await mangaDXService.searchManga({ limit });
        return { manga, append, categoryId };
      } else if (categoryId.length < 30) {
        // Old static category IDs (like "11", "cat1", etc.) - use fallback
        console.log('📂 Converting old category ID to general search:', categoryId);
        const manga = await mangaDXService.searchManga({ limit });
        return { manga, append, categoryId };
      } else {
        // Use actual tag ID for filtering
        const manga = await mangaDXService.getMangaByTag([categoryId], limit);
        return { manga, append, categoryId };
      }
    } catch (error: any) {
      console.error('❌ fetchMangaByCategory error:', error);
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
    setCurrentManga: (state, action: PayloadAction<LibraryDocument | null>) => {
      state.currentManga = action.payload;
    },
    setCurrentNetTrom: (state, action: PayloadAction<NetTromDocument | null>) => {
      state.currentNetTrom = action.payload;
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

    // MangaDX reducers
    builder
      .addCase(fetchMangaBooks.pending, (state) => {
        state.mangaLoading = true;
        state.error = null;
      })
      .addCase(fetchMangaBooks.fulfilled, (state, action) => {
        state.mangaLoading = false;
        if (action.payload.append) {
          state.mangaBooks = [...state.mangaBooks, ...action.payload.manga];
        } else {
          state.mangaBooks = action.payload.manga;
        }
      })
      .addCase(fetchMangaBooks.rejected, (state, action) => {
        state.mangaLoading = false;
        state.error = action.payload as string;
      });

    // Search manga books
    builder
      .addCase(searchMangaBooks.pending, (state) => {
        state.mangaSearchLoading = true;
        state.error = null;
      })
      .addCase(searchMangaBooks.fulfilled, (state, action) => {
        state.mangaSearchLoading = false;
        if (action.payload.append) {
          state.mangaSearchResults = [...state.mangaSearchResults, ...action.payload.manga];
        } else {
          state.mangaSearchResults = action.payload.manga;
        }
      })
      .addCase(searchMangaBooks.rejected, (state, action) => {
        state.mangaSearchLoading = false;
        state.error = action.payload as string;
      });

    // NetTrom reducers
    builder
      .addCase(fetchNetTromBooks.pending, (state) => {
        state.netTromLoading = true;
        state.error = null;
      })
      .addCase(fetchNetTromBooks.fulfilled, (state, action) => {
        state.netTromLoading = false;
        if (action.payload.append) {
          state.netTromBooks = [...state.netTromBooks, ...action.payload.manga];
        } else {
          state.netTromBooks = action.payload.manga;
        }
      })
      .addCase(fetchNetTromBooks.rejected, (state, action) => {
        state.netTromLoading = false;
        state.error = action.payload as string;
      });

    // Search NetTrom books
    builder
      .addCase(searchNetTromBooks.pending, (state) => {
        state.netTromSearchLoading = true;
        state.error = null;
      })
      .addCase(searchNetTromBooks.fulfilled, (state, action) => {
        state.netTromSearchLoading = false;
        if (action.payload.append) {
          state.netTromSearchResults = [...state.netTromSearchResults, ...action.payload.manga];
        } else {
          state.netTromSearchResults = action.payload.manga;
        }
      })
      .addCase(searchNetTromBooks.rejected, (state, action) => {
        state.netTromSearchLoading = false;
        state.error = action.payload as string;
      });

    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload as string;
      });

    // Fetch manga by category
    builder
      .addCase(fetchMangaByCategory.pending, (state) => {
        state.categoryMangaLoading = true;
        state.error = null;
      })
      .addCase(fetchMangaByCategory.fulfilled, (state, action) => {
        state.categoryMangaLoading = false;
        if (action.payload.append) {
          state.categoryManga = [...state.categoryManga, ...action.payload.manga];
        } else {
          state.categoryManga = action.payload.manga;
        }
      })
      .addCase(fetchMangaByCategory.rejected, (state, action) => {
        state.categoryMangaLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentBook,
  setCurrentManga,
  setCurrentNetTrom,
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
