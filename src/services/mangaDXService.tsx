// Service để fetch dữ liệu truyện từ MangaDx API (từ truyendex project)
import axios from 'axios';
import { secureError, secureLog } from '../config/debugConfig';

// Base URL cho MangaDX API
const MANGADEX_BASE_URL = 'https://api.mangadex.org';

// Types chuyển đổi từ MangaDX format sang app format
export interface MangaDXManga {
  id: string;
  type: 'manga';
  attributes: {
    title: Record<string, string>;
    description: Record<string, string>;
    isLocked: boolean;
    originalLanguage: string;
    lastVolume?: string;
    lastChapter?: string;
    publicationDemographic?: string;
    status: string;
    year?: number;
    contentRating: string;
    tags: Array<{
      id: string;
      type: 'tag';
      attributes: {
        name: Record<string, string>;
        description: Record<string, string>;
        group: string;
        version: number;
      };
    }>;
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: any;
  }>;
}

export interface MangaDXChapter {
  id: string;
  type: 'chapter';
  attributes: {
    volume?: string;
    chapter?: string;
    title?: string;
    translatedLanguage: string;
    externalUrl?: string;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: any;
  }>;
}

// Document format cho app thư viện
export interface LibraryDocument {
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
}

class MangaDXService {
  private client = axios.create({
    baseURL: MANGADEX_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        secureLog(`[API} ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        secureError('[API}Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ [API}${response.config.url} - ${response.status}`);
        secureLog(`[API}Response ${response.status} for ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ [API}Response Error:', error?.config?.url, error?.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        secureError('[API}Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Search manga với Vietnamese content
  async searchManga(params: {
    title?: string;
    limit?: number;
    offset?: number;
    status?: string[];
    contentRating?: string[];
    demographic?: string[];
  } = {}): Promise<LibraryDocument[]> {
    try {
      console.log('🔍 Searching manga with params:', params);
      const searchParams = new URLSearchParams();
      
      // Default params for Vietnamese content
      searchParams.append('availableTranslatedLanguage[]', 'vi'); // Vietnamese
      searchParams.append('limit', String(params.limit || 20));
      searchParams.append('offset', String(params.offset || 0));
      searchParams.append('order[latestUploadedChapter]', 'desc');
      searchParams.append('includes[]', 'cover_art');
      searchParams.append('includes[]', 'author');
      searchParams.append('includes[]', 'artist');

      // Add search filters
      if (params.title) {
        searchParams.append('title', params.title);
      }

      if (params.status?.length) {
        params.status.forEach(status => {
          searchParams.append('status[]', status);
        });
      } else {
        // Default to ongoing and completed
        searchParams.append('status[]', 'ongoing');
        searchParams.append('status[]', 'completed');
      }

      if (params.contentRating?.length) {
        params.contentRating.forEach(rating => {
          searchParams.append('contentRating[]', rating);
        });
      } else {
        // Default content ratings
        searchParams.append('contentRating[]', 'safe');
        searchParams.append('contentRating[]', 'suggestive');
      }

      secureLog('[MangaDX] Searching manga with params:', Object.fromEntries(searchParams));

      const response = await this.client.get(`/manga?${searchParams.toString()}`);
      const mangaList: MangaDXManga[] = response.data.data || [];

      console.log('📖 Retrieved manga count:', mangaList.length);
      const documents = this.convertMangaListToDocuments(mangaList);
      console.log('📖 Converted documents count:', documents.length);
      return documents;
    } catch (error) {
      console.error('❌ Search manga error:', error);
      secureError('[MangaDX] Search manga error:', error);
      throw new Error('Không thể tải dữ liệu truyện từ MangaDx');
    }
  }

  // Get popular/latest manga
  async getPopularManga(limit: number = 20): Promise<LibraryDocument[]> {
    console.log('📖 Fetching popular manga with limit:', limit);
    return this.searchManga({
      limit,
      status: ['ongoing', 'completed'],
      contentRating: ['safe', 'suggestive']
    });
  }

  // Get manga by category/tags
  async getMangaByTag(tagIds: string[], limit: number = 20): Promise<LibraryDocument[]> {
    try {
      const searchParams = new URLSearchParams();
      
      searchParams.append('availableTranslatedLanguage[]', 'vi');
      searchParams.append('limit', String(limit));
      searchParams.append('order[latestUploadedChapter]', 'desc');
      searchParams.append('includes[]', 'cover_art');
      searchParams.append('includes[]', 'author');

      // Add tag filters
      tagIds.forEach(tagId => {
        searchParams.append('includedTags[]', tagId);
      });

      const response = await this.client.get(`/manga?${searchParams.toString()}`);
      const mangaList: MangaDXManga[] = response.data.data || [];

      return this.convertMangaListToDocuments(mangaList);
    } catch (error) {
      secureError('[MangaDX] Get manga by tag error:', error);
      throw new Error('Không thể tải dữ liệu truyện theo thể loại');
    }
  }

  // Get manga details with chapters
  async getMangaDetails(mangaId: string): Promise<LibraryDocument | null> {
    try {
      // Get manga info
      const mangaResponse = await this.client.get(`/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`);
      const manga: MangaDXManga = mangaResponse.data.data;

      if (!manga) return null;

      // Get chapters
      const chaptersResponse = await this.client.get(
        `/manga/${mangaId}/feed?translatedLanguage[]=vi&limit=100&offset=0&order[chapter]=asc`
      );
      const chapters: MangaDXChapter[] = chaptersResponse.data.data || [];

      return this.convertMangaToDocument(manga, chapters);
    } catch (error) {
      secureError('[MangaDX] Get manga details error:', error);
      return null;
    }
  }

  // Convert MangaDX data to app format
  private convertMangaListToDocuments(mangaList: MangaDXManga[]): LibraryDocument[] {
    return mangaList.map(manga => this.convertMangaToDocument(manga)).filter(Boolean) as LibraryDocument[];
  }

  private convertMangaToDocument(manga: MangaDXManga, chapters?: MangaDXChapter[]): LibraryDocument {
    const vietnameseTitle = this.getVietnameseText(manga.attributes.title);
    const description = this.getVietnameseText(manga.attributes.description);
    
    // Get cover image - FIX URL
    const coverRelation = manga.relationships.find(rel => rel.type === 'cover_art');
    const coverFileName = coverRelation?.attributes?.fileName;
    const coverImage = coverFileName 
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.512.jpg`
      : 'https://placehold.co/400x600/3498db/ffffff?text=No+Cover';

    // Get author
    const authorRelation = manga.relationships.find(rel => rel.type === 'author');
    const authorName = authorRelation?.attributes?.name || 'Unknown Author';

    // Convert tags
    const tags = manga.attributes.tags.map(tag => 
      this.getVietnameseText(tag.attributes.name) || 'Unknown Tag'
    );

    // Determine category based on tags and demographic
    const categoryId = this.determineCategoryId(manga.attributes.tags, manga.attributes.publicationDemographic);

    // Convert chapters if provided
    const convertedChapters = chapters?.map(chapter => ({
      id: chapter.id,
      title: chapter.attributes.title || `Chương ${chapter.attributes.chapter || '??'}`,
      chapter: chapter.attributes.chapter || '??',
      pages: chapter.attributes.pages || 0,
      publishedAt: chapter.attributes.publishAt,
    })) || [];

    return {
      id: manga.id,
      title: vietnameseTitle || 'Untitled Manga',
      author: authorName,
      description: description || 'Không có mô tả.',
      image: coverImage,
      categoryId,
      access: 'Free', // MangaDX content is free
      content: `${description}\n\nTruyện từ MangaDX với ${convertedChapters.length} chương.`,
      chapters: convertedChapters,
      tags,
      status: manga.attributes.status || 'unknown',
      year: manga.attributes.year,
      rating: manga.attributes.contentRating || 'safe',
      language: 'vi',
      totalChapters: convertedChapters.length,
    };
  }

  private getVietnameseText(textMap: Record<string, string>): string {
    return textMap?.vi || textMap?.en || Object.values(textMap || {})[0] || '';
  }

  private determineCategoryId(tags: any[], demographic?: string): string {
    // Map MangaDX tags to app categories
    const tagNames = tags.map(tag => 
      this.getVietnameseText(tag.attributes.name).toLowerCase()
    );

    // Category mapping based on common Vietnamese manga categories
    if (tagNames.some(tag => tag.includes('romance') || tag.includes('tình cảm'))) {
      return 'cat1'; // Romance
    }
    if (tagNames.some(tag => tag.includes('action') || tag.includes('hành động'))) {
      return 'cat2'; // Action
    }
    if (tagNames.some(tag => tag.includes('comedy') || tag.includes('hài hước'))) {
      return 'cat3'; // Comedy
    }
    if (tagNames.some(tag => tag.includes('fantasy') || tag.includes('fantasy'))) {
      return 'cat4'; // Fantasy
    }
    if (demographic === 'shounen') {
      return 'cat5'; // Shounen
    }
    if (demographic === 'shoujo') {
      return 'cat6'; // Shoujo
    }

    return 'cat1'; // Default category
  }

  // Get available tags for filtering
  async getTags(): Promise<Array<{ id: string; name: string; group: string }>> {
    try {
      const response = await this.client.get('/manga/tag');
      const tags = response.data.data || [];

      return tags.map((tag: any) => ({
        id: tag.id,
        name: this.getVietnameseText(tag.attributes.name),
        group: tag.attributes.group || 'general',
      }));
    } catch (error) {
      secureError('[MangaDX] Get tags error:', error);
      return [];
    }
  }

  // Get categories formatted for the app
  async getCategories(): Promise<Array<{ id: string; title: string; image: string; icon: string }>> {
    try {
      console.log('🏷️ Fetching categories from MangaDX...');
      const tags = await this.getTags();
      console.log('🏷️ Retrieved tags count:', tags.length);
      
      // Filter and map popular tags to categories
      const popularCategories = [
        { tagName: 'romance', icon: '💕', color: 'e74c3c' },
        { tagName: 'action', icon: '⚔️', color: '3498db' },
        { tagName: 'comedy', icon: '😄', color: 'f39c12' },
        { tagName: 'drama', icon: '🎭', color: '9b59b6' },
        { tagName: 'fantasy', icon: '🧙', color: '2ecc71' },
        { tagName: 'slice of life', icon: '🍃', color: '1abc9c' },
        { tagName: 'supernatural', icon: '👻', color: '8e44ad' },
        { tagName: 'school life', icon: '🏫', color: 'e67e22' },
        { tagName: 'shounen', icon: '⚡', color: 'c0392b' },
        { tagName: 'shoujo', icon: '🌸', color: 'f1c40f' },
        { tagName: 'horror', icon: '😱', color: '34495e' },
        { tagName: 'mystery', icon: '🕵️', color: '7f8c8d' },
      ];

      const categories = [];
      
      for (const category of popularCategories) {
        const matchingTag = tags.find(tag => 
          tag.name.toLowerCase().includes(category.tagName.toLowerCase()) ||
          tag.name.toLowerCase() === category.tagName.toLowerCase()
        );
        
        if (matchingTag) {
          categories.push({
            id: matchingTag.id,
            title: matchingTag.name,
            image: `https://placehold.co/300x300/${category.color}/ffffff?text=${encodeURIComponent(matchingTag.name)}`,
            icon: category.icon,
          });
        }
      }

      // Add some default categories if not enough found
      if (categories.length < 8) {
        const defaultCategories = [
          { id: 'default-1', title: 'Manga Hot', image: 'https://placehold.co/300x300/e74c3c/ffffff?text=Hot', icon: '🔥' },
          { id: 'default-2', title: 'Mới cập nhật', image: 'https://placehold.co/300x300/3498db/ffffff?text=New', icon: '🆕' },
        ];
        categories.push(...defaultCategories);
      }

      console.log('🏷️ Final categories count:', categories.length);
      return categories.slice(0, 12); // Limit to 12 categories
    } catch (error) {
      console.error('❌ Categories fetch error:', error);
      secureError('[MangaDX] Get categories error:', error);
      // Return fallback categories
      return [
        { id: 'fallback-1', title: 'Manga', image: 'https://placehold.co/300x300/3498db/ffffff?text=Manga', icon: '📚' },
        { id: 'fallback-2', title: 'Truyện tranh', image: 'https://placehold.co/300x300/e74c3c/ffffff?text=Comic', icon: '🎨' },
      ];
    }
  }
}

// Export singleton instance
export const mangaDXService = new MangaDXService();
export default mangaDXService;
