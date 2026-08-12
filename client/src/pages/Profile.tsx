import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { BookHeart, Camera, Clock3, Download, FileUp, ImagePlus, Save, Shield, Skull, Sparkles, Sword, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storageService } from '@/services/storage';
import { Book, UserProfile } from '@/types/book';

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Formato de imagem inválido.'));
      image.onload = () => {
        const size = 512;
        const scale = Math.min(size / image.width, size / image.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Seu navegador não permitiu preparar a imagem.'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function getFavoriteBook(books: Book[], selected: string) {
  return books.find(book => book.title === selected) || books.filter(book => book.status === 'completed').sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
}

export default function Profile() {
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const books = storageService.getBooks();
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [savedProfile, setSavedProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const completed = books.filter(book => book.status === 'completed').length;
  const favoriteBook = getFavoriteBook(books, savedProfile.favoriteBook);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile(current => ({ ...current, [key]: value }));
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5 MB.');
      return;
    }
    try {
      const avatarUrl = await compressAvatar(file);
      update('avatarUrl', avatarUrl);
      toast.success('Novo retrato preparado. Salve o perfil para fixá-lo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível preparar o retrato.');
    } finally {
      event.target.value = '';
    }
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile: UserProfile = {
      ...profile,
      displayName: profile.displayName.trim() || 'Leitor Vortex',
      bio: profile.bio.trim() || 'Uma biblioteca pessoal para manter próximas as histórias que ainda têm algo a revelar.',
      totalReadingHours: Math.max(0, Number(profile.totalReadingHours) || 0),
      favoriteBook: profile.favoriteBook.trim(),
      favoriteCharacter: profile.favoriteCharacter.trim(),
      favoriteVillain: profile.favoriteVillain.trim(),
    };
    storageService.saveUserProfile(nextProfile);
    setProfile(nextProfile);
    setSavedProfile(nextProfile);
    window.dispatchEvent(new Event('vortex-profile-updated'));
    toast.success('Seu retrato e suas preferências foram guardados.');
  }

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
      <div className="max-w-5xl space-y-7 animate-fade-in">
        <header><p className="eyebrow">Identidade do guardião</p><h1 className="text-5xl font-serif mt-2">Perfil</h1><p className="text-muted-foreground mt-2">Personalize o rosto, as memórias e as constelações da sua biblioteca.</p></header>

        <form onSubmit={saveProfile} className="space-y-6">
          <Card className="vortex-card profile-hero-card p-6 md:p-9">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              <div className="relative mx-auto md:mx-0">
                <div className="profile-avatar-frame">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt={`Foto de perfil de ${profile.displayName || 'Leitor Vortex'}`} /> : <UserRound className="h-14 w-14 text-[#caa85e]" />}
                </div>
                <button type="button" aria-label="Escolher foto de perfil" className="profile-avatar-trigger wand-click" onClick={() => avatarRef.current?.click()}><Camera className="h-4 w-4" /></button>
                <input ref={avatarRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleAvatarUpload} />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left"><p className="eyebrow">Seu retrato na Vortex</p><h2 className="mt-1 text-4xl font-serif">{savedProfile.displayName}</h2><p className="mt-2 max-w-2xl text-muted-foreground">{savedProfile.bio}</p><button type="button" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-[#caa85e] hover:text-primary transition-colors wand-click" onClick={() => avatarRef.current?.click()}><ImagePlus className="h-4 w-4" /> Trocar retrato</button></div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="profile-stat"><BookHeart className="h-4 w-4 text-primary" /><strong>{books.length}</strong><span>Livros na coleção</span></div><div className="profile-stat"><Sparkles className="h-4 w-4 text-[#caa85e]" /><strong>{completed}</strong><span>Livros já lidos</span></div><div className="profile-stat"><Clock3 className="h-4 w-4 text-primary" /><strong>{savedProfile.totalReadingHours}h</strong><span>Horas lidas</span></div><div className="profile-stat"><Shield className="h-4 w-4 text-[#caa85e]" /><strong>{storageService.getAchievements().length}</strong><span>Conquistas</span></div></div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="vortex-card p-6 md:p-7"><div className="mb-6"><p className="eyebrow">Pergaminho pessoal</p><h2 className="mt-1 text-3xl font-serif">Como você quer ser lembrado?</h2></div><div className="space-y-5"><div><label htmlFor="profile-name" className="field-label">Nome do guardião</label><Input id="profile-name" value={profile.displayName} onChange={event => update('displayName', event.target.value)} placeholder="Ex.: Yurihbo" /></div><div><label htmlFor="profile-bio" className="field-label">Pequena biografia</label><Textarea id="profile-bio" value={profile.bio} onChange={event => update('bio', event.target.value)} placeholder="Uma frase sobre sua jornada entre livros." rows={4} /></div><div><label htmlFor="reading-hours" className="field-label">Horas lidas no total</label><Input id="reading-hours" type="number" min="0" step="1" value={profile.totalReadingHours} onChange={event => update('totalReadingHours', Number(event.target.value))} placeholder="Ex.: 128" /></div></div></Card>
            <Card className="vortex-card p-6 md:p-7"><div className="mb-6"><p className="eyebrow">Constelações favoritas</p><h2 className="mt-1 text-3xl font-serif">O que vive nas suas histórias?</h2></div><div className="space-y-5"><div><label htmlFor="favorite-book" className="field-label"><BookHeart className="inline h-4 w-4 mr-1" /> Leitura favorita</label><Input id="favorite-book" list="vortex-book-list" value={profile.favoriteBook} onChange={event => update('favoriteBook', event.target.value)} placeholder="Ex.: Duna" /><datalist id="vortex-book-list">{books.map(book => <option key={book.id} value={book.title} />)}</datalist></div><div><label htmlFor="favorite-character" className="field-label"><Sword className="inline h-4 w-4 mr-1" /> Personagem favorito</label><Input id="favorite-character" value={profile.favoriteCharacter} onChange={event => update('favoriteCharacter', event.target.value)} placeholder="Ex.: Paul Atreides" /></div><div><label htmlFor="favorite-villain" className="field-label"><Skull className="inline h-4 w-4 mr-1" /> Vilão favorito</label><Input id="favorite-villain" value={profile.favoriteVillain} onChange={event => update('favoriteVillain', event.target.value)} placeholder="Ex.: Sauron" /></div></div></Card>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3"><Button type="submit" className="wand-click"><Save className="h-4 w-4 mr-2" /> Guardar perfil</Button></div>
        </form>

        <Card className="vortex-card p-6 md:p-7"><div className="mb-5"><p className="eyebrow">Registro de memórias</p><h2 className="mt-1 text-3xl font-serif">Suas escolhas em destaque</h2></div><div className="grid gap-3 md:grid-cols-3"><div className="preference-card"><BookHeart className="h-5 w-5 text-primary" /><span>Leitura favorita</span><strong>{favoriteBook?.title || 'Ainda não definida'}</strong></div><div className="preference-card"><Sword className="h-5 w-5 text-[#caa85e]" /><span>Personagem favorito</span><strong>{savedProfile.favoriteCharacter || 'Ainda não definido'}</strong></div><div className="preference-card"><Skull className="h-5 w-5 text-rose-300" /><span>Vilão favorito</span><strong>{savedProfile.favoriteVillain || 'Ainda não definido'}</strong></div></div></Card>

        <div className="grid gap-5 md:grid-cols-2"><Card className="vortex-card p-6"><div className="flex items-center gap-3"><Download className="h-5 w-5 text-primary" /><div><h2 className="text-3xl font-serif">Guardar biblioteca</h2><p className="mt-1 text-sm text-muted-foreground">Exporte seus tomos e preferências em JSON.</p></div></div><Button onClick={exportLibrary} className="mt-6 wand-click"><Download className="h-4 w-4 mr-2" /> Exportar JSON</Button></Card><Card className="vortex-card p-6"><div className="flex items-center gap-3"><FileUp className="h-5 w-5 text-[#caa85e]" /><div><h2 className="text-3xl font-serif">Invocar biblioteca</h2><p className="mt-1 text-sm text-muted-foreground">Traga seus tomos e seu perfil de um arquivo JSON.</p></div></div><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importLibrary} /><Button variant="outline" onClick={() => fileRef.current?.click()} className="mt-6 wand-click"><FileUp className="h-4 w-4 mr-2" /> Importar JSON</Button></Card></div>
        <Card className="vortex-card p-6 flex gap-4"><Shield className="h-5 w-5 text-[#caa85e] shrink-0" /><div><h2 className="text-xl font-serif">Seus dados, seu reino</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Tudo é armazenado localmente neste dispositivo. Sua foto e preferências permanecem sob seu controle.</p></div><Sparkles className="ml-auto h-5 w-5 text-primary shrink-0" /></Card>
      </div>
    </Layout>
  );
}
