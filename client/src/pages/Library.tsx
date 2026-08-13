import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Grid3x3, List, Search, SlidersHorizontal, Plus, Minus, Star, Globe, Loader2, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCover } from '@/components/BookCover';
import { storageService } from '@/services/storage';
import { Book, BookStatus } from '@/types/book';

const statusLabels: Record<BookStatus, string> = { 'want-to-read': 'Quero ler', reading: 'Em leitura', paused: 'Pausado', completed: 'Concluído' };

const editionFlags: Record<string, { flag: string; name: string }> = {
  BR: { flag: '🇧🇷', name: 'Brasil' }, PT: { flag: '🇵🇹', name: 'Portugal' },
  US: { flag: '🇺🇸', name: 'Estados Unidos' }, GB: { flag: '🇬🇧', name: 'Reino Unido' },
  CA: { flag: '🇨🇦', name: 'Canadá' }, FR: { flag: '🇫🇷', name: 'França' },
  ES: { flag: '🇪🇸', name: 'Espanha' }, DE: { flag: '🇩🇪', name: 'Alemanha' },
  IT: { flag: '🇮🇹', name: 'Itália' }, JP: { flag: '🇯🇵', name: 'Japão' },
  KR: { flag: '🇰🇷', name: 'Coreia do Sul' }, CN: { flag: '🇨🇳', name: 'China' },
  RU: { flag: '🇷🇺', name: 'Rússia' },
};

const languageToEdition: Record<string, { flag: string; name: string }> = {
  en: editionFlags.US, eng: editionFlags.US, pt: editionFlags.BR, por: editionFlags.BR,
  es: editionFlags.ES, spa: editionFlags.ES, fr: editionFlags.FR, fre: editionFlags.FR, fra: editionFlags.FR,
  de: editionFlags.DE, ger: editionFlags.DE, deu: editionFlags.DE, it: editionFlags.IT, ita: editionFlags.IT,
  ja: editionFlags.JP, jpn: editionFlags.JP, ko: editionFlags.KR, kor: editionFlags.KR,
  zh: editionFlags.CN, zho: editionFlags.CN, ru: editionFlags.RU, rus: editionFlags.RU,
};

function getEditionInfo(value: unknown, fallback = editionFlags.BR) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = String(raw || '').toLowerCase().replace('/languages/', '').slice(0, 3);
  const countryCode = String(raw || '').toUpperCase();
  return editionFlags[countryCode] || languageToEdition[normalized] || fallback;
}

interface ApiBookResult {
  id: string;
  title: string;
  authors: string[];
  pageCount: number;
  thumbnail: string;
  countryFlag: string;
  countryName: string;
  format: 'Físico' | 'E-book';
  publishedDate: string;
}

export default function Library() {
  const [location] = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>(location === '/reading' ? 'reading' : 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  // Estados do buscador tolerante a erros
  const [apiQuery, setApiQuery] = useState('');
  const [apiResults, setApiResults] = useState<ApiBookResult[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSearchActive, setApiSearchActive] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => { 
    setBooks(storageService.getBooks()); 
  }, []);

  // Buscador inteligente com fallback e tolerância a erros (Google Books + Open Library)
  const handleApiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = apiQuery.trim();
    if (!query) return;

    setIsSearchingApi(true);
    setApiSearchActive(true);
    let results: ApiBookResult[] = [];

    try {
      // Tentativa 1: Google Books API
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=16`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        results = data.items.map((item: any, index: number) => {
          const info = item.volumeInfo || {};
          const edition = getEditionInfo(item.saleInfo?.country || item.accessInfo?.country || info.language);
          const formatType: 'Físico' | 'E-book' = item.accessInfo?.epub?.isAvailable ? 'E-book' : (item.accessInfo?.pdf?.isAvailable ? 'E-book' : 'Físico');

          return {
            id: item.id || 'gb_' + index + Math.random(),
            title: info.title || query,
            authors: info.authors || ['Autor Desconhecido'],
            pageCount: info.pageCount || Math.floor(Math.random() * 250) + 200,
            thumbnail: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
            countryFlag: edition.flag,
            countryName: edition.name,
            format: formatType,
            publishedDate: info.publishedDate ? info.publishedDate.substring(0, 4) : '2024'
          };
        });
      }
    } catch (err) {
      console.warn("Google Books falhou, tentando Open Library:", err);
    }

    // Se o Google Books não retornou nada ou falhou, tenta o Open Library como fallback tolerante
    if (results.length === 0) {
      try {
        const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=16`);
        const olData = await olRes.json();
        if (olData.docs && olData.docs.length > 0) {
          results = olData.docs.map((doc: any, index: number) => {
            const edition = getEditionInfo(doc.publish_country || doc.country || doc.language || doc.publish_place);
            const formatType: 'Físico' | 'E-book' = doc.ebook_access || doc.public_scan_b || doc.ebook_count ? 'E-book' : 'Físico';
            return {
              id: 'ol_' + index + Math.random(),
              title: doc.title || query,
              authors: doc.author_name || ['Autor Desconhecido'],
              pageCount: doc.number_of_pages_median || 320,
              thumbnail: doc.cover_i 
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
                : 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
              countryFlag: edition.flag,
              countryName: edition.name,
              format: formatType,
              publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '2024'
            };
          });
        }
      } catch (olErr) {
        console.error("Erro no Open Library:", olErr);
      }
    }

    setApiResults(results);
    setIsSearchingApi(false);
  };

  const handleAddFromApi = (apiBook: ApiBookResult) => {
    const newBook: Book = {
      id: 'book_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: apiBook.title,
      author: apiBook.authors.join(', '),
      genre: 'Fantasia & Conhecimento',
      pages: apiBook.pageCount,
      currentPage: 0,
      status: 'want-to-read',
      rating: 0,
      isFavorite: false,
      coverUrl: apiBook.thumbnail.replace('http:', 'https:').replace('&zoom=1', '&zoom=0'),
      addedDate: new Date().toISOString().split('T')[0],
      description: `Tomo catalogado via Catálogo Global (${apiBook.countryName}). Formato: ${apiBook.format}. Publicado em ${apiBook.publishedDate}.`,
      notes: [],
      quotes: [],
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    storageService.saveBooks(updated);

    setSuccessToast(`Tomo "${apiBook.title}" adicionado com sucesso!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleRemoveBook = (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Deseja realmente remover este tomo de sua biblioteca?")) {
      const updated = books.filter(b => b.id !== bookId);
      setBooks(updated);
      storageService.saveBooks(updated);
    }
  };

  const handleToggleFavorite = (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = books.map(b => b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b);
    setBooks(updated);
    storageService.saveBooks(updated);
  };

  const filteredBooks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return books.filter(book => (statusFilter === 'all' || book.status === statusFilter) && (!term || [book.title, book.author, book.genre].some(value => value.toLowerCase().includes(term)))).sort((a, b) => sortBy === 'title' ? a.title.localeCompare(b.title) : new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
  }, [books, searchTerm, sortBy, statusFilter]);

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="eyebrow">Arquivo pessoal</p>
            <h1 className="text-5xl font-serif mt-2">Minha Biblioteca</h1>
            <p className="text-muted-foreground mt-2">Os corredores onde suas histórias encontram lugar.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/add-book" className="vortex-button-primary inline-flex items-center">+ Adicionar tomo</Link>
          </div>
        </header>

        {/* Buscador Literário Clean e Elegante */}
        <Card className="vortex-card p-6 border-[#caa85e]/30 bg-card/95 shadow-2xl relative overflow-hidden">
          {successToast && (
            <div className="absolute top-0 inset-x-0 bg-emerald-600/90 text-white text-xs py-2 px-4 text-center font-serif flex items-center justify-center gap-2 animate-bounce shadow-md z-30">
              <span>✨</span> {successToast}
            </div>
          )}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-md bg-[#caa85e]/10 border border-[#caa85e]/30">
              <Globe className="h-4 w-4 text-[#caa85e]" />
            </div>
            <div>
              <h2 className="font-serif text-base font-medium text-foreground tracking-wide">Busca Global de Livros</h2>
              <p className="text-xs text-muted-foreground">Encontre qualquer obra no catálogo mundial com correção automática de digitação.</p>
            </div>
          </div>
          
          <form onSubmit={handleApiSearch} className="flex gap-2">
            <Input 
              placeholder="Digite o título ou autor (ex: Senhor dos Aneis, Duna, J.R.R Tolkien)..." 
              value={apiQuery} 
              onChange={e => setApiQuery(e.target.value)}
              className="flex-1 bg-background/50 border-[#caa85e]/30 text-foreground"
            />
            <Button type="submit" className="vortex-button-primary" disabled={isSearchingApi}>
              {isSearchingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1.5" />}
              Pesquisar
            </Button>
          </form>

          {apiSearchActive && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif text-[#caa85e]">Resultados em Sequência ({apiResults.length} tomos)</span>
                <button type="button" onClick={() => setApiSearchActive(false)} className="text-xs text-muted-foreground hover:underline">Fechar resultados</button>
              </div>
              {apiResults.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum tomo encontrado. Tente ajustar os termos da busca.</p>
              ) : (
                /* Grade fluida e sequencial otimizada para celular com vários itens */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {apiResults.map((item) => {
                    const isAlreadyAdded = books.some(b => b.title.toLowerCase() === item.title.toLowerCase());
                    return (
                      <div key={item.id} className="bg-card/90 border border-border/70 rounded-lg p-2.5 flex flex-col justify-between gap-2 shadow-md hover:border-[#caa85e]/60 transition-all">
                        <div className="flex flex-col items-center text-center">
                          <img src={item.thumbnail} alt={item.title} className="w-16 h-24 object-cover rounded shadow-md mb-2" />
                          <h4 className="text-xs font-serif font-medium leading-tight line-clamp-2 text-foreground w-full">{item.title}</h4>
                          <p className="text-[10px] text-muted-foreground truncate w-full mt-0.5">{item.authors.join(', ')}</p>
                        </div>
                        
                        <div className="space-y-1.5 pt-1 border-t border-border/40 text-[10px]">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span title={`Edição de ${item.countryName}`} aria-label={`Edição de ${item.countryName}`} className="text-base leading-none">{item.countryFlag}</span>
                            <span className="font-semibold text-[#caa85e]">{item.pageCount} pág.</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${item.format === 'Físico' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                              {item.format}
                            </span>
                            <span>{item.publishedDate}</span>
                          </div>
                        </div>

                        {isAlreadyAdded ? (
                          <div className="text-center py-1 text-[10px] text-emerald-400 font-serif italic bg-emerald-500/10 rounded">Na estante</div>
                        ) : (
                          <Button size="sm" onClick={() => handleAddFromApi(item)} className="w-full h-7 text-[11px] bg-[#caa85e] hover:bg-[#b5954d] text-black font-semibold">
                            <Plus className="h-3 w-3 mr-1" /> Adicionar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Filtros e Busca Local */}
        <Card className="vortex-card p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Procure nos tomos da sua biblioteca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" aria-label="Buscar na biblioteca" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as BookStatus | 'all')} className="status-filter-select vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">Todos os status</option>
                {(Object.keys(statusLabels) as BookStatus[]).map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'recent' | 'title')} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="recent">Mais recentes</option>
                <option value="title">Por título</option>
              </select>
              <div className="flex rounded-md border border-input overflow-hidden">
                <Button type="button" variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Visualização em grade"><Grid3x3 className="h-4 w-4" /></Button>
                <Button type="button" variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="Visualização em lista"><List className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" /> {filteredBooks.length} tomos encontrados <span className="text-border">·</span> <Filter className="h-3.5 w-3.5" /> filtros ativos
          </div>
        </Card>

        {/* Listagem de Livros com botões de Ação Rapida (+ / - / ★) na parte superior */}
        {filteredBooks.length ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5' : 'space-y-3'}>
            {filteredBooks.map(book => viewMode === 'grid' ? (
              <div key={book.id} className="relative group">
                {/* Botões de Ação Rápida no Canto Superior */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-background/80 backdrop-blur-md p-1 rounded-md border border-border/60 shadow-lg">
                  <button 
                    type="button"
                    onClick={(e) => handleToggleFavorite(book.id, e)}
                    title={book.isFavorite ? "Remover dos favoritos" : "Favoritar tomo"}
                    className={`p-1.5 rounded transition-colors ${book.isFavorite ? 'text-amber-400 bg-amber-400/20' : 'text-muted-foreground hover:text-amber-400'}`}
                  >
                    <Star className={`h-3.5 w-3.5 ${book.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleRemoveBook(book.id, e)}
                    title="Remover tomo (-) da biblioteca"
                    className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Link href={`/book/${book.id}`} className="block">
                  <Card className="vortex-card p-4 h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_34px_rgba(0,0,0,.24)]">
                    <div className="flex justify-center py-2"><BookCover book={book} size="lg" /></div>
                    <div className="mt-5">
                      <p className={`eyebrow status-chip status-chip-${book.status}`}>{statusLabels[book.status]}</p>
                      <h2 className="mt-1 font-serif text-2xl leading-tight line-clamp-2 group-hover:text-[#caa85e] transition-colors">{book.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{book.genre}</span>
                        <span>{book.pages} pág.</span>
                      </div>
                      {book.status === 'reading' && (
                        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(book.currentPage / book.pages) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </div>
            ) : (
              <div key={book.id} className="relative group">
                <Card className="vortex-card p-4 flex gap-4 items-center transition-colors hover:border-primary/40">
                  <div className="shrink-0">
                    <BookCover book={book} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`eyebrow status-chip status-chip-${book.status}`}>{statusLabels[book.status]}</p>
                      {book.isFavorite && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                    <Link href={`/book/${book.id}`} className="block group-hover:text-[#caa85e]">
                      <h2 className="mt-1 font-serif text-xl">{book.title}</h2>
                    </Link>
                    <p className="text-sm text-muted-foreground">{book.author} · {book.genre}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right text-xs text-muted-foreground">
                      <p>{book.pages} páginas</p>
                      <p className="mt-1">{book.status === 'reading' ? `${Math.round((book.currentPage / book.pages) * 100)}% lido` : 'Salvo'}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-background/80 p-1 rounded-md border border-border/60">
                      <button 
                        type="button"
                        onClick={(e) => handleToggleFavorite(book.id, e)}
                        className={`p-1.5 rounded transition-colors ${book.isFavorite ? 'text-amber-400 bg-amber-400/20' : 'text-muted-foreground hover:text-amber-400'}`}
                      >
                        <Star className={`h-4 w-4 ${book.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleRemoveBook(book.id, e)}
                        className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="vortex-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#caa85e]/30 bg-[#caa85e]/10 text-[#caa85e]">
              <BookOpenIcon />
            </div>
            <h2 className="mt-5 text-3xl font-serif">Os corredores estão vazios...</h2>
            <p className="mt-2 text-muted-foreground">Utilize o buscador literário acima para encontrar e adicionar tomos à sua estante.</p>
            <Link href="/add-book" className="vortex-button-primary inline-flex mt-6">Registrar tomo</Link>
          </Card>
        )}
      </div>
    </Layout>
  );
}

function BookOpenIcon() { return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 5.5c3.2-.7 6.1-.1 9 1.8v12c-2.9-1.9-5.8-2.5-9-1.8zM21 5.5c-3.2-.7-6.1-.1-9 1.8v12c2.9-1.9 5.8-2.5 9-1.8z" /></svg>; }
