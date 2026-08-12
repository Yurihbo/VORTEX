import { useEffect, useState } from 'react';
import { BookOpen, Flame, Heart, LibraryBig, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookCover } from '@/components/BookCover';
import { storageService } from '@/services/storage';
import { Book, LibraryStats } from '@/types/book';

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [bookOfDay, setBookOfDay] = useState<Book | null>(null);
  const [readingBooks, setReadingBooks] = useState<Book[]>([]);

  useEffect(() => {
    const allBooks = storageService.getBooks();
    setBooks(allBooks);
    setStats(storageService.getLibraryStats());
    setReadingBooks(allBooks.filter(book => book.status === 'reading'));
    if (allBooks.length) setBookOfDay(allBooks[new Date().getDate() % allBooks.length]);
  }, []);

  const favoriteCount = books.filter(book => book.isFavorite).length;

  return (
    <Layout>
      <div className="space-y-9 animate-fade-in">
        <section className="vortex-hero relative min-h-[280px] overflow-hidden rounded-2xl border border-[#caa85e]/30 bg-[#12182c]">
          <img src="/assets/vortex-library-hero.jpg" alt="Biblioteca ancestral iluminada por luas e velas" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111528] via-[#111528]/85 to-transparent" />
          <div className="relative max-w-2xl p-7 md:p-10 lg:p-12">
            <div className="mb-4 flex items-center gap-2 text-[#caa85e]"><span className="h-px w-8 bg-current" /><span className="eyebrow">Portal de leitura</span></div>
            <h1 className="text-5xl md:text-6xl font-serif leading-[.93] text-[#f2e4bd]">Bem-vindo à Vortex</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[#d6d0c5]">Entre nas histórias. Descubra novos mundos. Sua próxima jornada começa entre estas estantes.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/library" className="vortex-button-primary inline-flex items-center"><BookOpen className="h-4 w-4 mr-2" /> Explorar biblioteca</Link><Link href="/add-book" className="inline-flex items-center rounded-md border border-[#caa85e]/50 px-4 py-2 text-sm font-semibold text-[#f2e4bd] hover:bg-[#caa85e]/10 transition-colors">+ Adicionar tomo</Link></div>
          </div>
          <div className="absolute bottom-6 right-7 hidden md:flex items-center gap-2 text-xs text-[#d6d0c5]/70"><Sparkles className="h-4 w-4 text-[#caa85e]" /> Outra história espera por você.</div>
        </section>

        <section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Panorama da coleção</p><h2 className="mt-1 text-4xl font-serif">Seu reino de histórias</h2></div><Link href="/stats" className="hidden sm:inline-flex text-sm text-primary hover:text-[#caa85e]">Ver crônicas →</Link></div><div className="grid grid-cols-2 xl:grid-cols-5 gap-3"><Card className="vortex-card p-5"><LibraryBig className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-serif">{stats?.totalBooks || 0}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Livros</p></Card><Card className="vortex-card p-5"><Flame className="h-5 w-5 text-[#caa85e]" /><p className="mt-4 text-3xl font-serif">{readingBooks.length}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Em jornada</p></Card><Card className="vortex-card p-5"><Trophy className="h-5 w-5 text-[#caa85e]" /><p className="mt-4 text-3xl font-serif">{stats?.booksRead || 0}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Concluídos</p></Card><Card className="vortex-card p-5"><Heart className="h-5 w-5 text-rose-300 fill-current" /><p className="mt-4 text-3xl font-serif">{favoriteCount}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Favoritos</p></Card><Card className="vortex-card p-5 col-span-2 xl:col-span-1"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-serif">{stats?.pagesRead || 0}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Páginas lidas</p></Card></div></section>

        {readingBooks.length > 0 && <section><div className="mb-5"><p className="eyebrow">Onde você parou</p><h2 className="mt-1 text-4xl font-serif">Continue sua jornada</h2></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{readingBooks.slice(0, 3).map(book => <Link key={book.id} href={`/book/${book.id}`} className="block group"><Card className="vortex-card p-5 flex gap-4 transition-all hover:-translate-y-1 hover:border-primary/40"><BookCover book={book} size="md" /><div className="min-w-0 flex-1 flex flex-col"><p className="eyebrow">Em leitura</p><h3 className="mt-1 font-serif text-2xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3><p className="mt-1 text-sm text-muted-foreground">{book.author}</p><div className="mt-auto pt-5"><div className="flex justify-between text-xs text-muted-foreground"><span>Página {book.currentPage}</span><span>{Math.round((book.currentPage / book.pages) * 100)}%</span></div><div className="mt-2 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-[#caa85e]" style={{ width: `${(book.currentPage / book.pages) * 100}%` }} /></div></div></div></Card></Link>)}</div></section>}

        {bookOfDay && <section><div className="mb-5"><p className="eyebrow">Uma sugestão para hoje</p><h2 className="mt-1 text-4xl font-serif">✦ Grimório do Dia</h2></div><Card className="vortex-card grimoire-of-day-card p-6 md:p-8"><div className="grid gap-7 md:grid-cols-[180px_minmax(0,1fr)] items-center"><div className="flex justify-center md:justify-start"><BookCover book={bookOfDay} size="lg" className="mx-auto md:mx-0" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[.18em] text-[#caa85e]"><span>{bookOfDay.genre}</span><span className="text-muted-foreground">·</span><span>{bookOfDay.pages} páginas</span></div><h3 className="mt-3 text-4xl font-serif">{bookOfDay.title}</h3><p className="mt-1 text-muted-foreground">{bookOfDay.author}</p><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{bookOfDay.description}</p><Link href={`/book/${bookOfDay.id}`} className="mt-6 inline-flex"><Button>Explorar livro</Button></Link></div></div></Card></section>}
      </div>
    </Layout>
  );
}
