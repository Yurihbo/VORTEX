import { ChangeEvent, FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Award, Bell, BellOff, BookHeart, BookMarked, CalendarDays, Camera, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Copy, Crown, Download, FileDown, FileUp, Flame, ImagePlus, Medal, Save, Share2, Shield, Skull, Sparkles, Sword, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { storageService } from '@/services/storage';
import { getNotificationPermission, requestReadingReminderPermission, scheduleReadingReminder } from '@/services/readingReminder';
import { STREAK_MILESTONES, streakProgress } from '@/lib/readingMilestones';
import { Book, ReadingReminderSettings, ReadingStreak, UserProfile } from '@/types/book';

const CROP_SIZE = 300;

type CropPosition = { x: number; y: number };
type MedalRule = { id: string; label: string; description: string; icon: typeof Medal; metric: 'books' | 'hours'; target: number; tone: string };

type CompanionOption = { id: string; label: string; role: string; description: string; symbol: string; reaction: string; styleClass: string; imageUrl: string };

const companionAsset = (fileName: string) => `${import.meta.env.BASE_URL}companions/${fileName}`;

const COMPANIONS: CompanionOption[] = [
  { id: 'owl', label: 'Coruja das Neves', role: 'Mensageira dos Tomos', description: 'A guardiã branca dos arquivos, com olhos âmbar e sabedoria para encontrar páginas esquecidas.', symbol: '🦉', reaction: '"As páginas sussurram uma nova mensagem."', styleClass: 'type-owl', imageUrl: companionAsset('coruja-das-neves.webp') },
  { id: 'dragon', label: 'Dragão Vermelho', role: 'Guardião das Chamas', description: 'O protetor rubro do acervo, envolto em runas de fogo e pronto para aquecer sua sequência.', symbol: '🐉', reaction: '"A chama da leitura arde em brasa!"', styleClass: 'type-dragon', imageUrl: companionAsset('dragao-vermelho.webp') },
  { id: 'fox', label: 'Raposa Patrono', role: 'Exploradora de Estantes', description: 'Um espírito azul-prateado que atravessa a névoa e revela atalhos entre suas coleções.', symbol: '🦊', reaction: '"Encontrei um tomo raro para ti."', styleClass: 'type-fox', imageUrl: companionAsset('raposa-patrono.webp') },
  { id: 'hippogriff', label: 'Hipogrifo', role: 'Sentinela dos Céus', description: 'A sentinela alada do santuário, nobre e vigilante sobre cada nova meta de leitura.', symbol: '🦅', reaction: '"Erga os olhos: há novas jornadas além das estantes."', styleClass: 'type-griffin', imageUrl: companionAsset('hippogrifo.webp') },
  { id: 'cat', label: 'Gatinha Tricolor', role: 'Musa dos Manuscritos', description: 'Uma guardiã de pelagem laranja, preta e branca que transforma cada sessão em aconchego.', symbol: '🐈', reaction: '"Ronrom... escolha uma história para aquecer a noite."', styleClass: 'type-cat', imageUrl: companionAsset('gatinha-tricolor.webp') },
];

const MEDAL_RULES: MedalRule[] = [
  { id: 'first-tome', label: 'Primeiro Selo', description: 'Conclua seu primeiro tomo.', icon: BookMarked, metric: 'books', target: 1, tone: 'gold' },
  { id: 'five-tomes', label: 'Guardião dos Cinco', description: 'Conclua cinco livros.', icon: Medal, metric: 'books', target: 5, tone: 'blue' },
  { id: 'ten-tomes', label: 'Arquivista', description: 'Conclua dez livros.', icon: Award, metric: 'books', target: 10, tone: 'violet' },
  { id: 'twenty-five-tomes', label: 'Biblioteca Viva', description: 'Conclua vinte e cinco livros.', icon: Crown, metric: 'books', target: 25, tone: 'gold' },
  { id: 'first-hours', label: 'Primeira Centelha', description: 'Alcance dez horas de leitura.', icon: Sparkles, metric: 'hours', target: 10, tone: 'blue' },
  { id: 'fifty-hours', label: 'Sentinela do Tempo', description: 'Alcance cinquenta horas de leitura.', icon: Clock3, metric: 'hours', target: 50, tone: 'violet' },
  { id: 'hundred-hours', label: 'Cronista', description: 'Alcance cem horas de leitura.', icon: BookHeart, metric: 'hours', target: 100, tone: 'gold' },
  { id: 'two-fifty-hours', label: 'Mestre do Vortex', description: 'Alcance duzentas e cinquenta horas de leitura.', icon: Crown, metric: 'hours', target: 250, tone: 'blue' },
];

function compressCanvas(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.84);
}

function createCroppedAvatar(sourceUrl: string, zoom: number, position: CropPosition): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('Não foi possível preparar este retrato.'));
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Seu navegador não permitiu preparar a imagem.'));
        return;
      }
      const baseScale = Math.max(CROP_SIZE / image.width, CROP_SIZE / image.height);
      const scale = baseScale * zoom * (512 / CROP_SIZE);
      const width = image.width * scale;
      const height = image.height * scale;
      const offsetX = (512 - width) / 2 + position.x * (512 / CROP_SIZE);
      const offsetY = (512 - height) / 2 + position.y * (512 / CROP_SIZE);
      context.fillStyle = '#111827';
      context.fillRect(0, 0, 512, 512);
      context.drawImage(image, offsetX, offsetY, width, height);
      resolve(compressCanvas(canvas));
    };
    image.src = sourceUrl;
  });
}

function getFavoriteBook(books: Book[], selected: string) {
  return books.find(book => book.title === selected) || books.filter(book => book.status === 'completed').sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
}

function medalProgress(rule: MedalRule, booksRead: number, hoursRead: number) {
  const current = rule.metric === 'books' ? booksRead : hoursRead;
  return { current, percentage: Math.min(100, Math.round((current / rule.target) * 100)), unlocked: current >= rule.target };
}

function normalizeCompanionNames(names?: Record<string, string>): Record<string, string> {
  return Object.fromEntries(COMPANIONS.map(companion => {
    const customName = names?.[companion.id]?.trim().slice(0, 32) || companion.label;
    return [companion.id, customName];
  }));
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível preparar o cartão.')), 'image/png'));
}

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthCells(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const total = Math.ceil((offset + count) / 7) * 7;
  return Array.from({ length: total }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1));
}

function drawAchievementCard(profile: UserProfile, booksRead: number, hoursRead: number, streak: ReadingStreak, unlockedMedals: number, unlockedStreakMedals: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Seu navegador não permitiu criar o cartão.'));
      return;
    }
    const gradient = context.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#0b1224');
    gradient.addColorStop(0.58, '#15213b');
    gradient.addColorStop(1, '#070b16');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#caa85e';
    context.lineWidth = 2;
    context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
    context.strokeStyle = 'rgba(202,168,94,.42)';
    context.lineWidth = 1;
    context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
    context.fillStyle = '#caa85e';
    context.font = '700 18px Arial';
    context.letterSpacing = '4px';
    context.fillText('VORTEX · CARTÃO DE CONQUISTAS', 78, 92);
    context.fillStyle = '#f2e4bd';
    context.font = '700 58px Georgia';
    context.fillText(profile.displayName || 'Leitor Vortex', 78, 172);
    context.fillStyle = 'rgba(242,228,189,.72)';
    context.font = '24px Arial';
    context.fillText('Minha jornada entre tomos e constelações', 82, 212);
    context.fillStyle = '#caa85e';
    context.font = '700 21px Arial';
    context.fillText(`${unlockedMedals + unlockedStreakMedals} MEDALHAS DESBLOQUEADAS`, 82, 290);
    context.fillStyle = '#f2e4bd';
    context.font = '700 32px Georgia';
    context.fillText(`${booksRead} livros lidos`, 82, 352);
    context.fillText(`${hoursRead} horas de leitura`, 82, 410);
    context.fillText(`${streak.currentStreak} dias de sequência`, 82, 468);
    context.fillStyle = 'rgba(242,228,189,.66)';
    context.font = '20px Arial';
    context.fillText(`Melhor chama: ${streak.bestStreak} dias`, 82, 520);
    context.fillStyle = 'rgba(202,168,94,.18)';
    context.beginPath();
    context.arc(982, 314, 148, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = 'rgba(202,168,94,.7)';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(982, 314, 112, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = '#caa85e';
    context.font = '110px Georgia';
    context.textAlign = 'center';
    context.fillText('✦', 982, 350);
    context.textAlign = 'left';
    context.fillStyle = 'rgba(242,228,189,.55)';
    context.font = '16px Arial';
    context.fillText('biblioteca pessoal', 918, 510);
    canvasToBlob(canvas).then(resolve).catch(reject);
  });
}

export default function Profile() {
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const books = storageService.getBooks();
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [savedProfile, setSavedProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [streak, setStreak] = useState<ReadingStreak>(() => storageService.getReadingStreak());
  const [reminderSettings, setReminderSettings] = useState<ReadingReminderSettings>(() => storageService.getReadingReminderSettings());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => getNotificationPermission());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPosition, setCropPosition] = useState<CropPosition>({ x: 0, y: 0 });
  const completed = books.filter(book => book.status === 'completed').length;
  const favoriteBook = getFavoriteBook(books, savedProfile.favoriteBook);
  const unlockedMedals = MEDAL_RULES.filter(rule => medalProgress(rule, completed, savedProfile.totalReadingHours).unlocked).length;
  const unlockedStreakMedals = STREAK_MILESTONES.filter(rule => streakProgress(rule, streak.currentStreak, streak.bestStreak).unlocked).length;
  const nextMedal = MEDAL_RULES.find(rule => !medalProgress(rule, completed, savedProfile.totalReadingHours).unlocked);
  const readingDateSet = useMemo(() => new Set(streak.readingDates || []), [streak.readingDates]);
  const calendarDays = useMemo(() => monthCells(calendarMonth), [calendarMonth]);
  const favoriteRegularMedal = MEDAL_RULES.find(rule => rule.id === savedProfile.favoriteMedalId && medalProgress(rule, completed, savedProfile.totalReadingHours).unlocked);
  const favoriteStreakMedal = STREAK_MILESTONES.find(rule => rule.id === savedProfile.favoriteMedalId && streakProgress(rule, streak.currentStreak, streak.bestStreak).unlocked);
  const FavoriteMedalIcon = favoriteRegularMedal?.icon;
  const selectedCompanion = COMPANIONS.find(companion => companion.id === (profile.companionId || 'owl')) || COMPANIONS[0];
  const selectedCompanionName = profile.companionNames?.[selectedCompanion.id]?.trim() || selectedCompanion.label;

  useEffect(() => {
    const refreshStreak = () => setStreak(storageService.getReadingStreak());
    window.addEventListener('vortex-streak-updated', refreshStreak);
    return () => window.removeEventListener('vortex-streak-updated', refreshStreak);
  }, []);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile(current => ({ ...current, [key]: value }));
  }

  function updateCompanionName(id: string, value: string) {
    setProfile(current => ({ ...current, companionNames: { ...current.companionNames, [id]: value.slice(0, 32) } }));
  }

  function persistReminderSettings(next: ReadingReminderSettings) {
    storageService.saveReadingReminderSettings(next);
    setReminderSettings(next);
    scheduleReadingReminder();
    window.dispatchEvent(new Event('vortex-reminder-updated'));
  }

  async function toggleReadingReminder() {
    if (reminderSettings.enabled) {
      persistReminderSettings({ ...reminderSettings, enabled: false });
      toast.success('O lembrete diário foi silenciado.');
      return;
    }
    const permission = await requestReadingReminderPermission();
    setNotificationPermission(permission);
    if (permission !== 'granted') {
      toast.error(permission === 'denied' ? 'As notificações estão bloqueadas nas configurações do navegador.' : 'Este navegador não oferece notificações locais.');
      return;
    }
    persistReminderSettings({ ...reminderSettings, enabled: true });
    toast.success(`Lembrete ativado para ${reminderSettings.time}.`);
  }

  function updateReminderTime(time: string) {
    const next = { ...reminderSettings, time };
    setReminderSettings(next);
    storageService.saveReadingReminderSettings(next);
    scheduleReadingReminder();
    window.dispatchEvent(new Event('vortex-reminder-updated'));
  }

  function chooseFavoriteMedal(id: string) {
    const regular = MEDAL_RULES.find(rule => rule.id === id);
    const streakRule = STREAK_MILESTONES.find(rule => rule.id === id);
    const unlocked = regular ? medalProgress(regular, completed, savedProfile.totalReadingHours).unlocked : Boolean(streakRule && streakProgress(streakRule, streak.currentStreak, streak.bestStreak).unlocked);
    if (!unlocked) {
      toast.info('Desbloqueie esta medalha antes de destacá-la no seu retrato.');
      return;
    }
    const nextProfile = { ...profile, favoriteMedalId: id };
    storageService.saveUserProfile(nextProfile);
    setProfile(nextProfile);
    setSavedProfile(nextProfile);
    window.dispatchEvent(new Event('vortex-profile-updated'));
    toast.success('Medalha favorita destacada ao lado do seu retrato.');
  }

  function moveCalendarMonth(delta: number) {
    setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function openAvatarPicker() {
    avatarRef.current?.click();
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem válido.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 8 MB.');
      event.target.value = '';
      return;
    }
    const sourceUrl = URL.createObjectURL(file);
    setCropSource(sourceUrl);
    setCropZoom(1);
    setCropPosition({ x: 0, y: 0 });
    event.target.value = '';
  }

  function cancelCrop() {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
  }

  async function confirmCrop() {
    if (!cropSource) return;
    try {
      const avatarUrl = await createCroppedAvatar(cropSource, cropZoom, cropPosition);
      update('avatarUrl', avatarUrl);
      URL.revokeObjectURL(cropSource);
      setCropSource(null);
      toast.success('Recorte preparado. Salve o perfil para fixar o retrato.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível recortar o retrato.');
    }
  }

  function handleCropPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, originX: cropPosition.x, originY: cropPosition.y };
  }

  function handleCropPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    setCropPosition({
      x: dragRef.current.originX + event.clientX - dragRef.current.startX,
      y: dragRef.current.originY + event.clientY - dragRef.current.startY,
    });
  }

  function handleCropPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
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
      companionNames: normalizeCompanionNames(profile.companionNames),
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

  async function shareAchievements() {
    const shareText = `${savedProfile.displayName || 'Leitor Vortex'} conquistou ${unlockedMedals + unlockedStreakMedals} medalhas na Vortex, com ${completed} livros lidos e uma sequência atual de ${streak.currentStreak} dias.`;
    try {
      const blob = await drawAchievementCard(savedProfile, completed, savedProfile.totalReadingHours, streak, unlockedMedals, unlockedStreakMedals);
      const file = new File([blob], 'vortex-cartao-conquistas.png', { type: 'image/png' });
      if (navigator.share) {
        const canShareFile = !navigator.canShare || navigator.canShare({ files: [file] });
        if (canShareFile) {
          await navigator.share({ title: 'Meu cartão de conquistas Vortex', text: shareText, files: [file] });
        } else {
          await navigator.share({ title: 'Meu cartão de conquistas Vortex', text: shareText });
        }
        toast.success('Seu cartão foi preparado para compartilhar.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Cartão baixado e resumo copiado para a área de transferência.');
      } catch {
        toast.success('Cartão de conquistas baixado.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error(error instanceof Error ? error.message : 'Não foi possível preparar o cartão.');
    }
  }

  async function copyAchievementText() {
    const text = `${savedProfile.displayName || 'Leitor Vortex'} · ${unlockedMedals + unlockedStreakMedals} medalhas · ${completed} livros lidos · ${streak.currentStreak} dias de sequência.`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Resumo das conquistas copiado.');
    } catch {
      toast.error('O navegador não permitiu copiar o resumo.');
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl space-y-7 animate-fade-in">
        <header><p className="eyebrow">Identidade do guardião</p><h1 className="text-5xl font-serif mt-2">Perfil</h1><p className="text-muted-foreground mt-2">Personalize o rosto, as memórias e as constelações da sua biblioteca.</p></header>

        <form onSubmit={saveProfile} className="space-y-6">
          <Card className="vortex-card profile-hero-card p-6 md:p-9">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              <div className="relative mx-auto md:mx-0">
                <div className="profile-avatar-frame flex items-center justify-center bg-muted/40">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt={`Foto de perfil de ${profile.displayName || 'Leitor Vortex'}`} className="w-full h-full object-cover" /> : <UserRound className="h-16 w-16 text-[#caa85e]" />}
                </div>
                <button type="button" aria-label="Escolher foto de perfil" className="profile-avatar-trigger wand-click" onClick={openAvatarPicker}><Camera className="h-4 w-4" /></button>
                <input ref={avatarRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleAvatarUpload} />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left"><p className="eyebrow">Seu retrato na Vortex</p><h2 className="mt-1 text-4xl font-serif">{savedProfile.displayName}</h2><p className="mt-2 max-w-2xl text-muted-foreground">{savedProfile.bio}</p><button type="button" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-[#caa85e] hover:text-primary transition-colors wand-click" onClick={openAvatarPicker}><ImagePlus className="h-4 w-4" /> Recortar e ajustar retrato</button></div>
              <div className="flex items-center gap-4 justify-center md:justify-end">
                <div className="companion-3d-stage relative" tabIndex={0} aria-label={`Companheiro ${selectedCompanionName}`} title={`Guardião: ${selectedCompanionName}`}>
                  <div className={`companion-3d-orb ${selectedCompanion.styleClass} overflow-hidden flex items-center justify-center p-1`}>
                    <img src={selectedCompanion.imageUrl} alt={`${selectedCompanionName}, ${selectedCompanion.role}`} className="companion-3d-image w-full h-full object-cover rounded-full drop-shadow-md" />
                    <span className="companion-3d-glint" aria-hidden="true" />
                  </div>
                  <div className="companion-stage-caption"><span>{selectedCompanion.role}</span><strong>{selectedCompanionName}</strong></div>
                  <div className="companion-speech-bubble">{selectedCompanion.reaction}</div>
                </div>
                {(favoriteRegularMedal || favoriteStreakMedal) && (
                  <div className="favorite-medal-highlight" title="Medalha favorita">
                    <div className="favorite-medal-icon">
                      {FavoriteMedalIcon ? <FavoriteMedalIcon className="h-7 w-7" /> : <span>{favoriteStreakMedal?.icon}</span>}
                    </div>
                    <span className="favorite-medal-label">{favoriteRegularMedal?.label || favoriteStreakMedal?.label}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="profile-stat"><BookHeart className="h-4 w-4 text-primary" /><strong>{books.length}</strong><span>Livros na coleção</span></div><div className="profile-stat"><Sparkles className="h-4 w-4 text-[#caa85e]" /><strong>{completed}</strong><span>Livros já lidos</span></div><div className="profile-stat"><Clock3 className="h-4 w-4 text-primary" /><strong>{savedProfile.totalReadingHours}h</strong><span>Horas lidas</span></div><div className="profile-stat"><Shield className="h-4 w-4 text-[#caa85e]" /><strong>{unlockedMedals}</strong><span>Medalhas</span></div></div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Card className="vortex-card p-6 md:p-7"><div className="mb-6"><p className="eyebrow">Pergaminho pessoal</p><h2 className="mt-1 text-3xl font-serif">Como você quer ser lembrado?</h2></div><div className="space-y-5"><div><label htmlFor="profile-name" className="field-label">Nome do guardião</label><Input id="profile-name" value={profile.displayName} onChange={event => update('displayName', event.target.value)} placeholder="Ex.: Yurihbo" /></div><div><label htmlFor="profile-bio" className="field-label">Pequena biografia</label><Textarea id="profile-bio" value={profile.bio} onChange={event => update('bio', event.target.value)} placeholder="Uma frase sobre sua jornada entre livros." rows={4} /></div><div><label htmlFor="reading-hours" className="field-label">Horas lidas no total</label><Input id="reading-hours" type="number" min="0" step="1" value={profile.totalReadingHours} onChange={event => update('totalReadingHours', Number(event.target.value))} placeholder="Ex.: 128" /></div></div></Card>
            <Card className="vortex-card p-6 md:p-7"><div className="mb-6"><p className="eyebrow">Constelações favoritas</p><h2 className="mt-1 text-3xl font-serif">O que vive nas suas histórias?</h2></div><div className="space-y-5"><div><label htmlFor="favorite-book" className="field-label"><BookHeart className="inline h-4 w-4 mr-1" /> Leitura favorita</label><Input id="favorite-book" list="vortex-book-list" value={profile.favoriteBook} onChange={event => update('favoriteBook', event.target.value)} placeholder="Ex.: Duna" /><datalist id="vortex-book-list">{books.map(book => <option key={book.id} value={book.title} />)}</datalist></div><div><label htmlFor="favorite-character" className="field-label"><Sword className="inline h-4 w-4 mr-1" /> Personagem favorito</label><Input id="favorite-character" value={profile.favoriteCharacter} onChange={event => update('favoriteCharacter', event.target.value)} placeholder="Ex.: Paul Atreides" /></div><div><label htmlFor="favorite-villain" className="field-label"><Skull className="inline h-4 w-4 mr-1" /> Vilão favorito</label><Input id="favorite-villain" value={profile.favoriteVillain} onChange={event => update('favoriteVillain', event.target.value)} placeholder="Ex.: Sauron" /></div></div></Card>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3"><Button type="submit" className="wand-click"><Save className="h-4 w-4 mr-2" /> Guardar perfil</Button></div>
        </form>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="vortex-card p-6 md:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Mapa de leitura</p><h2 className="mt-1 flex items-center gap-2 text-3xl font-serif"><CalendarDays className="h-6 w-6 text-[#caa85e]" /> Calendário da chama</h2><p className="mt-2 text-sm text-muted-foreground">Veja os dias exatos em que você registrou leitura.</p></div><div className="calendar-month-controls"><button type="button" className="calendar-nav-button wand-click" aria-label="Mês anterior" onClick={() => moveCalendarMonth(-1)}><ChevronLeft className="h-4 w-4" /></button><span>{calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span><button type="button" className="calendar-nav-button wand-click" aria-label="Próximo mês" onClick={() => moveCalendarMonth(1)}><ChevronRight className="h-4 w-4" /></button></div></div><div className="reading-calendar-grid mt-6">{WEEKDAY_LABELS.map(day => <span key={day} className="calendar-weekday">{day}</span>)}{calendarDays.map(day => { const key = formatDateKey(day); const isCurrentMonth = day.getMonth() === calendarMonth.getMonth(); const isRead = readingDateSet.has(key); const isToday = key === formatDateKey(new Date()); return <span key={key} className={`calendar-day ${isCurrentMonth ? '' : 'is-outside'} ${isRead ? 'is-read' : ''} ${isToday ? 'is-today' : ''}`} title={isRead ? `Leitura registrada em ${day.toLocaleDateString('pt-BR')}` : day.toLocaleDateString('pt-BR')}>{day.getDate()}</span>; })}</div><div className="calendar-legend"><span><i className="calendar-legend-dot is-read" /> Dia lido</span><span><i className="calendar-legend-dot is-today" /> Hoje</span><strong>{streak.readingDates?.length || 0} dias registrados</strong></div></Card>

          <Card className="vortex-card p-6 md:p-7"><div className="mb-6"><p className="eyebrow">Compromisso diário</p><h2 className="mt-1 flex items-center gap-2 text-3xl font-serif"><Bell className="h-6 w-6 text-[#caa85e]" /> Lembrete de leitura</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Receba um lembrete local para proteger sua sequência antes que o dia termine.</p></div><div className="reminder-panel"><div className="flex items-center justify-between gap-4"><div><span className="field-label">Estado do lembrete</span><p className="mt-1 text-sm text-muted-foreground">{reminderSettings.enabled ? `Ativo todos os dias às ${reminderSettings.time}` : 'Desativado até você escolher ativá-lo.'}</p></div><button type="button" className={`reminder-toggle ${reminderSettings.enabled ? 'is-on' : ''}`} aria-pressed={reminderSettings.enabled} onClick={toggleReadingReminder}>{reminderSettings.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}<span>{reminderSettings.enabled ? 'Ativo' : 'Ativar'}</span></button></div><div className="mt-5 flex items-center justify-between gap-4"><label htmlFor="reading-reminder-time" className="field-label">Horário diário</label><Input id="reading-reminder-time" type="time" value={reminderSettings.time} onChange={event => updateReminderTime(event.target.value)} className="max-w-[132px]" /></div><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#caa85e]" />{notificationPermission === 'granted' ? 'Permissão concedida. Ao instalar a Vortex, o lembrete pode continuar acompanhando sua jornada.' : notificationPermission === 'denied' ? 'Notificações bloqueadas. Libere-as nas configurações do navegador para ativar.' : 'Ao ativar, o navegador pedirá permissão para enviar lembretes locais.'}</p></div></Card>
        </div>

        <Card className="vortex-card p-6 md:p-7"><div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Salão das medalhas</p><h2 className="mt-1 text-3xl font-serif">Marcos da sua jornada</h2><p className="mt-2 text-sm text-muted-foreground">Cada medalha é calculada pelos livros concluídos, pelas horas registradas e pela constância da sua chama.</p></div><div className="medal-counter"><Medal className="h-4 w-4" /> {unlockedMedals + unlockedStreakMedals}/{MEDAL_RULES.length + STREAK_MILESTONES.length} desbloqueadas</div></div><div className="medal-grid">{MEDAL_RULES.map(rule => { const progress = medalProgress(rule, completed, savedProfile.totalReadingHours); const Icon = rule.icon; return <div key={rule.id} className={`medal-card ${progress.unlocked ? 'is-unlocked' : ''} tone-${rule.tone}`}><div className="medal-icon"><Icon className="h-6 w-6" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-serif text-xl leading-none">{rule.label}</h3><p className="mt-1 text-xs text-muted-foreground">{rule.description}</p></div>{progress.unlocked && <span className="medal-status">Conquistada</span>}</div><div className="medal-progress" aria-label={`${progress.current} de ${rule.target} ${rule.metric === 'books' ? 'livros' : 'horas'}`}><span style={{ width: `${progress.percentage}%` }} /></div><div className="mt-1 flex justify-between text-[.65rem] uppercase tracking-[.1em] text-muted-foreground"><span>{progress.current} {rule.metric === 'books' ? 'livros' : 'horas'}</span><span>{rule.target} {rule.metric === 'books' ? 'livros' : 'horas'}</span></div><button type="button" disabled={!progress.unlocked} onClick={() => chooseFavoriteMedal(rule.id)} className={`medal-favorite-button ${savedProfile.favoriteMedalId === rule.id ? 'is-favorite' : ''}`}><Check className="h-3 w-3" /> {savedProfile.favoriteMedalId === rule.id ? 'Favorita' : progress.unlocked ? 'Destacar' : 'Bloqueada'}</button></div></div>; })}</div>{nextMedal && <div className="next-medal-note"><Sparkles className="h-4 w-4 text-[#caa85e]" /><span>Próximo marco: <strong>{nextMedal.label}</strong> — faltam {Math.max(0, nextMedal.target - (nextMedal.metric === 'books' ? completed : savedProfile.totalReadingHours))} {nextMedal.metric === 'books' ? 'livros' : 'horas'}.</span></div>}<div className="streak-medal-section"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Medalhas de constância</p><h3 className="mt-1 text-2xl font-serif">A chama da leitura</h3><p className="mt-1 text-sm text-muted-foreground">Sequência atual: {streak.currentStreak} dias · melhor marca: {streak.bestStreak} dias.</p></div><div className="streak-flame"><Flame className="h-4 w-4" /> {unlockedStreakMedals}/{STREAK_MILESTONES.length}</div></div><div className="medal-grid mt-4">{STREAK_MILESTONES.map(rule => { const progress = streakProgress(rule, streak.currentStreak, streak.bestStreak); return <div key={rule.id} className={`medal-card ${progress.unlocked ? 'is-unlocked' : ''} tone-${rule.tone}`}><div className="medal-icon streak-medal-symbol">{rule.icon}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h4 className="font-serif text-xl leading-none">{rule.label}</h4><p className="mt-1 text-xs text-muted-foreground">{rule.description}</p></div>{progress.unlocked && <span className="medal-status">Conquistada</span>}</div><div className="medal-progress" aria-label={`${progress.best} de ${rule.days} dias`}><span style={{ width: `${progress.percentage}%` }} /></div><div className="mt-1 flex justify-between text-[.65rem] uppercase tracking-[.1em] text-muted-foreground"><span>Melhor: {progress.best}</span><span>Meta: {rule.days}</span></div><button type="button" disabled={!progress.unlocked} onClick={() => chooseFavoriteMedal(rule.id)} className={`medal-favorite-button ${savedProfile.favoriteMedalId === rule.id ? 'is-favorite' : ''}`}><Check className="h-3 w-3" /> {savedProfile.favoriteMedalId === rule.id ? 'Favorita' : progress.unlocked ? 'Destacar' : 'Bloqueada'}</button></div></div>; })}</div></div></Card>

        <Card className="vortex-card achievement-share-card p-6 md:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow">Cartão de conquistas</p><h2 className="mt-1 text-3xl font-serif">Leve sua jornada para além da biblioteca</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Gere uma imagem com seus marcos, medalhas e sequência para compartilhar nas redes sociais.</p></div><div className="achievement-share-mark"><Medal className="h-8 w-8" /><span>{unlockedMedals + unlockedStreakMedals}</span></div></div><div className="achievement-share-preview"><div><span className="share-preview-label">VORTEX · CONQUISTAS</span><strong>{savedProfile.displayName || 'Leitor Vortex'}</strong><p>{completed} livros · {savedProfile.totalReadingHours}h · {streak.currentStreak} dias de chama</p></div><div className="share-preview-glyph">✦</div></div><div className="flex flex-wrap gap-3"><Button type="button" className="wand-click" onClick={shareAchievements}><Share2 className="mr-2 h-4 w-4" /> Compartilhar cartão</Button><Button type="button" variant="outline" className="wand-click" onClick={copyAchievementText}><Copy className="mr-2 h-4 w-4" /> Copiar resumo</Button><p className="flex basis-full items-center gap-2 text-xs text-muted-foreground"><FileDown className="h-3.5 w-3.5" /> Em computadores sem compartilhamento nativo, o cartão PNG é baixado automaticamente.</p></div></Card>

        <Card className="vortex-card p-6 md:p-7">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Guardião simbólico</p>
              <h2 className="mt-1 text-3xl font-serif">Seu companheiro na biblioteca</h2>
              <p className="mt-2 text-sm text-muted-foreground">Escolha a criatura arcana que acompanhará sua jornada e testemunhará suas leituras.</p>
            </div>
            <div className="companion-badge-pill">
              <img src={selectedCompanion.imageUrl} alt="" className="companion-badge-image" />
              <span>{selectedCompanionName}</span>
            </div>
          </div>
          <div className="companion-grid">
            {COMPANIONS.map(comp => {
              const selected = (profile.companionId || 'owl') === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => update('companionId', comp.id)}
                  className={`companion-card wand-click ${selected ? 'is-selected' : ''}`}
                >
                  <div className="companion-icon-box"><img src={comp.imageUrl} alt="" className="companion-picker-image" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-serif text-lg leading-tight">{comp.label}</h3>
                      {selected && <Check className="h-4 w-4 text-[#caa85e] shrink-0" />}
                    </div>
                    <p className="mt-0.5 text-xs text-[#caa85e] font-medium">{comp.role}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{comp.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="companion-name-editor">
            <div>
              <p className="eyebrow">Nome do guardião</p>
              <p className="mt-1 text-sm text-muted-foreground">O nome padrão é <strong>{selectedCompanion.label}</strong>. Você pode criar um nome próprio para este companheiro.</p>
            </div>
            <Input id="companion-name" value={profile.companionNames?.[selectedCompanion.id] ?? selectedCompanion.label} maxLength={32} onChange={event => updateCompanionName(selectedCompanion.id, event.target.value)} placeholder={selectedCompanion.label} aria-label={`Nome personalizado de ${selectedCompanion.label}`} />
          </div>
        </Card>

        <Card className="vortex-card p-6 md:p-7"><div className="mb-5"><p className="eyebrow">Registro de memórias</p><h2 className="mt-1 text-3xl font-serif">Suas escolhas em destaque</h2></div><div className="grid gap-3 md:grid-cols-3"><div className="preference-card"><BookHeart className="h-5 w-5 text-primary" /><span>Leitura favorita</span><strong>{favoriteBook?.title || 'Ainda não definida'}</strong></div><div className="preference-card"><Sword className="h-5 w-5 text-[#caa85e]" /><span>Personagem favorito</span><strong>{savedProfile.favoriteCharacter || 'Ainda não definido'}</strong></div><div className="preference-card"><Skull className="h-5 w-5 text-rose-300" /><span>Vilão favorito</span><strong>{savedProfile.favoriteVillain || 'Ainda não definido'}</strong></div></div></Card>

        <div className="grid gap-5 md:grid-cols-2"><Card className="vortex-card p-6"><div className="flex items-center gap-3"><Download className="h-5 w-5 text-primary" /><div><h2 className="text-3xl font-serif">Guardar biblioteca</h2><p className="mt-1 text-sm text-muted-foreground">Exporte seus tomos e preferências em JSON.</p></div></div><Button onClick={exportLibrary} className="mt-6 wand-click"><Download className="h-4 w-4 mr-2" /> Exportar JSON</Button></Card><Card className="vortex-card p-6"><div className="flex items-center gap-3"><FileUp className="h-5 w-5 text-[#caa85e]" /><div><h2 className="text-3xl font-serif">Invocar biblioteca</h2><p className="mt-1 text-sm text-muted-foreground">Traga seus tomos e seu perfil de um arquivo JSON.</p></div></div><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importLibrary} /><Button variant="outline" onClick={() => fileRef.current?.click()} className="mt-6 wand-click"><FileUp className="h-4 w-4 mr-2" /> Importar JSON</Button></Card></div>
        <Card className="vortex-card p-6 flex gap-4"><Shield className="h-5 w-5 text-[#caa85e] shrink-0" /><div><h2 className="text-xl font-serif">Seus dados, seu reino</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Tudo é armazenado localmente neste dispositivo. Sua foto e preferências permanecem sob seu controle.</p></div><Sparkles className="ml-auto h-5 w-5 text-primary shrink-0" /></Card>
      </div>

      {cropSource && <div className="crop-modal-backdrop" role="presentation"><section className="crop-modal" role="dialog" aria-modal="true" aria-labelledby="crop-title"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Ateliê do retrato</p><h2 id="crop-title" className="mt-1 text-3xl font-serif">Recorte e ajuste</h2><p className="mt-2 text-sm text-muted-foreground">Arraste a imagem para enquadrar e use o controle para aproximar.</p></div><button type="button" className="crop-close wand-click" aria-label="Cancelar edição da foto" onClick={cancelCrop}><X className="h-5 w-5" /></button></div><div className="crop-stage" onPointerDown={handleCropPointerDown} onPointerMove={handleCropPointerMove} onPointerUp={handleCropPointerUp} onPointerCancel={handleCropPointerUp} role="application" aria-label="Área de recorte arrastável"><img src={cropSource} alt="Pré-visualização do recorte da foto" draggable="false" style={{ transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropZoom})` }} /><span className="crop-stage-rune">ᛟ</span></div><div className="crop-controls"><label htmlFor="crop-zoom" className="field-label"><span className="flex items-center justify-between"><span>Zoom</span><strong>{cropZoom.toFixed(1)}×</strong></span><input id="crop-zoom" type="range" min="1" max="2.5" step="0.05" value={cropZoom} onChange={event => setCropZoom(Number(event.target.value))} /></label></div><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={cancelCrop}>Cancelar</Button><Button type="button" className="wand-click" onClick={confirmCrop}><ImagePlus className="h-4 w-4 mr-2" /> Usar este recorte</Button></div></section></div>}
    </Layout>
  );
}
