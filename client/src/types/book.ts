export type BookStatus = 'want-to-read' | 'reading' | 'paused' | 'completed';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  year?: number;
  pages: number;
  genre: string;
  description: string;
  coverUrl?: string;
  status: BookStatus;
  isFavorite: boolean;
  rating?: number;
  currentPage: number;
  completedDate?: string;
  addedDate: string;
  notes: Note[];
  quotes: Quote[];
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface Quote {
  id: string;
  text: string;
  page: number;
  note?: string;
  date: string;
}

export interface ReadingGoal {
  year: number;
  targetBooks: number;
  completedBooks: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedDate?: string;
  isUnlocked: boolean;
}

export interface ReadingStreak {
  currentStreak: number;
  bestStreak: number;
  lastReadDate?: string;
  readingDates?: string[];
}

export interface LibraryStats {
  totalBooks: number;
  booksRead: number;
  pagesRead: number;
  averageRating: number;
  favoriteGenre?: string;
  booksThisMonth: number;
  booksThisYear: number;
}

export interface UserProfile {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  totalReadingHours: number;
  favoriteBook: string;
  favoriteCharacter: string;
  favoriteVillain: string;
  favoriteMedalId?: string;
  companionId?: string;
  companionNames?: Record<string, string>;
}

export interface ReadingReminderSettings {
  enabled: boolean;
  times: string[];
  /** Mantido para compatibilidade com versões anteriores do VORTEX. */
  time?: string;
  lastNotifiedDate?: string;
  lastNotifiedSlot?: string;
  lastNotifiedSlots?: string[];
}
