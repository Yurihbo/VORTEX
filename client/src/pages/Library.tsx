import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Grid3x3, List, Search, SlidersHorizontal, Plus, Minus, Star, Globe, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCover } from '@/components/BookCover';
import { storageService } from '@/services/storage';
import { Book, BookStatus } from '@/types/book';

const statusLabels: Record<BookStatus, string> = { 'want-to-read': 'Quero ler', reading: 'Em leitura', paused: 'Pausado', completed: 'Concluído' };

interface ApiBookResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export default function Library() {
  const [location] = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>(location === '/reading' ? 'reading' : 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  // Estados do buscador online (Open Library API)
  const [apiQuery, setApiQuery] = useState('');
  const [apiResults, setApiResults] = useState<ApiBookResult[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSearchActive, setApiSearchActive] = useState(false);

  useEffect(() => { 
    setBooks(storageService.getBooks()); 
  }, []);

  const handleApiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!apiQuery.trim()) return;
    setIsSearchingApi(true);
    setApiSearchActive(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(apiQuery)}&limit=8`);
      const data = await res.json();
      setApiResults(data.docs || []);
    } catch (err) {
      console.error("Erro ao buscar na API Open Library:", err);
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleAddFromApi = (apiBook: ApiBookResult) => {
    const title = apiBook.title || 'Tomo sem título';
    const author = apiBook.author_name ? apiBook.author_name.join(', ') : 'Autor desconhecido';
    const pages = apiBook.number_of_pages_median || 300;
    const genre = apiBook.subject ? apiBook.subject[0] : 'Fantasia';
    const coverUrl = apiBook.cover_i 
      ? `https://covers.openlibrary.org/b/id/${apiBook.cover_i}-L.jpg` 
      : 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80';

    const newBook: Book = {
      id: 'book_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title,
      author,
      genre,
      pages,
      currentPage: 0,
      status: 'want-to-read',
      rating: 0,
      isFavorite: false,
      coverUrl,
      addedDate: new Date().toISOString().split('T')[0],
      description: `Tomo catalogado através dos corredores do conhecimento universal (Open Library). Publicado por volta de ${apiBook.first_publish_year || 'ano desconhecido'}.`,
      notes: [],
      quotes: [],
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    storageService.saveBooks(updated);
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

        {/* Seção do Buscador Online de Livros (Open Library API) */}
        <Card className="vortex-card p-5 border-[#caa85e]/40 bg-[#121824]/90">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-[#caa85e]" />
            <h2 className="font-serif text-lg text-[#caa85e]">Buscador Universal de Tomos (Open Library)</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Pesquise milhões de livros no catálogo mundial para adicionar capa e dados instantaneamente à sua biblioteca.</p>
          <form onSubmit={handleApiSearch} className="flex gap-2">
            <Input 
              placeholder="Digite o título, autor ou assunto (ex: O Senhor dos Anéis, Duna...)" 
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
                <span className="text-xs font-serif text-[#caa85e]">Resultados da Busca Externa ({apiResults.length})</span>
                <button type="button" onClick={() => setApiSearchActive(false)} className="text-xs text-muted-foreground hover:underline">Fechar resultados</button>
              </div>
              {apiResults.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum tomo encontrado no catálogo universal.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {apiResults.map((item, idx) => {
                    const coverImg = item.cover_i 
                      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
                      : 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80';
                    const isAlreadyAdded = books.some(b => b.title.toLowerCase() === item.title.toLowerCase());
                    return (
                      <div key={item.key || idx} className="bg-card/80 border border-border/60 rounded-lg p-3 flex flex-col justify-between gap-3 shadow-sm hover:border-[#caa85e]/50 transition-all">
                        <div className="flex gap-3 items-start">
                          <img src={coverImg} alt={item.title} className="w-12 h-16 object-cover rounded shadow shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-serif font-medium leading-tight truncate text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.author_name ? item.author_name.join(', ') : 'Autor desconhecido'}</p>
                            <p className="text-[10px] text-[#caa85e] mt-1">{item.first_publish_year ? `Ano: ${item.first_publish_year}` : 'Catálogo Global'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                          <span className="text-[10px] text-muted-foreground">{item.number_of_pages_median ? `${item.number_of_pages_median} pág.` : 'Média 300 pág.'}</span>
                          {isAlreadyAdded ? (
                            <span className="text-xs text-emerald-400 font-serif italic">Na biblioteca</span>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleAddFromApi(item)} className="h-7 text-xs border-[#caa85e]/40 hover:bg-[#caa85e]/20 text-[#caa85e]">
                              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                            </Button>
                          )}
                        </div>
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
            <p className="mt-2 text-muted-foreground">Utilize o buscador universal acima ou adicione seu primeiro tomo para começar.</p>
            <Link href="/add-book" className="vortex-button-primary inline-flex mt-6">Registrar tomo</Link>
          </Card>
        )}
      </div>
    </Layout>
  );
}

function BookOpenIcon() { return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 5.5c3.2-.7 6.1-.1 9 1.8v12c-2.9-1.9-5.8-2.5-9-1.8zM21 5.5c-3.2-.7-6.1-.1-9 1.8v12c2.9-1.9 5.8-2.5 9-1.8z" /></svg>; }
