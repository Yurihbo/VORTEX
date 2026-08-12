import { useEffect, useMemo, useState } from 'react';
import { Filter, Grid3x3, List, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCover } from '@/components/BookCover';
import { storageService } from '@/services/storage';
import { Book, BookStatus } from '@/types/book';

const statusLabels: Record<BookStatus, string> = { 'want-to-read': 'Quero ler', reading: 'Em leitura', paused: 'Pausado', completed: 'Concluído' };
const statusSubtitles: Record<BookStatus, string> = { 'want-to-read': 'Na lista do destino', reading: 'Em jornada', paused: 'Em descanso', completed: 'Tesouro conquistado' };

export default function Library() {
  const [location] = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>(location === '/reading' ? 'reading' : 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  useEffect(() => { setBooks(storageService.getBooks()); }, []);

  const filteredBooks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return books.filter(book => (statusFilter === 'all' || book.status === statusFilter) && (!term || [book.title, book.author, book.genre].some(value => value.toLowerCase().includes(term)))).sort((a, b) => sortBy === 'title' ? a.title.localeCompare(b.title) : new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
  }, [books, searchTerm, sortBy, statusFilter]);

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><p className="eyebrow">Arquivo pessoal</p><h1 className="text-5xl font-serif mt-2">Minha Biblioteca</h1><p className="text-muted-foreground mt-2">Os corredores onde suas histórias encontram lugar.</p></div><Link href="/add-book" className="vortex-button-primary inline-flex w-fit items-center">+ Adicionar tomo</Link></header>
        <Card className="vortex-card p-4"><div className="flex flex-col lg:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Procure nos tomos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" aria-label="Buscar na biblioteca" /></div><div className="flex flex-wrap gap-2"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value as BookStatus | 'all')} className="status-filter-select vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">Todos os status</option>{(Object.keys(statusLabels) as BookStatus[]).map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><select value={sortBy} onChange={e => setSortBy(e.target.value as 'recent' | 'title')} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="recent">Mais recentes</option><option value="title">Por título</option></select><div className="flex rounded-md border border-input overflow-hidden"><Button type="button" variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Visualização em grade"><Grid3x3 className="h-4 w-4" /></Button><Button type="button" variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="Visualização em lista"><List className="h-4 w-4" /></Button></div></div></div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><SlidersHorizontal className="h-3.5 w-3.5" /> {filteredBooks.length} tomos encontrados <span className="text-border">·</span> <Filter className="h-3.5 w-3.5" /> filtros ativos</div></Card>

        {filteredBooks.length ? <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5' : 'space-y-3'}>{filteredBooks.map(book => viewMode === 'grid' ? <Link key={book.id} href={`/book/${book.id}`} className="group block"><Card className="vortex-card p-4 h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_34px_rgba(0,0,0,.24)]"><div className="flex justify-center py-2"><BookCover book={book} size="lg" /></div><div className="mt-5"><p className={`eyebrow status-chip status-chip-${book.status}`}>{statusLabels[book.status]}</p><h2 className="mt-1 font-serif text-2xl leading-tight line-clamp-2 group-hover:text-[#caa85e] transition-colors">{book.title}</h2><p className="mt-1 text-sm text-muted-foreground line-clamp-1">{book.author}</p><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{book.genre}</span><span>{book.pages} pág.</span></div>{book.status === 'reading' && <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${(book.currentPage / book.pages) * 100}%` }} /></div>}</div></Card></Link> : <Link key={book.id} href={`/book/${book.id}`} className="block group"><Card className="vortex-card p-4 flex gap-4 items-center transition-colors hover:border-primary/40"><BookCover book={book} size="sm" /><div className="min-w-0 flex-1"><p className={`eyebrow status-chip status-chip-${book.status}`}>{statusLabels[book.status]} · {statusSubtitles[book.status]}</p><h2 className="mt-1 font-serif text-2xl group-hover:text-[#caa85e]">{book.title}</h2><p className="text-sm text-muted-foreground">{book.author} · {book.genre}</p></div><div className="hidden sm:block text-right text-xs text-muted-foreground"><p>{book.pages} páginas</p><p className="mt-1">{book.status === 'reading' ? `${Math.round((book.currentPage / book.pages) * 100)}% lido` : 'Abrir tomo →'}</p></div></Card></Link>)}</div> : <Card className="vortex-card p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#caa85e]/30 bg-[#caa85e]/10 text-[#caa85e]"><BookOpenIcon /></div><h2 className="mt-5 text-3xl font-serif">Os corredores estão vazios...</h2><p className="mt-2 text-muted-foreground">Adicione seu primeiro tomo para começar sua jornada.</p><Link href="/add-book" className="vortex-button-primary inline-flex mt-6">Registrar tomo</Link></Card>}
      </div>
    </Layout>
  );
}

function BookOpenIcon() { return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 5.5c3.2-.7 6.1-.1 9 1.8v12c-2.9-1.9-5.8-2.5-9-1.8zM21 5.5c-3.2-.7-6.1-.1-9 1.8v12c2.9-1.9 5.8-2.5 9-1.8z" /></svg>; }
