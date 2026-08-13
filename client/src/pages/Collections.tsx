import { useState, useEffect } from 'react';
import { collectionStorage, getBooks, CustomCollection, Book } from '@/services/storage';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, FolderPlus, Palette, Plus, Trash2, Wand2 } from 'lucide-react';
import { BookCover } from '@/components/BookCover';
import { toast } from 'sonner';

export default function Collections() {
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CustomCollection | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [borderColor, setBorderColor] = useState('#caa85e');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('vortex-collections-updated', handleUpdate);
    return () => window.removeEventListener('vortex-collections-updated', handleUpdate);
  }, []);

  function loadData() {
    setCollections(collectionStorage.getCollections());
    setBooks(getBooks());
  }

  function handleOpenCreate() {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setBorderColor('#caa85e');
    setSelectedBookIds([]);
    setIsCreateOpen(true);
  }

  function handleOpenEdit(col: CustomCollection) {
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setBorderColor(col.borderColor || '#caa85e');
    setSelectedBookIds(col.bookIds || []);
    setIsCreateOpen(true);
  }

  function handleSaveCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Dê um nome para a coleção.');
      return;
    }

    if (editingCollection) {
      collectionStorage.updateCollection({
        ...editingCollection,
        name: name.trim(),
        description: description.trim(),
        borderColor,
        bookIds: selectedBookIds,
      });
      toast.success('Coleção atualizada com sucesso!');
    } else {
      collectionStorage.addCollection({
        name: name.trim(),
        description: description.trim(),
        borderColor,
        bookIds: selectedBookIds,
      });
      toast.success('Nova coleção criada e consagrada!');
    }

    setIsCreateOpen(false);
    loadData();
  }

  function handleDelete(id: string) {
    if (confirm('Deseja realmente dissolver esta coleção?')) {
      collectionStorage.deleteCollection(id);
      toast.success('Coleção removida.');
      loadData();
    }
  }

  function toggleBookSelection(bookId: string) {
    setSelectedBookIds(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  }

  const presetColors = [
    { label: 'Dourado Arcano', value: '#caa85e' },
    { label: 'Safira Mística', value: '#3b82f6' },
    { label: 'Esmeralda Élfica', value: '#10b981' },
    { label: 'Rubi do Dragão', value: '#ef4444' },
    { label: 'Roxo Etéreo', value: '#8b5cf6' },
    { label: 'Prata Lunar', value: '#94a3b8' },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#caa85e] flex items-center gap-3">
              <BookOpen className="w-8 h-8" /> Coleções Místicas
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize suas leituras em pergaminhos temáticos, escolha as cores de suas bordas e reúna os tomos da sua escolha.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="bg-[#caa85e] hover:bg-[#b3934f] text-black font-medium gap-2">
                <FolderPlus className="w-4 h-4" /> Criar Nova Coleção
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-card border-border/80">
              <form onSubmit={handleSaveCollection}>
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl text-[#caa85e]">
                    {editingCollection ? 'Editar Coleção' : 'Criar Coleção Mágica'}
                  </DialogTitle>
                  <DialogDescription>
                    Defina o nome, a cor da borda mística e selecione os livros que farão parte desta estante.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-serif">Nome da Coleção</label>
                    <Input 
                      placeholder="Ex: Saga Tolkien, Clássicos de Sci-Fi..." 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="bg-background/50 border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-serif">Descrição (Opcional)</label>
                    <Textarea 
                      placeholder="Sobre o que é esta estante..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      className="bg-background/50 border-border resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-serif flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-[#caa85e]" /> Cor da Borda Mágica
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {presetColors.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setBorderColor(c.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${borderColor === c.value ? 'scale-110 ring-2 ring-primary' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c.value, borderColor: borderColor === c.value ? '#ffffff' : 'transparent' }}
                          title={c.label}
                        />
                      ))}
                      <div className="flex items-center gap-2 ml-2">
                        <input 
                          type="color" 
                          value={borderColor} 
                          onChange={e => setBorderColor(e.target.value)} 
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{borderColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-serif flex items-center justify-between">
                      <span>Selecionar Tomos ({selectedBookIds.length} escolhidos)</span>
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-border/60 rounded-md p-2 bg-background/30">
                      {books.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Nenhum tomo cadastrado na biblioteca ainda.</p>
                      ) : (
                        books.map(b => {
                          const isSelected = selectedBookIds.includes(b.id);
                          return (
                            <div 
                              key={b.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleBookSelection(b.id)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleBookSelection(b.id); }}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 border border-primary/40' : 'hover:bg-muted/50 border border-transparent'}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-10 shrink-0 rounded overflow-hidden shadow">
                                  <BookCover book={b} size="sm" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-serif font-medium truncate">{b.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{b.author}</p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded font-serif ${isSelected ? 'bg-[#caa85e] text-black font-semibold' : 'bg-muted text-muted-foreground'}`}>
                                {isSelected ? 'Na Coleção' : 'Adicionar'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-border">Cancelar</Button>
                  <Button type="submit" className="bg-[#caa85e] hover:bg-[#b3934f] text-black font-semibold">Salvar Coleção</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {collections.length === 0 ? (
          <Card className="p-12 text-center bg-card/60 border-border/80">
            <div className="max-w-md mx-auto space-y-4">
              <Wand2 className="w-12 h-12 text-[#caa85e] mx-auto animate-pulse" />
              <h3 className="text-xl font-serif font-bold">Nenhuma coleção criada</h3>
              <p className="text-sm text-muted-foreground">
                Crie estantes temáticas personalizadas para agrupar seus livros por autor, saga ou gênero.
              </p>
              <Button onClick={handleOpenCreate} className="bg-[#caa85e] hover:bg-[#b3934f] text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Criar Primeira Coleção
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map(col => {
              const colBooks = books.filter(b => col.bookIds.includes(b.id));
              return (
                <Card 
                  key={col.id} 
                  className="bg-card/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col"
                  style={{ borderLeft: `6px solid ${col.borderColor}` }}
                >
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-serif font-bold text-[#caa85e]">{col.name}</h2>
                          <p className="text-xs text-muted-foreground mt-1">{col.description || 'Coleção personalizada'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(col)} title="Editar coleção">
                            <Palette className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(col.id)} title="Dissolver coleção">
                            <Trash2 className="w-4 h-4 text-destructive/80 hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 border-b border-border/40 pb-2">
                        <span>{colBooks.length} {colBooks.length === 1 ? 'livro guardado' : 'livros guardados'}</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.borderColor }} /> Ativa</span>
                      </div>

                      {colBooks.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-border/60 rounded-lg bg-background/30">
                          <p className="text-xs text-muted-foreground">Nenhum tomo adicionado a esta estante ainda.</p>
                          <Button variant="link" size="sm" onClick={() => handleOpenEdit(col)} className="text-[#caa85e] mt-1">
                            + Adicionar livros
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                          {colBooks.map(book => (
                            <div key={book.id} className="group relative flex flex-col items-center text-center">
                              <div className="w-16 h-24 rounded overflow-hidden shadow-md border border-border/60 transition-transform duration-200 group-hover:scale-105 bg-muted">
                                <BookCover book={book} size="sm" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[11px] font-serif font-medium mt-1.5 line-clamp-1 w-full text-foreground group-hover:text-[#caa85e] transition-colors" title={book.title}>
                                {book.title}
                              </span>
                              <span className="text-[9px] text-muted-foreground line-clamp-1 w-full">{book.author}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
