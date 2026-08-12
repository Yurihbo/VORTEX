import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowLeft, BookOpen, Check, Heart, MessageSquarePlus, Minus, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { BookCover } from '@/components/BookCover';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storageService } from '@/services/storage';
import { Book, BookStatus } from '@/types/book';

const statusLabels: Record<BookStatus, string> = {
  'want-to-read': 'Na lista do destino',
  reading: 'Em jornada',
  paused: 'Em descanso',
  completed: 'Tesouro conquistado',
};

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [book, setBook] = useState<Book | null>(null);
  const [pageInput, setPageInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [quoteInput, setQuoteInput] = useState('');
  const [quotePage, setQuotePage] = useState('');

  useEffect(() => {
    const found = id ? storageService.getBookById(id) : undefined;
    if (found) {
      setBook(found);
      setPageInput(String(found.currentPage));
    }
  }, [id]);

  const progress = useMemo(() => book ? Math.min(100, Math.round((book.currentPage / book.pages) * 100)) : 0, [book]);

  if (!book) {
    return <Layout><Card className="vortex-card p-10 text-center"><h1 className="text-3xl font-serif">Tomo não encontrado</h1><Link href="/library"><a><Button className="mt-5">Voltar à biblioteca</Button></a></Link></Card></Layout>;
  }

  function saveBook(updates: Partial<Book>, message: string) {
    const next = { ...book!, ...updates };
    storageService.updateBook(book!.id, updates);
    setBook(next);
    toast.success(message);
  }

  function handleProgress(event: FormEvent) {
    event.preventDefault();
    const nextPage = Math.max(0, Math.min(book!.pages, Number(pageInput) || 0));
    const nextStatus = nextPage >= book!.pages ? 'completed' : nextPage > 0 ? 'reading' : book!.status;
    saveBook({ currentPage: nextPage, status: nextStatus, completedDate: nextStatus === 'completed' ? new Date().toISOString() : book!.completedDate }, nextStatus === 'completed' ? 'Jornada concluída.' : 'Progresso atualizado.');
    if (nextPage > book!.currentPage || nextStatus === 'completed') {
      storageService.recordReadingDay();
      window.dispatchEvent(new Event('vortex-streak-updated'));
    }
  }

  function addNote(event: FormEvent) {
    event.preventDefault();
    if (!noteInput.trim()) return;
    saveBook({ notes: [...book!.notes, { id: crypto.randomUUID(), text: noteInput.trim(), date: new Date().toISOString() }] }, 'Pergaminho salvo.');
    setNoteInput('');
  }

  function addQuote(event: FormEvent) {
    event.preventDefault();
    if (!quoteInput.trim()) return;
    saveBook({ quotes: [...book!.quotes, { id: crypto.randomUUID(), text: quoteInput.trim(), page: Number(quotePage) || 0, date: new Date().toISOString() }] }, 'Fragmento guardado.');
    setQuoteInput('');
    setQuotePage('');
  }

  function deleteBook() {
    if (window.confirm('Excluir este tomo da biblioteca?')) {
      storageService.deleteBook(book!.id);
      toast.success('Tomo removido dos corredores.');
      navigate('/library');
    }
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <Link href="/library"><a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><ArrowLeft className="h-4 w-4" /> Minha biblioteca</a></Link>
          <Button variant="outline" size="sm" onClick={deleteBook} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Excluir tomo</Button>
        </div>

        <section className="vortex-grimoire relative overflow-hidden rounded-2xl border border-[#caa85e]/30 p-6 md:p-10">
          <div className="absolute right-6 top-5 text-5xl text-[#caa85e]/15 select-none">◈</div>
          <div className="relative grid gap-8 lg:grid-cols-[220px_1fr]">
            <div className="flex justify-center lg:justify-start"><BookCover book={book} size="lg" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[.2em] text-[#caa85e]"><span>Grimório digital</span><span className="text-muted-foreground">·</span><span>{book.genre}</span></div>
              <h1 className="mt-3 text-5xl md:text-6xl font-serif leading-[.9]">{book.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{book.author}</p>
              <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">{book.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button onClick={() => saveBook({ isFavorite: !book.isFavorite }, book.isFavorite ? 'Relíquia removida.' : 'Relíquia favoritada.')} variant={book.isFavorite ? 'default' : 'outline'}><Heart className={`h-4 w-4 mr-2 ${book.isFavorite ? 'fill-current' : ''}`} /> {book.isFavorite ? 'Favorito' : 'Favoritar'}</Button>
                <select value={book.status} onChange={event => saveBook({ status: event.target.value as BookStatus }, 'Status alterado.')} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="want-to-read">Quero ler</option><option value="reading">Em leitura</option><option value="paused">Pausado</option><option value="completed">Concluído</option></select>
              </div>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border/60 pt-5">
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Páginas</p><p className="mt-1 font-semibold">{book.pages}</p></div>
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Status</p><p className="mt-1 font-semibold">{statusLabels[book.status]}</p></div>
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Ano</p><p className="mt-1 font-semibold">{book.year || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Avaliação</p><p className="mt-1 font-semibold text-[#caa85e]">{book.rating ? '★'.repeat(book.rating) : '—'}</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <Card className="vortex-card p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Acompanhamento</p><h2 className="text-3xl font-serif mt-1">Jornada de leitura</h2></div><BookOpen className="h-6 w-6 text-primary" /></div>
            <div className="mt-6 flex items-end justify-between"><div><span className="text-4xl font-serif">{book.currentPage}</span><span className="text-muted-foreground"> / {book.pages}</span></div><span className="text-2xl text-primary font-semibold">{progress}%</span></div>
            <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-[#caa85e] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            <form onSubmit={handleProgress} className="mt-6 flex flex-wrap gap-2"><Input type="number" min="0" max={book.pages} value={pageInput} onChange={event => setPageInput(event.target.value)} className="max-w-[150px]" aria-label="Página atual" /><Button type="submit"><Save className="h-4 w-4 mr-2" /> Salvar página</Button><Button type="button" variant="outline" onClick={() => setPageInput(String(Math.min(book.pages, book.currentPage + 10)))}><Plus className="h-4 w-4 mr-1" /> 10</Button><Button type="button" variant="outline" onClick={() => setPageInput(String(Math.max(0, book.currentPage - 10)))}><Minus className="h-4 w-4 mr-1" /> 10</Button></form>
            {book.status === 'completed' && <p className="mt-5 flex items-center gap-2 text-[#caa85e]"><Check className="h-4 w-4" /> Jornada concluída — tesouro conquistado.</p>}
          </Card>
          <Card className="vortex-card p-6">
            <p className="eyebrow">Memória do tomo</p><h2 className="text-3xl font-serif mt-1">Dados da edição</h2>
            <dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between gap-4 border-b border-border/50 pb-3"><dt className="text-muted-foreground">ISBN</dt><dd>{book.isbn || '—'}</dd></div><div className="flex justify-between gap-4 border-b border-border/50 pb-3"><dt className="text-muted-foreground">Editora</dt><dd>{book.publisher || '—'}</dd></div><div className="flex justify-between gap-4 border-b border-border/50 pb-3"><dt className="text-muted-foreground">Adicionado</dt><dd>{new Date(book.addedDate).toLocaleDateString('pt-BR')}</dd></div></dl>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="vortex-card p-6"><div className="flex items-center gap-2"><MessageSquarePlus className="h-5 w-5 text-primary" /><h2 className="text-3xl font-serif">Pergaminhos Pessoais</h2></div><form onSubmit={addNote} className="mt-5 space-y-3"><Textarea value={noteInput} onChange={event => setNoteInput(event.target.value)} placeholder="Registre pensamentos, análises ou observações..." /><Button type="submit">Salvar nota</Button></form><div className="mt-6 space-y-3">{book.notes.length ? book.notes.slice().reverse().map(note => <div key={note.id} className="rounded-lg border border-border/60 bg-background/30 p-4"><p className="text-sm leading-6">{note.text}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(note.date).toLocaleDateString('pt-BR')}</p></div>) : <p className="text-sm text-muted-foreground">Nenhum pergaminho foi escrito ainda.</p>}</div></Card>
          <Card className="vortex-card p-6"><div className="flex items-center gap-2"><span className="text-xl text-[#caa85e]">❞</span><h2 className="text-3xl font-serif">Fragmentos</h2></div><form onSubmit={addQuote} className="mt-5 space-y-3"><Textarea value={quoteInput} onChange={event => setQuoteInput(event.target.value)} placeholder="Uma passagem que merece ser guardada..." /><div className="flex gap-3"><Input type="number" min="0" value={quotePage} onChange={event => setQuotePage(event.target.value)} placeholder="Página" /><Button type="submit">Guardar fragmento</Button></div></form><div className="mt-6 space-y-3">{book.quotes.length ? book.quotes.slice().reverse().map(quote => <blockquote key={quote.id} className="rounded-lg border-l-2 border-[#caa85e] bg-[#caa85e]/5 p-4"><p className="font-serif text-lg leading-6">“{quote.text}”</p><footer className="mt-2 text-xs text-muted-foreground">Página {quote.page || '—'}</footer></blockquote>) : <p className="text-sm text-muted-foreground">Os fragmentos marcantes aparecerão aqui.</p>}</div></Card>
        </section>
      </div>
    </Layout>
  );
}
