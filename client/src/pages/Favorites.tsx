import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Heart, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCover } from '@/components/BookCover';
import { storageService } from '@/services/storage';
import { Book } from '@/types/book';

export default function Favorites() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    setBooks(storageService.getBooks().filter(book => book.isFavorite));
  }, []);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="eyebrow">Coleção pessoal · VORTEX</p>
            <h1 className="text-4xl font-serif font-bold mt-2">Relíquias Favoritas</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">Os tomos que permanecem acesos na sua memória de leitura.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#caa85e]/30 bg-[#caa85e]/10 px-3 py-1 text-sm text-[#caa85e]"><Heart className="h-4 w-4 fill-current" /> {books.length} relíquias</span>
        </header>

        {books.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {books.map(book => (
              <Link key={book.id} href={`/book/${book.id}`}>
                <a className="group block">
                  <Card className="vortex-card p-5 flex gap-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#caa85e]/50 hover:shadow-[0_16px_34px_rgba(0,0,0,.24)]">
                    <BookCover book={book} size="md" />
                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[.2em] text-[#caa85e]">Relíquia</p>
                          <h2 className="font-serif text-2xl leading-tight mt-1 group-hover:text-[#caa85e] transition-colors">{book.title}</h2>
                        </div>
                        <Heart className="h-4 w-4 text-[#caa85e] fill-current shrink-0" aria-label="Favorito" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                      <p className="text-xs text-muted-foreground mt-auto pt-4">{book.genre} · {book.pages} páginas</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Abrir tomo <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="vortex-card p-12 text-center max-w-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#caa85e]/30 bg-[#caa85e]/10 text-[#caa85e]"><Heart className="h-6 w-6" /></div>
            <h2 className="text-2xl font-serif font-bold">Nenhuma relíquia foi escolhida.</h2>
            <p className="text-muted-foreground mt-2">Marque os livros que deseja encontrar de novo com um só gesto.</p>
            <Link href="/library"><a><Button className="mt-6">Explorar biblioteca</Button></a></Link>
          </Card>
        )}
      </div>
    </Layout>
  );
}
