import { Book, UserProfile, ReadingGoal, Achievement, ReadingStreak, ReadingReminderSettings } from '@/types/book';

export type { Book, UserProfile, ReadingGoal, Achievement, ReadingStreak, ReadingReminderSettings };

export interface CustomCollection {
  id: string;
  name: string;
  description: string;
  borderColor: string;
  bookIds: string[];
  createdAt: string;
}

const STORAGE_KEYS = {
  BOOKS: 'vortex_books',
  PROFILE: 'vortex_user_profile',
  READING_GOAL: 'vortex_reading_goal',
  ACHIEVEMENTS: 'vortex_achievements',
  READING_STREAK: 'vortex_reading_streak',
  READING_REMINDER: 'vortex_reading_reminder',
  CUSTOM_COLLECTIONS: 'vortex_custom_collections',
};

const DEFAULT_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Duna',
    author: 'Frank Herbert',
    genre: 'Ficção Científica',
    description: 'Uma obra-prima da política interestelar e ecologia no deserto de Arrakis.',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    status: 'completed',
    currentPage: 688,
    pages: 688,
    rating: 5,
    isFavorite: true,
    addedDate: '2026-01-15',
    notes: [],
    quotes: [],
  },
  {
    id: '2',
    title: 'O Senhor dos Anéis: A Sociedade do Anel',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasia',
    description: 'A jornada épica rumo à montanha da perdição para destruir o Um Anel.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    status: 'reading',
    currentPage: 245,
    pages: 423,
    rating: 5,
    isFavorite: true,
    addedDate: '2026-02-01',
    notes: [],
    quotes: [],
  },
  {
    id: '3',
    title: 'Neuromancer',
    author: 'William Gibson',
    genre: 'Cyberpunk',
    description: 'O clássico fundacional do cyberpunk e ciberespaço.',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    status: 'want-to-read',
    currentPage: 0,
    pages: 316,
    isFavorite: false,
    addedDate: '2026-02-10',
    notes: [],
    quotes: [],
  },
  {
    id: '4',
    title: 'O Silmarillion',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasia',
    description: 'A história mitológica dos dias antigos da Terra-média.',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800',
    status: 'want-to-read',
    currentPage: 0,
    pages: 450,
    isFavorite: false,
    addedDate: '2026-02-12',
    notes: [],
    quotes: [],
  },
];

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Yurihbo',
  bio: 'Guardião dos tomos ancestrais e viajante dos reinos da imaginação.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  totalReadingHours: 142,
  favoriteBook: 'O Senhor dos Anéis',
  favoriteCharacter: 'Gandalf',
  favoriteVillain: 'Sauron',
  favoriteMedalId: 'streak_7',
};

const DEFAULT_COLLECTIONS: CustomCollection[] = [
  {
    id: 'tolkien-collection',
    name: 'Universidade de Tolkien',
    description: 'A Terra-média e os contos de Arda.',
    borderColor: '#caa85e',
    bookIds: ['2', '4'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sci-fi-classics',
    name: 'Mestres da Ficção',
    description: 'Universos futuristas e distopias inesquecíveis.',
    borderColor: '#3b82f6',
    bookIds: ['1', '3'],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_REMINDER: ReadingReminderSettings = {
  enabled: true,
  time: '21:00',
};

export const storageService = {
  getBooks(): Book[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return data ? JSON.parse(data) : DEFAULT_BOOKS;
    } catch {
      return DEFAULT_BOOKS;
    }
  },

  saveBooks(books: Book[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  },

  addBook(book: Book): void {
    const books = this.getBooks();
    books.push(book);
    this.saveBooks(books);
  },

  updateBook(id: string, updates: Partial<Book>): void {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...updates };
      this.saveBooks(books);
    }
  },

  deleteBook(id: string): void {
    const books = this.getBooks();
    this.saveBooks(books.filter(b => b.id !== id));
  },

  getBookById(id: string): Book | undefined {
    return this.getBooks().find(b => b.id === id);
  },

  getReadingGoal(): ReadingGoal {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READING_GOAL);
      return data ? JSON.parse(data) : { year: new Date().getFullYear(), targetBooks: 30, completedBooks: 0 };
    } catch {
      return { year: new Date().getFullYear(), targetBooks: 30, completedBooks: 0 };
    }
  },

  saveReadingGoal(goal: ReadingGoal): void {
    localStorage.setItem(STORAGE_KEYS.READING_GOAL, JSON.stringify(goal));
  },

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getReadingStreak(): ReadingStreak {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READING_STREAK);
      return data ? JSON.parse(data) : { currentStreak: 5, bestStreak: 12, readingDates: [] };
    } catch {
      return { currentStreak: 5, bestStreak: 12, readingDates: [] };
    }
  },

  saveReadingStreak(streak: ReadingStreak): void {
    localStorage.setItem(STORAGE_KEYS.READING_STREAK, JSON.stringify(streak));
  },

  recordReadingDay(dateStr?: string): ReadingStreak {
    const streak = this.getReadingStreak();
    const today = dateStr || new Date().toISOString().split('T')[0];
    const dates = streak.readingDates || [];
    if (!dates.includes(today)) {
      dates.push(today);
      dates.sort();
    }
    const newStreak: ReadingStreak = {
      ...streak,
      lastReadDate: today,
      readingDates: dates,
      currentStreak: streak.currentStreak + 1,
      bestStreak: Math.max(streak.bestStreak, streak.currentStreak + 1),
    };
    this.saveReadingStreak(newStreak);
    return newStreak;
  },

  getLibraryStats() {
    const books = this.getBooks();
    const completedBooks = books.filter(b => b.status === 'completed');
    const totalPages = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
    const ratings = completedBooks.filter(b => b.rating).map(b => b.rating || 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const now = new Date();
    const thisMonth = books.filter(b => {
      const date = new Date(b.addedDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const thisYear = books.filter(b => {
      const date = new Date(b.addedDate);
      return date.getFullYear() === now.getFullYear();
    });

    const genreCounts: { [key: string]: number } = {};
    books.forEach(b => {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });
    const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      totalBooks: books.length,
      booksRead: completedBooks.length,
      pagesRead: totalPages,
      averageRating: Math.round(averageRating * 10) / 10,
      favoriteGenre,
      booksThisMonth: thisMonth.length,
      booksThisYear: thisYear.length,
    };
  },

  getReadingReminderSettings(): ReadingReminderSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.READING_REMINDER);
      if (!stored) return { ...DEFAULT_REMINDER };
      const parsed = JSON.parse(stored) as Partial<ReadingReminderSettings>;
      return { ...DEFAULT_REMINDER, ...parsed, enabled: Boolean(parsed.enabled) };
    } catch {
      return { ...DEFAULT_REMINDER };
    }
  },

  saveReadingReminderSettings(settings: ReadingReminderSettings): void {
    localStorage.setItem(STORAGE_KEYS.READING_REMINDER, JSON.stringify({ ...DEFAULT_REMINDER, ...settings }));
  },

  exportLibrary(): string {
    const data = {
      books: this.getBooks(),
      readingGoal: this.getReadingGoal(),
      achievements: this.getAchievements(),
      readingStreak: this.getReadingStreak(),
      userProfile: this.getUserProfile(),
      readingReminder: this.getReadingReminderSettings(),
      collections: collectionStorage.getCollections(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importLibrary(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.books && Array.isArray(data.books)) {
        this.saveBooks(data.books);
        if (data.readingGoal) this.saveReadingGoal(data.readingGoal);
        if (data.achievements) this.saveAchievements(data.achievements);
        if (data.readingStreak) this.saveReadingStreak(data.readingStreak);
        if (data.userProfile) this.saveUserProfile({ ...DEFAULT_PROFILE, ...data.userProfile });
        if (data.readingReminder) this.saveReadingReminderSettings({ ...DEFAULT_REMINDER, ...data.readingReminder });
        if (data.collections && Array.isArray(data.collections)) collectionStorage.saveCollections(data.collections);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('vortex_custom_collections');
  },
};

export const collectionStorage = {
  getCollections(): CustomCollection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_COLLECTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_COLLECTIONS, JSON.stringify(DEFAULT_COLLECTIONS));
        return DEFAULT_COLLECTIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_COLLECTIONS;
    }
  },
  saveCollections(collections: CustomCollection[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_COLLECTIONS, JSON.stringify(collections));
    window.dispatchEvent(new Event('vortex-collections-updated'));
  },
  addCollection(collection: Omit<CustomCollection, 'id' | 'createdAt'>): CustomCollection {
    const collections = this.getCollections();
    const newCol: CustomCollection = {
      ...collection,
      id: 'col_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    collections.push(newCol);
    this.saveCollections(collections);
    return newCol;
  },
  updateCollection(updated: CustomCollection): void {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      collections[index] = updated;
      this.saveCollections(collections);
    }
  },
  deleteCollection(id: string): void {
    const collections = this.getCollections();
    this.saveCollections(collections.filter(c => c.id !== id));
  },
};

export function getBooks(): Book[] {
  return storageService.getBooks();
}
