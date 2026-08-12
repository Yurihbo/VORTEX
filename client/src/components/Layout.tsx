import { ReactNode, useState } from 'react';
import { Link } from 'wouter';
import { BookOpen, Flame, Heart, Home, Menu, Moon, Sparkles, Sun, Target, Trophy, UserRound, X, BarChart3 } from 'lucide-react';
import { VortexLogo } from './VortexLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';

interface LayoutProps { children: ReactNode; }

const navigationItems = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Biblioteca', href: '/library', icon: BookOpen },
  { label: 'Em leitura', href: '/reading', icon: Flame },
  { label: 'Favoritos', href: '/favorites', icon: Heart },
  { label: 'Metas', href: '/goals', icon: Target },
  { label: 'Conquistas', href: '/achievements', icon: Trophy },
  { label: 'Estatísticas', href: '/stats', icon: BarChart3 },
  { label: 'Perfil', href: '/profile', icon: UserRound },
];

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
          <nav className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-1">{navigationItems.map(item => { const Icon = item.icon; return <li key={item.href}><Link href={item.href} onClick={() => setSidebarOpen(false)} className="nav-link"><Icon className="h-[17px] w-[17px]" /> <span>{item.label}</span></Link></li>; })}</ul>
          </nav>
          <div className="p-4 border-t border-border/60 space-y-3"><div className="flex items-center gap-2 px-3 text-xs text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-[#caa85e]" /> Outra história espera por você.</div><Button variant="outline" size="sm" onClick={toggleTheme} className="w-full justify-start gap-2">{theme === 'dark' ? <><Sun className="w-4 h-4" /> Modo claro</> : <><Moon className="w-4 h-4" /> Modo escuro</>}</Button></div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="vortex-header bg-background/90 backdrop-blur-md border-b border-border/60 px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3"><button aria-label="Abrir menu" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 -ml-2 hover:bg-primary/10 rounded-lg transition-colors">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button><div className="md:hidden flex items-center gap-2"><VortexLogo size="sm" className="text-[#caa85e]" /><span className="font-serif text-lg tracking-widest text-[#caa85e]">VORTEX</span></div></div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4 text-[#caa85e]" /> Bem-vindo à Vortex</div>
          <Link href="/add-book" className="header-add-button"><span className="text-lg leading-none">+</span><span className="hidden sm:inline">Adicionar tomo</span></Link>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8"><div className="vortex-content container mx-auto py-6 md:py-8">{children}</div></main>
        <nav className="mobile-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-md border-t border-border/60 px-2 py-2"><div className="grid grid-cols-5 gap-1">{[{ label: 'Início', href: '/', icon: Home }, { label: 'Biblioteca', href: '/library', icon: BookOpen }, { label: 'Leitura', href: '/reading', icon: Flame }, { label: 'Favoritos', href: '/favorites', icon: Heart }, { label: 'Perfil', href: '/profile', icon: UserRound }].map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="mobile-nav-item"><Icon className="h-4 w-4" /><span>{item.label}</span></Link>; })}</div></nav>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
