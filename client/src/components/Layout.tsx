import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, BookOpen, Download, FolderPlus, Heart, Home, Menu, Moon, Sparkles, Sun, Target, Trophy, UserRound, WifiOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { VortexLogo } from './VortexLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';
import { storageService } from '@/services/storage';
import { scheduleReadingReminder } from '@/services/readingReminder';

interface LayoutProps { children: ReactNode; }
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>; };

const navigationItems = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Biblioteca', href: '/library', icon: BookOpen },
  { label: 'Coleções', href: '/collections', icon: FolderPlus },
  { label: 'Favoritos', href: '/favorites', icon: Heart },
  { label: 'Metas', href: '/goals', icon: Target },
  { label: 'Conquistas', href: '/achievements', icon: Trophy },
  { label: 'Estatísticas', href: '/stats', icon: BarChart3 },
  { label: 'Perfil', href: '/profile', icon: UserRound },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [profile, setProfile] = useState(() => storageService.getUserProfile());

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const updateStandalone = () => setIsStandalone(media.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleProfileUpdated = () => {
      setProfile(storageService.getUserProfile());
      scheduleReadingReminder();
    };
    const handleReminderUpdated = () => scheduleReadingReminder();
    const handleStreakUpdated = () => scheduleReadingReminder();
    updateStandalone();
    setIsOnline(navigator.onLine);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', () => { setDeferredPrompt(null); setIsStandalone(true); toast.success('Vortex instalada neste dispositivo.'); });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('vortex-profile-updated', handleProfileUpdated);
    window.addEventListener('vortex-reminder-updated', handleReminderUpdated);
    window.addEventListener('vortex-streak-updated', handleStreakUpdated);
    scheduleReadingReminder();
    media.addEventListener?.('change', updateStandalone);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('vortex-profile-updated', handleProfileUpdated);
      window.removeEventListener('vortex-reminder-updated', handleReminderUpdated);
      window.removeEventListener('vortex-streak-updated', handleStreakUpdated);
      media.removeEventListener?.('change', updateStandalone);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) {
      toast.info('Para instalar o app, clique no menu do seu navegador (⋮ ou Compartilhar) e selecione "Adicionar à Tela de Início" ou "Instalar aplicativo".', { duration: 6000 });
      return;
    }
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (result.outcome === 'accepted') toast.success('A Vortex está pronta para acompanhar suas leituras.');
  }

  return (
    <div className="vortex-shell flex h-screen overflow-hidden bg-background text-foreground">
      <aside className={`vortex-sidebar fixed md:relative z-40 w-[260px] h-screen bg-card border-r border-border/60 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/60">
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
              <VortexLogo size="md" className="text-[#caa85e] group-hover:text-primary transition-colors" />
              <div><h1 className="text-xl font-serif font-bold tracking-[.14em] text-[#caa85e]">VORTEX</h1><p className="text-[10px] uppercase tracking-[.17em] text-muted-foreground">Biblioteca Virtual</p></div>
            </Link>
          </div>
          <div className="px-6 pt-6 pb-3"><p className="eyebrow">Navegação</p></div>
          <nav className="flex-1 overflow-y-auto px-3"><ul className="space-y-1">{navigationItems.map(item => { const Icon = item.icon; return <li key={item.href}><Link href={item.href} onClick={() => setSidebarOpen(false)} data-active={location === item.href || (item.href !== '/' && location.startsWith(item.href)) ? 'true' : undefined} className="nav-link"><Icon className="h-[17px] w-[17px]" /> <span>{item.label}</span></Link></li>; })}</ul></nav>
          <div className="p-4 border-t border-border/60 space-y-3">
            {isOnline ? <div className="flex items-center gap-2 px-3 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-[#caa85e]" /> Outra história espera por você.</div> : <div className="offline-badge"><WifiOff className="h-3.5 w-3.5" /> Modo offline ativo</div>}
            {!isStandalone && <Button variant="outline" size="sm" onClick={installApp} className="w-full justify-start gap-2 border-[#caa85e]/35 text-[#caa85e]"><Download className="w-4 h-4" /> Instalar Vortex</Button>}
            {isStandalone && <div className="installed-badge"><Download className="h-3.5 w-3.5" /> Vortex instalada</div>}<p className="vortex-credit">Yurihbo <span>— Autor</span></p>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="theme-toggle-button w-full justify-start gap-2">{theme === 'dark' ? <><Sun className="w-4 h-4" /> Modo claro</> : <><Moon className="w-4 h-4" /> Modo escuro</>}</Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="vortex-header bg-background/90 backdrop-blur-md border-b border-border/60 px-4 py-3.5 md:px-8 flex items-center justify-between sticky top-0 z-20 pt-[max(0.875rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <button aria-label="Abrir menu" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 -ml-2 hover:bg-primary/10 rounded-lg transition-colors">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            <Link href="/profile" aria-label="Abrir perfil" className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#caa85e]/40 bg-card/80 hover:border-[#caa85e] transition-colors wand-click">
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-muted shrink-0">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" /> : <UserRound className="h-4 w-4 text-[#caa85e]" />}
              </div>
              <span className="text-xs font-serif font-medium text-foreground max-w-[120px] truncate">{profile.displayName || 'Leitor'}</span>
            </Link>
            <div className="md:hidden flex items-center gap-2"><VortexLogo size="sm" className="text-[#caa85e]" /><span className="font-serif text-lg tracking-widest text-[#caa85e]">VORTEX</span></div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">{isOnline ? <><Sparkles className="h-4 w-4 text-[#caa85e]" /> Bem-vindo à Vortex, {profile.displayName || 'Leitor'}</> : <><WifiOff className="h-4 w-4 text-[#caa85e]" /> Você está offline</>}</div>
          <div className="flex items-center gap-2">{deferredPrompt && !isStandalone && <Button variant="outline" size="sm" onClick={installApp} className="hidden sm:inline-flex border-[#caa85e]/35 text-[#caa85e]"><Download className="h-4 w-4 mr-2" /> Instalar app</Button>}<Link href="/add-book" className="header-add-button"><span className="text-lg leading-none">+</span><span className="hidden sm:inline">Adicionar tomo</span></Link></div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8"><div className="vortex-content container mx-auto py-6 md:py-8">{children}</div></main>
        <nav className="mobile-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-md border-t border-border/60 px-2 py-2"><div className="grid grid-cols-5 gap-1">{[{ label: 'Início', href: '/', icon: Home }, { label: 'Biblioteca', href: '/library', icon: BookOpen }, { label: 'Coleções', href: '/collections', icon: FolderPlus }, { label: 'Favoritos', href: '/favorites', icon: Heart }, { label: 'Perfil', href: '/profile', icon: UserRound }].map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="mobile-nav-item"><Icon className="h-4 w-4" /><span>{item.label}</span></Link>; })}</div></nav>
      </div>
    </div>
  );
}
