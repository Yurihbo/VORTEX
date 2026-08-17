import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowLeft, BookOpen, Check, Heart, ImagePlus, MessageSquarePlus, Minus, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { BookCover } from '@/components/BookCover';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storageService } from '@/services/storage';
import { getBookCover, isStoredCover } from '@/services/bookMedia';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [editStoredCover, setEditStoredCover] = useState('');
  const [editForm, setEditForm] = useState({ title: '', author: '', isbn: '', publisher: '', year: '', pages: '', genre: '', description: '', coverUrl: '', status: 'want-to-read' as BookStatus, rating: '' });

  useEffect(() => {
    const found = id ? storageService.getBookById(id) : undefined;
    if (found) {
      setBook(found);
      setPageInput(String(found.currentPage));
      setEditForm({ title: found.title, author: found.author, isbn: found.isbn || '', publisher: found.publisher || '', year: found.year ? String(found.year) : '', pages: String(found.pages), genre: found.genre, description: found.description, coverUrl: found.coverUrl || '', status: found.status, rating: found.rating ? String(found.rating) : '' });
      if (isStoredCover(found.coverUrl)) void getBookCover(found.id).then(url => setEditStoredCover(url || '')).catch(() => setEditStoredCover(''));
    }
  }, [id]);

  const progress = useMemo(() => book ? Math.min(100, Math.round((book.currentPage / book.pages) * 100)) : 0, [book]);

  if (!book) {
    return <Layout><Card className="vortex-card p-10 text-center"><h1 className="text-3xl font-serif">Tomo não encontrado</h1><Link href="/library"><a><Button className="mt-5">Voltar à biblioteca</Button></a></Link></Card></Layout>;
  }

  function saveBook(updates: Partial<Book>, message: string) {
    const next = { ...book!, ...updates };
    void storageService.updateBook(book!.id, updates).then(() => toast.success(message)).catch(() => toast.error('Não foi possível salvar as alterações.'));
    setBook(next);
  }

  function updateEditField(field: string, value: string) {
    setEditForm(current => ({ ...current, [field]: value }));
  }

  function handleEditCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Escolha uma imagem válida.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('A imagem deve ter no máximo 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setEditCoverPreview(String(reader.result || '')); setEditForm(current => ({ ...current, coverUrl: '' })); };
    reader.readAsDataURL(file);
  }

  async function saveEditedBook(event: FormEvent) {
    event.preventDefault();
    if (!editForm.title.trim()) { toast.error('O título é obrigatório.'); return; }
    const pages = Math.max(1, Number(editForm.pages) || 1);
    const updates: Partial<Book> = {
      title: editForm.title.trim(), author: editForm.author.trim() || 'Autor desconhecido', isbn: editForm.isbn.trim(), publisher: editForm.publisher.trim(),
      year: editForm.year ? Number(editForm.year) : undefined, pages, genre: editForm.genre || 'Fantasia', description: editForm.description.trim() || 'Uma nova história aguarda ser descoberta.',
      coverUrl: editCoverPreview || editForm.coverUrl.trim() || undefined, status: editForm.status, rating: editForm.rating ? Number(editForm.rating) : undefined,
      currentPage: Math.min(book!.currentPage, pages),
    };
    try {
      await storageService.updateBook(book!.id, updates);
      const next = { ...book!, ...updates };
      setBook(next);
      setPageInput(String(next.currentPage));
      setEditCoverPreview('');
      setEditStoredCover('');
      setIsEditing(false);
      toast.success('Informações do tomo atualizadas.');
    } catch { toast.error('Não foi possível salvar o tomo e sua capa.'); }
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
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { if (isEditing) (document.getElementById('book-edit-form') as HTMLFormElement | null)?.requestSubmit(); else setIsEditing(true); }}><Save className="h-4 w-4 mr-2" /> {isEditing ? 'Salvar Tomo' : 'Editar tomo'}</Button><Button variant="outline" size="sm" onClick={deleteBook} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Excluir tomo</Button></div>
        </div>

        {isEditing && <Card className="vortex-card p-6 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Ateliê do tomo</p><h2 className="mt-1 text-3xl font-serif">Editar informações</h2><p className="mt-2 text-sm text-muted-foreground">Atualize os dados e a capa sem precisar cadastrar o livro novamente.</p></div><button type="button" className="wand-click" aria-label="Fechar edição" onClick={() => setIsEditing(false)}><X className="h-5 w-5" /></button></div><form id="book-edit-form" onSubmit={saveEditedBook} className="mt-6 space-y-5"><div className="grid gap-4 md:grid-cols-2"><label className="field-label">Título *<Input value={editForm.title} onChange={event => updateEditField('title', event.target.value)} required /></label><label className="field-label">Autor<Input value={editForm.author} onChange={event => updateEditField('author', event.target.value)} /></label><label className="field-label">ISBN<Input value={editForm.isbn} onChange={event => updateEditField('isbn', event.target.value)} /></label><label className="field-label">Editora<Input value={editForm.publisher} onChange={event => updateEditField('publisher', event.target.value)} /></label><label className="field-label">Ano<Input type="number" value={editForm.year} onChange={event => updateEditField('year', event.target.value)} /></label><label className="field-label">Páginas<Input type="number" min="1" value={editForm.pages} onChange={event => updateEditField('pages', event.target.value)} /></label><label className="field-label">Gênero<select value={editForm.genre} onChange={event => updateEditField('genre', event.target.value)} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option>Fantasia</option><option>Ficção Científica</option><option>Ficção</option><option>História</option><option>Filosofia</option><option>Tecnologia</option><option>Romance</option><option>Não ficção</option></select></label><label className="field-label">Status<select value={editForm.status} onChange={event => updateEditField('status', event.target.value)} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="want-to-read">Quero ler</option><option value="reading">Em leitura</option><option value="paused">Pausado</option><option value="completed">Concluído</option></select></label><label className="field-label">Avaliação<select value={editForm.rating} onChange={event => updateEditField('rating', event.target.value)} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem avaliação</option><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label></div><label className="field-label">Descrição<Textarea rows={4} value={editForm.description} onChange={event => updateEditField('description', event.target.value)} /></label><div className="rounded-lg border border-[#caa85e]/30 bg-[#caa85e]/5 p-4"><div className="flex items-center justify-between gap-3"><span className="field-label">Capa do tomo</span>{(editCoverPreview || editForm.coverUrl) && <Button type="button" variant="ghost" size="sm" onClick={() => { setEditCoverPreview(''); setEditStoredCover(''); setEditForm(current => ({ ...current, coverUrl: '' })); }}><X className="h-4 w-4 mr-1" /> Remover capa</Button>}</div><div className="mt-3 flex flex-wrap items-center gap-4"><div className="h-28 w-20 overflow-hidden rounded border border-[#caa85e]/40 bg-background">{editCoverPreview || editStoredCover || (editForm.coverUrl && !isStoredCover(editForm.coverUrl)) ? <img src={editCoverPreview || editStoredCover || editForm.coverUrl} alt="Prévia da capa" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-6 w-6 text-[#caa85e]" /></div>}</div><label htmlFor="edit-cover-upload" className="cover-upload-button"><Upload className="h-4 w-4" /> Trocar imagem</label><input id="edit-cover-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleEditCover} className="sr-only" /></div></div><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button><Button type="submit" className="wand-click"><Save className="h-4 w-4 mr-2" /> Salvar Tomo</Button></div></form></Card>}

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
                <select value={book.status} onChange={event => saveBook({ status: event.target.value as BookStatus }, 'Status alterado.')} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="want-to-read">Quero ler</option><option value="reading">Em leitura</option><option value="paused">Pausado</option><option value="completed">Concluído</option></select>
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
