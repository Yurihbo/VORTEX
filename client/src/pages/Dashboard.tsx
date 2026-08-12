import { useState, useEffect } from 'react';
import { BookOpen, Flame, Heart, LibraryBig, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookCover } from '@/components/BookCover';
import { storageService } from '@/services/storage';
import { Book, LibraryStats } from '@/types/book';

const base = import.meta.env.BASE_URL || '/';

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [bookOfDay, setBookOfDay] = useState<Book | null>(null);
  const [readingBooks, setReadingBooks] = useState<Book[]>([]);
  const profile = storageService.getUserProfile();

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
          <img src={`${base}assets/vortex-library-hero.jpg`} alt="Biblioteca ancestral iluminada por luas e velas" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111528] via-[#111528]/85 to-transparent" />
          <div className="relative max-w-2xl p-7 md:p-10 lg:p-12">
            <div className="mb-4 flex items-center gap-2 text-[#caa85e]"><span className="h-px w-8 bg-current" /><span className="eyebrow">Portal de leitura</span></div>
            <h1 className="text-5xl md:text-6xl font-serif leading-[.93] text-[#f2e4bd]">Bem-vindo à Vortex</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[#d6d0c5]">Entre nas histórias. Descubra novos mundos. Sua próxima jornada começa entre estas estantes.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/library" className="vortex-button-primary inline-flex items-center"><BookOpen className="h-4 w-4 mr-2" /> Explorar biblioteca</Link><Link href="/add-book" className="inline-flex items-center rounded-md border border-[#caa85e]/50 px-4 py-2 text-sm font-semibold text-[#f2e4bd] hover:bg-[#caa85e]/10 transition-colors">+ Adicionar tomo</Link></div>
          </div>
          <div className="absolute bottom-6 right-7 hidden md:flex items-center gap-2 text-xs text-[#d6d0c5]/70"><Sparkles className="h-4 w-4 text-[#caa85e]" /> Outra história espera por você.</div>
        </section>

        {/* Métricas e Estatísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-[#caa85e]/30 bg-card/90 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[#caa85e]">Coleção</span><LibraryBig className="h-5 w-5 text-[#caa85e]" /></div>
            <p className="mt-3 text-3xl font-serif text-foreground">{stats?.totalBooks || 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Tomos catalogados</p>
          </Card>
          <Card className="p-5 border-[#caa85e]/30 bg-card/90 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[#caa85e]">Lidos</span><Trophy className="h-5 w-5 text-[#caa85e]" /></div>
            <p className="mt-3 text-3xl font-serif text-foreground">{stats?.booksRead || 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Jornadas concluídas</p>
          </Card>
          <Card className="p-5 border-[#caa85e]/30 bg-card/90 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[#caa85e]">Tempo</span><BookOpen className="h-5 w-5 text-[#caa85e]" /></div>
            <p className="mt-3 text-3xl font-serif text-foreground">{profile.totalReadingHours || 0}h</p>
            <p className="mt-1 text-xs text-muted-foreground">Horas de imersão</p>
          </Card>
          <Card className="p-5 border-[#caa85e]/30 bg-card/90 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[#caa85e]">Favoritos</span><Heart className="h-5 w-5 text-[#caa85e]" /></div>
            <p className="mt-3 text-3xl font-serif text-foreground">{favoriteCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Tomos consagrados</p>
          </Card>
        </div>

        {/* Grimório do Dia & Em Leitura */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-7 border-[#caa85e]/40 bg-card/95 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Sparkles className="h-28 w-28 text-[#caa85e]" /></div>
              <div className="flex items-center justify-between mb-4"><span className="text-xs font-semibold uppercase tracking-widest text-[#caa85e]">Sugestão Mística</span><span className="text-xs text-muted-foreground font-serif">Grimório do Dia</span></div>
              {bookOfDay ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="flex-shrink-0"><BookCover book={bookOfDay} size="md" /></div>
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <h3 className="text-2xl font-serif text-foreground">{bookOfDay.title}</h3>
                    <p className="text-sm text-muted-foreground">Por {bookOfDay.author} • <span className="text-[#caa85e]">{bookOfDay.genre}</span></p>
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{bookOfDay.description || 'Um tomo fascinante que aguarda nas estantes da biblioteca por um leitor corajoso.'}</p>
                    <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Link href={`/book/${bookOfDay.id}`}><Button size="sm" className="vortex-button-primary">Abrir Tomo</Button></Link>
                      <Link href="/library"><Button size="sm" variant="outline" className="border-[#caa85e]/40 text-foreground hover:bg-[#caa85e]/10">Ver Estantes</Button></Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum tomo encontrado na biblioteca. Adicione sua primeira obra.</p>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6 border-[#caa85e]/40 bg-card/95 shadow-xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4"><span className="text-xs font-semibold uppercase tracking-widest text-[#caa85e]">Ativos</span><Flame className="h-4 w-4 text-[#caa85e]" /></div>
                <h3 className="text-lg font-serif text-foreground mb-3">Leituras em Andamento</h3>
                {readingBooks.length > 0 ? (
                  <div className="space-y-3">
                    {readingBooks.slice(0, 2).map(book => (
                      <div key={book.id} className="p-3 rounded-lg bg-background/50 border border-[#caa85e]/20 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="font-serif text-sm text-foreground truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.currentPage} de {book.pages || '?'}</p>
                        </div>
                        <Link href={`/book/${book.id}`}><Button size="sm" variant="ghost" className="text-[#caa85e] hover:bg-[#caa85e]/10">Continuar</Button></Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum tomo aberto no momento. Escolha uma sugestão para iniciar sua jornada.</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-border/60">
                <Link href="/goals" className="text-xs text-[#caa85e] hover:underline flex items-center justify-between font-medium"><span>Acompanhar metas e sequência de leitura</span><span>→</span></Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
