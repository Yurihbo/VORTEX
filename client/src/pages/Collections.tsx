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

  function handleSave() {
    if (!name.trim()) {
      toast.error('Dê um nome místico para a sua coleção.');
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
      toast.success('Coleção aprimorada com sucesso.');
    } else {
      collectionStorage.addCollection({
        name: name.trim(),
        description: description.trim(),
        borderColor,
        bookIds: selectedBookIds,
      });
      toast.success('Nova coleção consagrada na biblioteca.');
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
      <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <FolderPlus className="w-8 h-8 text-[#caa85e]" /> Coleções Místicas
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize seus tomos em pergaminhos e estantes personalizadas com bordas mágicas.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="bg-[#caa85e] text-black hover:bg-[#b8974d] font-serif wand-click">
                <Plus className="w-4 h-4 mr-2" /> Criar Coleção
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-card border-border/80">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-[#caa85e]">
                  {editingCollection ? 'Editar Coleção' : 'Nova Coleção Mística'}
                </DialogTitle>
                <DialogDescription>
                  Defina o nome, a cor da borda mágica e selecione os tomos que compõem esta estante.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-serif">Nome da Coleção</label>
                  <Input 
                    placeholder="Ex: Obras de J.R.R. Tolkien, Alta Fantasia..." 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="bg-background/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-serif">Descrição (Opcional)</label>
                  <Textarea 
                    placeholder="Breve pergaminho sobre o tema desta estante..." 
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
                            onClick={() => toggleBookSelection(b.id)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 border border-primary/40' : 'hover:bg-muted/50 border border-transparent'}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-10 shrink-0 rounded overflow-hidden shadow">
                                <BookCover book={b} className="w-full h-full object-cover" />
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
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-border">Cancelar</Button>
                <Button onClick={handleSave} className="bg-[#caa85e] text-black hover:bg-[#b8974d] font-serif">
                  {editingCollection ? 'Salvar Alterações' : 'Consagrar Coleção'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {collections.length === 0 ? (
          <Card className="bg-card/60 border-border/60 text-center py-16">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#caa85e]/10 flex items-center justify-center mx-auto text-[#caa85e]">
                <Wand2 className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-xl font-serif font-bold text-[#caa85e]">Nenhuma Coleção Criada</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Crie estantes mágicas para agrupar seus livros favoritos por autor, universo fantástico ou gênero literário.
              </p>
              <Button onClick={handleOpenCreate} className="bg-[#caa85e] text-black hover:bg-[#b8974d] font-serif mt-2">
                <Plus className="w-4 h-4 mr-2" /> Criar Primeira Coleção
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map(col => {
              const colBooks = books.filter(b => col.bookIds?.includes(b.id));
              return (
                <Card 
                  key={col.id} 
                  className="bg-card/80 border-2 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                  style={{ borderColor: col.borderColor || '#caa85e' }}
                >
                  <div className="absolute top-0 right-0 p-3 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-card via-card/80 to-transparent pl-6 z-10">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(col)} className="h-8 px-2 text-xs text-[#caa85e] hover:bg-primary/10 font-serif">
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(col.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: col.borderColor || '#caa85e' }} />
                        <h2 className="text-xl font-serif font-bold text-foreground tracking-wide">{col.name}</h2>
                      </div>
                      {col.description && (
                        <p className="text-xs text-muted-foreground font-serif italic mt-1 leading-relaxed">
                          "{col.description}"
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border/40 pt-4">
                      <p className="text-[11px] uppercase tracking-widest text-[#caa85e] font-serif mb-3">
                        Tomos na Estante ({colBooks.length})
                      </p>

                      {colBooks.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border/60 rounded">
                          Nenhum tomo vinculado a esta coleção ainda. Edite para adicionar.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {colBooks.map(b => (
                            <div key={b.id} className="flex flex-col items-center text-center p-2 rounded-lg bg-background/40 border border-border/40 hover:border-primary/50 transition-colors">
                              <div className="w-12 h-16 rounded overflow-hidden shadow-md mb-1.5 shrink-0">
                                <BookCover book={b} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs font-serif font-medium text-foreground line-clamp-1 w-full" title={b.title}>
                                {b.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1 w-full">
                                {b.author}
                              </span>
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
