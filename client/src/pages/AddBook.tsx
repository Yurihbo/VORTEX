import { FormEvent, useState } from 'react';
import { ArrowLeft, BookPlus, Upload } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storageService } from '@/services/storage';
import { BookStatus } from '@/types/book';

export default function AddBook() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', year: '', pages: '', genre: 'Fantasia', description: '', coverUrl: '', status: 'want-to-read' as BookStatus, rating: '' });

  function update(field: string, value: string) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.pages) {
      toast.error('Preencha título, autor e páginas para registrar o tomo.');
      return;
    }
    storageService.addBook({
      id: crypto.randomUUID(),
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      publisher: form.publisher.trim(),
      year: form.year ? Number(form.year) : undefined,
      pages: Number(form.pages),
      genre: form.genre,
      description: form.description.trim() || 'Uma nova história aguarda ser descoberta.',
      coverUrl: form.coverUrl.trim() || undefined,
      status: form.status,
      isFavorite: false,
      rating: form.rating ? Number(form.rating) : undefined,
      currentPage: form.status === 'completed' ? Number(form.pages) : 0,
      completedDate: form.status === 'completed' ? new Date().toISOString() : undefined,
      addedDate: new Date().toISOString(),
      notes: [],
      quotes: [],
    });
    toast.success('Novo tomo registrado na Vortex.');
    navigate('/library');
  }

  return (
    <Layout>
      <div className="max-w-4xl space-y-7 animate-fade-in">
        <Link href="/library"><a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><ArrowLeft className="h-4 w-4" /> Minha biblioteca</a></Link>
        <header><p className="eyebrow">Arquivo de entrada</p><h1 className="text-5xl font-serif mt-2">Registrar novo tomo</h1><p className="text-muted-foreground mt-2">Traga uma nova história para os corredores da Vortex.</p></header>
        <Card className="vortex-card p-6 md:p-8">
          <form onSubmit={submit} className="space-y-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="field-label">Título *<Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ex.: O nome do vento" required /></label>
              <label className="field-label">Autor *<Input value={form.author} onChange={e => update('author', e.target.value)} placeholder="Nome do autor" required /></label>
              <label className="field-label">ISBN<Input value={form.isbn} onChange={e => update('isbn', e.target.value)} placeholder="978-..." /></label>
              <label className="field-label">Editora<Input value={form.publisher} onChange={e => update('publisher', e.target.value)} placeholder="Editora" /></label>
              <label className="field-label">Ano<Input type="number" value={form.year} onChange={e => update('year', e.target.value)} placeholder="2024" /></label>
              <label className="field-label">Páginas *<Input type="number" min="1" value={form.pages} onChange={e => update('pages', e.target.value)} placeholder="320" required /></label>
              <label className="field-label">Gênero<select value={form.genre} onChange={e => update('genre', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option>Fantasia</option><option>Ficção Científica</option><option>Ficção</option><option>História</option><option>Filosofia</option><option>Tecnologia</option><option>Romance</option><option>Não ficção</option></select></label>
              <label className="field-label">Status<select value={form.status} onChange={e => update('status', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="want-to-read">Quero ler</option><option value="reading">Em leitura</option><option value="paused">Pausado</option><option value="completed">Concluído</option></select></label>
              <label className="field-label">Avaliação<select value={form.rating} onChange={e => update('rating', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem avaliação</option><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label>
              <label className="field-label md:col-span-2">URL da capa<Input value={form.coverUrl} onChange={e => update('coverUrl', e.target.value)} placeholder="https://... (opcional)" /></label>
              <label className="field-label md:col-span-2">Descrição<Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Sobre o que é este tomo?" rows={5} /></label>
            </div>
            <div className="rounded-lg border border-dashed border-[#caa85e]/40 bg-[#caa85e]/5 p-4 text-sm text-muted-foreground flex gap-3"><Upload className="h-5 w-5 text-[#caa85e] shrink-0" /><span>As capas por URL são opcionais. Quando ausente, a Vortex cria uma ficha de arquivo elegante para o tomo.</span></div>
            <div className="flex flex-wrap justify-end gap-3"><Link href="/library"><a><Button type="button" variant="outline">Cancelar</Button></a></Link><Button type="submit"><BookPlus className="h-4 w-4 mr-2" /> Registrar tomo</Button></div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
