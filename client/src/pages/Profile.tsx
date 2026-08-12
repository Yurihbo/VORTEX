import { ChangeEvent, useRef } from 'react';
import { Download, FileUp, Shield, Sparkles, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storageService } from '@/services/storage';

export default function Profile() {
  const fileRef = useRef<HTMLInputElement>(null);
  const books = storageService.getBooks();
  const completed = books.filter(book => book.status === 'completed').length;
  const favorites = books.filter(book => book.isFavorite).length;

  function exportLibrary() {
    const blob = new Blob([storageService.exportLibrary()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'vortex-library.json';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Sua biblioteca foi guardada em vortex-library.json.');
  }

  function importLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = storageService.importLibrary(String(reader.result));
      if (success) {
        toast.success('Seus tomos foram invocados para a Vortex.');
        window.location.reload();
      } else toast.error('Não foi possível ler este pergaminho JSON.');
    };
    reader.readAsText(file);
  }

  return (
    <Layout>
      <div className="max-w-4xl space-y-7 animate-fade-in">
        <header><p className="eyebrow">Identidade do guardião</p><h1 className="text-5xl font-serif mt-2">Perfil</h1><p className="text-muted-foreground mt-2">A pessoa por trás das páginas e dos mundos.</p></header>
        <Card className="vortex-card p-7 md:p-9"><div className="flex flex-col md:flex-row items-center md:items-start gap-6"><div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#caa85e]/45 bg-[#caa85e]/10 text-[#caa85e]"><UserRound className="h-10 w-10" /></div><div className="text-center md:text-left"><p className="eyebrow">Guardião da Biblioteca</p><h2 className="mt-1 text-4xl font-serif">Leitor Vortex</h2><p className="mt-2 max-w-xl text-muted-foreground">Uma biblioteca pessoal para manter próximas as histórias que ainda têm algo a revelar.</p></div></div><div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3"><div className="rounded-lg border border-border/50 bg-background/30 p-4"><p className="text-2xl font-serif">{books.length}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Livros</p></div><div className="rounded-lg border border-border/50 bg-background/30 p-4"><p className="text-2xl font-serif">{completed}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Concluídos</p></div><div className="rounded-lg border border-border/50 bg-background/30 p-4"><p className="text-2xl font-serif">{favorites}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Favoritos</p></div><div className="rounded-lg border border-border/50 bg-background/30 p-4"><p className="text-2xl font-serif">{storageService.getAchievements().length}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Conquistas</p></div></div></Card>
        <div className="grid gap-5 md:grid-cols-2"><Card className="vortex-card p-6"><div className="flex items-center gap-3"><Download className="h-5 w-5 text-primary" /><div><h2 className="text-3xl font-serif">Guardar biblioteca</h2><p className="mt-1 text-sm text-muted-foreground">Exporte seus tomos em JSON para manter uma cópia segura.</p></div></div><Button onClick={exportLibrary} className="mt-6"><Download className="h-4 w-4 mr-2" /> Exportar JSON</Button></Card><Card className="vortex-card p-6"><div className="flex items-center gap-3"><FileUp className="h-5 w-5 text-[#caa85e]" /><div><h2 className="text-3xl font-serif">Invocar biblioteca</h2><p className="mt-1 text-sm text-muted-foreground">Traga seus tomos de um arquivo vortex-library.json.</p></div></div><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importLibrary} /><Button variant="outline" onClick={() => fileRef.current?.click()} className="mt-6"><FileUp className="h-4 w-4 mr-2" /> Importar JSON</Button></Card></div>
        <Card className="vortex-card p-6 flex gap-4"><Shield className="h-5 w-5 text-[#caa85e] shrink-0" /><div><h2 className="text-xl font-serif">Seus dados, seu reino</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">A Vortex armazena sua biblioteca localmente neste dispositivo. Nenhum cadastro é necessário para começar.</p></div><Sparkles className="ml-auto h-5 w-5 text-primary shrink-0" /></Card>
      </div>
    </Layout>
  );
}
