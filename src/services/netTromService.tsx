// Service để fetch dữ liệu truyện từ NetTrom API
import axios from 'axios';
import { secureError, secureLog } from '../config/debugConfig';

// Base URL cho NetTrom API
const NETTROM_BASE_URL = 'https://otruyenapi.com/v1/api';

// Types cho NetTrom format
export interface NetTromManga {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  status: string;
  thumb_url: string;
  author: string[];
  category: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  content: string;
  updatedAt: string;
  chaptersLatest: Array<{
    filename: string;
    chapter_name: string;
    chapter_title: string;
    chapter_api_data: string;
  }>;
}

export interface NetTromChapter {
  _id: string;
  comic_name: string;
  chapter_name: string;
  chapter_title: string;
  chapter_path: string;
  chapter_image: Array<{
    image_page: number;
    image_file: string;
  }>;
}

// Document format cho app thư viện
export interface NetTromDocument {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  categoryId: string;
  access: 'Free' | 'VIP';
  content: string;
  chapters?: Array<{
    id: string;
    title: string;
    chapter: string;
    pages: number;
    publishedAt: string;
  }>;
  tags: string[];
  status: string;
  year?: number;
  rating: string;
  language: string;
  totalChapters: number;
  type: 'manga';
}

class NetTromService {
  private client = axios.create({
    baseURL: NETTROM_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  constructor() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        secureLog(`[NetTrom API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        secureError('[NetTrom API] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        secureLog(`[NetTrom API] Response ${response.status} for ${response.config.url}`);
        return response;
      },
      (error) => {
        secureError('[NetTrom API] Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Search manga
  async searchManga(params: {
    keyword?: string;
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<NetTromDocument[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.keyword) {
        searchParams.append('q', params.keyword);
      }
      
      searchParams.append('page', String(params.page || 1));
      searchParams.append('limit', String(params.limit || 20));
      
      if (params.status) {
        searchParams.append('status', params.status);
      }

      secureLog('[NetTrom] Searching manga with params:', Object.fromEntries(searchParams));

      const response = await this.client.get(`/truyen-tranh?${searchParams.toString()}`);
      const mangaList: NetTromManga[] = response.data.data?.items || [];

      return this.convertMangaListToDocuments(mangaList);
    } catch (error) {
      secureError('[NetTrom] Search manga error:', error);
      throw new Error('Không thể tải dữ liệu truyện từ NetTrom');
    }
  }

  // Get popular/latest manga
  async getPopularManga(page: number = 1, limit: number = 20): Promise<NetTromDocument[]> {
    try {
      const response = await this.client.get(`/truyen-tranh?page=${page}&limit=${limit}&status=completed`);
      const mangaList: NetTromManga[] = response.data.data?.items || [];

      return this.convertMangaListToDocuments(mangaList);
    } catch (error) {
      secureError('[NetTrom] Get popular manga error:', error);
      throw new Error('Không thể tải dữ liệu truyện phổ biến');
    }
  }

  // Get manga by category
  async getMangaByCategory(categorySlug: string, page: number = 1, limit: number = 20): Promise<NetTromDocument[]> {
    try {
      const response = await this.client.get(`/the-loai/${categorySlug}?page=${page}&limit=${limit}`);
      const mangaList: NetTromManga[] = response.data.data?.items || [];

      return this.convertMangaListToDocuments(mangaList);
    } catch (error) {
      secureError('[NetTrom] Get manga by category error:', error);
      throw new Error('Không thể tải dữ liệu truyện theo thể loại');
    }
  }

  // Get manga details with chapters
  async getMangaDetails(mangaSlug: string): Promise<NetTromDocument | null> {
    try {
      // Get manga info
      const mangaResponse = await this.client.get(`/truyen-tranh/${mangaSlug}`);
      const manga: NetTromManga = mangaResponse.data.data?.item;

      if (!manga) return null;

      // Get chapters list
      const chaptersResponse = await this.client.get(`/truyen-tranh/${mangaSlug}/chuong`);
      const chapters = chaptersResponse.data.data?.items || [];

      return this.convertMangaToDocument(manga, chapters);
    } catch (error) {
      secureError('[NetTrom] Get manga details error:', error);
      return null;
    }
  }

  // Get chapter images
  async getChapterImages(chapterApiData: string): Promise<string[]> {
    try {
      const response = await this.client.get(chapterApiData);
      const chapterData = response.data.data?.item;
      
      if (!chapterData?.chapter_image) return [];

      return chapterData.chapter_image
        .sort((a: any, b: any) => a.image_page - b.image_page)
        .map((img: any) => img.image_file);
    } catch (error) {
      secureError('[NetTrom] Get chapter images error:', error);
      return [];
    }
  }

  // Convert NetTrom data to app format
  private convertMangaListToDocuments(mangaList: NetTromManga[]): NetTromDocument[] {
    return mangaList.map(manga => this.convertMangaToDocument(manga)).filter(Boolean) as NetTromDocument[];
  }

  private convertMangaToDocument(manga: NetTromManga, chapters?: any[]): NetTromDocument {
    // Get cover image
    const coverImage = manga.thumb_url || 'https://placehold.co/400x600/3498db/ffffff?text=No+Cover';

    // Get author
    const authorName = Array.isArray(manga.author) ? manga.author.join(', ') : manga.author || 'Unknown Author';

    // Convert tags
    const tags = manga.category?.map(cat => cat.name) || [];

    // Determine category based on tags
    const categoryId = this.determineCategoryId(tags);

    // Convert chapters if provided
    const convertedChapters = chapters?.map((chapter, index) => ({
      id: chapter._id || `chapter-${index}`,
      title: chapter.chapter_title || chapter.chapter_name || `Chương ${chapter.chapter_name}`,
      chapter: chapter.chapter_name || String(index + 1),
      pages: 0, // NetTrom doesn't provide page count in list
      publishedAt: manga.updatedAt || new Date().toISOString(),
    })) || manga.chaptersLatest?.map((chapter, index) => ({
      id: chapter.filename || `chapter-${index}`,
      title: chapter.chapter_title || chapter.chapter_name || `Chương ${chapter.chapter_name}`,
      chapter: chapter.chapter_name || String(index + 1),
      pages: 0,
      publishedAt: manga.updatedAt || new Date().toISOString(),
    })) || [];

    return {
      id: manga._id,
      title: manga.name || 'Untitled Manga',
      author: authorName,
      description: manga.content || 'Không có mô tả.',
      image: coverImage,
      categoryId,
      access: 'Free', // NetTrom content is free
      content: `${manga.content}\n\nTruyện từ NetTrom với ${convertedChapters.length} chương.`,
      chapters: convertedChapters,
      tags,
      status: manga.status || 'unknown',
      year: undefined, // NetTrom doesn't provide year
      rating: 'safe',
      language: 'vi',
      totalChapters: convertedChapters.length,
      type: 'manga',
    };
  }

  private determineCategoryId(tags: string[]): string {
    // Map NetTrom tags to app categories
    const tagNames = tags.map(tag => tag.toLowerCase());

    // Category mapping based on common Vietnamese manga categories
    if (tagNames.some(tag => tag.includes('tình cảm') || tag.includes('romance'))) {
      return 'cat1'; // Romance
    }
    if (tagNames.some(tag => tag.includes('hành động') || tag.includes('action'))) {
      return 'cat2'; // Action
    }
    if (tagNames.some(tag => tag.includes('hài hước') || tag.includes('comedy'))) {
      return 'cat3'; // Comedy
    }
    if (tagNames.some(tag => tag.includes('fantasy') || tag.includes('phiêu lưu'))) {
      return 'cat4'; // Fantasy
    }
    if (tagNames.some(tag => tag.includes('shounen'))) {
      return 'cat5'; // Shounen
    }
    if (tagNames.some(tag => tag.includes('shoujo'))) {
      return 'cat6'; // Shoujo
    }

    return 'cat1'; // Default category
  }

  // Get available categories
  async getCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
    try {
      const response = await this.client.get('/the-loai');
      const categories = response.data.data?.items || [];

      return categories.map((cat: any) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
      }));
    } catch (error) {
      secureError('[NetTrom] Get categories error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const netTromService = new NetTromService();
export default netTromService;
