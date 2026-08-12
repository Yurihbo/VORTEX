import { useMemo } from 'react';
import { Award, Check, Flame, Lock, Shield } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { storageService } from '@/services/storage';
import { STREAK_MILESTONES, streakProgress } from '@/lib/readingMilestones';

const achievementRules = [
  { id: 'first-book', name: 'Primeiro Tomo', description: 'Adicione seu primeiro livro.', icon: '✦', rule: (count: number, completed: number) => count >= 1 },
  { id: 'first-treasure', name: 'Primeiro Tesouro', description: 'Conclua seu primeiro livro.', icon: '◈', rule: (_count: number, completed: number) => completed >= 1 },
  { id: 'guardian', name: 'Guardião do Conhecimento', description: 'Conclua 10 livros.', icon: '⌘', rule: (_count: number, completed: number) => completed >= 10 },
  { id: 'master', name: 'Mestre das Estantes', description: 'Possua 50 livros.', icon: '♜', rule: (count: number) => count >= 50 },
  { id: 'ancient-dragon', name: 'Dragão Ancião', description: 'Conclua 100 livros.', icon: '🐉', rule: (_count: number, completed: number) => completed >= 100 },
];

export default function Achievements() {
  const books = storageService.getBooks();
  const completed = books.filter(book => book.status === 'completed').length;
  const streak = storageService.getReadingStreak();
  const regularUnlocked = useMemo(() => achievementRules.filter(item => item.rule(books.length, completed)).length, [books.length, completed]);
  const streakUnlocked = STREAK_MILESTONES.filter(item => streakProgress(item, streak.currentStreak, streak.bestStreak).unlocked).length;
  const totalAchievements = achievementRules.length + STREAK_MILESTONES.length;
  const unlocked = regularUnlocked + streakUnlocked;

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">Marcos da jornada</p><h1 className="mt-2 text-5xl font-serif">Conquistas</h1><p className="mt-2 text-muted-foreground">Cada hábito deixa uma marca nos anais da sua biblioteca.</p></div><div className="flex items-center gap-3 rounded-lg border border-[#caa85e]/30 bg-[#caa85e]/5 px-4 py-3"><Award className="h-5 w-5 text-[#caa85e]" /><span className="font-semibold">{unlocked} / {totalAchievements} desbloqueadas</span></div></header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{achievementRules.map(item => { const isUnlocked = item.rule(books.length, completed); return <Card key={item.id} className={`vortex-card relative overflow-hidden p-6 ${isUnlocked ? 'border-[#caa85e]/40' : 'opacity-65'}`}><div className={`flex h-12 w-12 items-center justify-center rounded-lg border text-2xl ${isUnlocked ? 'border-[#caa85e]/50 bg-[#caa85e]/10 text-[#caa85e]' : 'border-border bg-muted text-muted-foreground'}`}>{isUnlocked ? item.icon : <Lock className="h-5 w-5" />}</div><h2 className="mt-5 text-2xl font-serif">{item.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest">{isUnlocked ? <><Check className="h-3 w-3 text-[#caa85e]" /><span className="text-[#caa85e]">Conquistada</span></> : <><Shield className="h-3 w-3" /><span className="text-muted-foreground">Ainda selada</span></>}</div></Card>; })}</div>

        <Card className="vortex-card p-6 md:p-7"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Medalhas especiais</p><h2 className="mt-1 text-3xl font-serif">A chama da constância</h2><p className="mt-2 text-sm text-muted-foreground">Leia em dias consecutivos para despertar selos que só aparecem com o tempo.</p></div><div className="streak-flame"><Flame className="h-4 w-4" /> {streak.currentStreak} dias atuais</div></div><div className="medal-grid mt-6">{STREAK_MILESTONES.map(item => { const progress = streakProgress(item, streak.currentStreak, streak.bestStreak); return <div key={item.id} className={`medal-card ${progress.unlocked ? 'is-unlocked' : ''} tone-${item.tone}`}><div className="medal-icon streak-medal-symbol">{item.icon}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-serif text-xl leading-none">{item.label}</h3><p className="mt-1 text-xs text-muted-foreground">{item.description}</p></div>{progress.unlocked && <span className="medal-status">Conquistada</span>}</div><div className="medal-progress" aria-label={`${progress.best} de ${item.days} dias`}><span style={{ width: `${progress.percentage}%` }} /></div><div className="mt-1 flex justify-between text-[.65rem] uppercase tracking-[.1em] text-muted-foreground"><span>Melhor: {progress.best}</span><span>Meta: {item.days}</span></div></div></div>; })}</div></Card>
      </div>
    </Layout>
  );
}
