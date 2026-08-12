import { Book, ReadingGoal, Achievement, ReadingStreak, LibraryStats, UserProfile } from '@/types/book';

const STORAGE_KEYS = {
  BOOKS: 'vortex_books',
  READING_GOAL: 'vortex_reading_goal',
  ACHIEVEMENTS: 'vortex_achievements',
  READING_STREAK: 'vortex_reading_streak',
  LIBRARY_STATS: 'vortex_library_stats',
  USER_PROFILE: 'vortex_user_profile',
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Leitor Vortex',
  bio: 'Uma biblioteca pessoal para manter próximas as histórias que ainda têm algo a revelar.',
  totalReadingHours: 0,
  favoriteBook: '',
  favoriteCharacter: '',
  favoriteVillain: '',
};

// Default demo books
const DEFAULT_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Duna',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    publisher: 'Ace',
    year: 1965,
    pages: 688,
    genre: 'Ficção Científica',
    description: 'Uma épica de ficção científica sobre política, religião e ecologia em um planeta desértico.',
    status: 'reading',
    isFavorite: true,
    rating: 5,
    currentPage: 250,
    addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    quotes: [],
  },
  {
    id: '2',
    title: 'O Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0547928227',
    publisher: 'Houghton Mifflin Harcourt',
    year: 1937,
    pages: 310,
    genre: 'Fantasia',
    description: 'A aventura de Bilbo Bolseiro em uma jornada inesperada com anões e um mago.',
    status: 'completed',
    isFavorite: true,
    rating: 5,
    currentPage: 310,
    completedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    quotes: [],
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    publisher: 'Signet Classics',
    year: 1949,
    pages: 328,
    genre: 'Ficção Distópica',
    description: 'Um romance distópico sobre totalitarismo e vigilância em massa.',
    status: 'want-to-read',
    isFavorite: false,
    rating: undefined,
    currentPage: 0,
    addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    quotes: [],
  },
  {
    id: '4',
    title: 'O Senhor dos Anéis: A Sociedade do Anel',
    author: 'J.R.R. Tolkien',
    isbn: '978-0544003415',
    publisher: 'Houghton Mifflin Harcourt',
    year: 1954,
    pages: 423,
    genre: 'Fantasia',
    description: 'O primeiro livro da trilogia épica sobre a jornada para destruir o Um Anel.',
    status: 'reading',
    isFavorite: true,
    rating: 5,
    currentPage: 150,
    addedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    quotes: [],
  },
  {
    id: '5',
    title: 'Harry Potter e a Pedra Filosofal',
    author: 'J.K. Rowling',
    isbn: '978-0439708180',
    publisher: 'Scholastic',
    year: 1997,
    pages: 309,
    genre: 'Fantasia',
    description: 'A primeira aventura de Harry Potter em Hogwarts.',
    status: 'completed',
    isFavorite: true,
    rating: 4,
    currentPage: 309,
    completedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    quotes: [],
  },
  {
    id: '6',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    isbn: '978-8535914177',
    publisher: 'Companhia das Letras',
    year: 1899,
    pages: 256,
    genre: 'Romance',
    description: 'Um clássico da literatura brasileira sobre amor, ciúmes e memória.',
    status: 'want-to-read',
    isFavorite: false,
    rating: undefined,
    currentPage: 0,
    addedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes: [],
    quotes: [],
  },
];

export const storageService = {
  // Profile
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Books
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

  // Reading Goal
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

  // Achievements
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

  // Reading Streak
  getReadingStreak(): ReadingStreak {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READING_STREAK);
      return data ? JSON.parse(data) : { currentStreak: 0, bestStreak: 0 };
    } catch {
      return { currentStreak: 0, bestStreak: 0 };
    }
  },

  saveReadingStreak(streak: ReadingStreak): void {
    localStorage.setItem(STORAGE_KEYS.READING_STREAK, JSON.stringify(streak));
  },

  // Library Stats
  getLibraryStats(): LibraryStats {
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

    // Find favorite genre
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

  // Export/Import
  exportLibrary(): string {
    const data = {
      books: this.getBooks(),
      readingGoal: this.getReadingGoal(),
      achievements: this.getAchievements(),
      readingStreak: this.getReadingStreak(),
      userProfile: this.getUserProfile(),
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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
