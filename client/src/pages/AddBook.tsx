import { ChangeEvent, FormEvent, useState } from 'react';
import { ArrowLeft, BookPlus, ImagePlus, Upload, X } from 'lucide-react';
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
  const [coverPreview, setCoverPreview] = useState('');
  const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', year: '', pages: '', genre: 'Fantasia', description: '', coverUrl: '', status: 'want-to-read' as BookStatus, rating: '' });

  function update(field: string, value: string) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem válido.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2 MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setCoverPreview(result);
      setForm(current => ({ ...current, coverUrl: '' }));
      toast.success('Capa selecionada para este tomo.');
    };
    reader.onerror = () => toast.error('Não foi possível ler a imagem.');
    reader.readAsDataURL(file);
  }

  function clearCover() {
    setCoverPreview('');
    setForm(current => ({ ...current, coverUrl: '' }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error('Informe pelo menos o título para registrar o tomo.');
      return;
    }
    const pages = Math.max(1, Number(form.pages) || 1);
    const author = form.author.trim() || 'Autor desconhecido';
    try {
      await storageService.addBook({
      id: crypto.randomUUID(),
      title: form.title.trim(),
      author,
      isbn: form.isbn.trim(),
      publisher: form.publisher.trim(),
      year: form.year ? Number(form.year) : undefined,
      pages,
      genre: form.genre,
      description: form.description.trim() || 'Uma nova história aguarda ser descoberta.',
      coverUrl: coverPreview || form.coverUrl.trim() || undefined,
      status: form.status,
      isFavorite: false,
      rating: form.rating ? Number(form.rating) : undefined,
      currentPage: form.status === 'completed' ? pages : 0,
      completedDate: form.status === 'completed' ? new Date().toISOString() : undefined,
      addedDate: new Date().toISOString(),
      notes: [],
        quotes: [],
      });
      toast.success('Novo tomo registrado na Vortex.');
      navigate('/library');
    } catch {
      toast.error('Não foi possível guardar este tomo e sua capa. Verifique o espaço disponível no dispositivo e tente novamente.');
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl space-y-7 animate-fade-in">
        <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><ArrowLeft className="h-4 w-4" /> Minha biblioteca</Link>
        <header><p className="eyebrow">Arquivo de entrada</p><h1 className="text-5xl font-serif mt-2">Registrar novo tomo</h1><p className="text-muted-foreground mt-2">Traga uma nova história para os corredores da Vortex.</p></header>
        <Card className="vortex-card p-6 md:p-8">
          <form onSubmit={submit} className="space-y-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="field-label">Título *<Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ex.: O nome do vento" required /></label>
              <label className="field-label">Autor<Input value={form.author} onChange={e => update('author', e.target.value)} placeholder="Nome do autor (opcional)" /></label>
              <label className="field-label">ISBN<Input value={form.isbn} onChange={e => update('isbn', e.target.value)} placeholder="978-..." /></label>
              <label className="field-label">Editora<Input value={form.publisher} onChange={e => update('publisher', e.target.value)} placeholder="Editora" /></label>
              <label className="field-label">Ano<Input type="number" value={form.year} onChange={e => update('year', e.target.value)} placeholder="2024" /></label>
              <label className="field-label">Páginas<Input type="number" min="1" value={form.pages} onChange={e => update('pages', e.target.value)} placeholder="320 (opcional)" /></label>
              <label className="field-label">Gênero<select value={form.genre} onChange={e => update('genre', e.target.value)} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option>Fantasia</option><option>Ficção Científica</option><option>Ficção</option><option>História</option><option>Filosofia</option><option>Tecnologia</option><option>Romance</option><option>Não ficção</option></select></label>
              <label className="field-label">Status<select value={form.status} onChange={e => update('status', e.target.value)} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="want-to-read">Quero ler</option><option value="reading">Em leitura</option><option value="paused">Pausado</option><option value="completed">Concluído</option></select></label>
              <label className="field-label">Avaliação<select value={form.rating} onChange={e => update('rating', e.target.value)} className="vortex-select h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem avaliação</option><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label>
            </div>

            <div className="cover-upload-panel">
              <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Imagem do tomo</p><h2 className="text-2xl font-serif mt-1">Escolha a capa</h2><p className="text-sm text-muted-foreground mt-1">Envie uma imagem do seu dispositivo ou use uma URL pública.</p></div>{coverPreview && <Button type="button" variant="ghost" size="sm" onClick={clearCover} className="text-muted-foreground"><X className="h-4 w-4 mr-1" /> Remover</Button>}</div>
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-5"><div className="cover-upload-preview">{coverPreview ? <img src={coverPreview} alt="Pré-visualização da capa escolhida" /> : <><ImagePlus className="h-8 w-8 text-[#caa85e]" /><span>Nenhuma capa</span></>}</div><div className="flex-1 w-full space-y-3"><label htmlFor="cover-upload" className="cover-upload-button"><Upload className="h-4 w-4" /> Escolher imagem do dispositivo</label><input id="cover-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleCoverUpload} className="sr-only" /><div className="flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-[10px] uppercase tracking-widest text-muted-foreground">ou URL</span><div className="h-px flex-1 bg-border" /></div><Input value={form.coverUrl} onChange={e => { update('coverUrl', e.target.value); setCoverPreview(''); }} placeholder="https://..." /></div></div>
              <p className="mt-4 text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WEBP ou GIF. Limite de 2 MB por imagem.</p>
            </div>

            <div className="grid gap-5"><label className="field-label">Descrição<Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Sobre o que é este tomo?" rows={5} /></label></div>
            <div className="rounded-lg border border-dashed border-[#caa85e]/40 bg-[#caa85e]/5 p-4 text-sm text-muted-foreground flex gap-3"><Upload className="h-5 w-5 text-[#caa85e] shrink-0" /><span>A capa escolhida é armazenada junto ao registro local deste tomo neste dispositivo.</span></div>
            <div className="flex flex-wrap justify-end gap-3"><Link href="/library"><Button type="button" variant="outline">Cancelar</Button></Link><Button type="submit"><BookPlus className="h-4 w-4 mr-2" /> Registrar tomo</Button></div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
