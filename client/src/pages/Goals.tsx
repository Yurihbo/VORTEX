import { useEffect, useState } from 'react';
import { Flame, Target, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { storageService } from '@/services/storage';
import { ReadingGoal, ReadingStreak } from '@/types/book';

export default function Goals() {
  const [goal, setGoal] = useState<ReadingGoal>(storageService.getReadingGoal());
  const [streak, setStreak] = useState<ReadingStreak>(storageService.getReadingStreak());
  const [target, setTarget] = useState(String(goal.targetBooks));
  const progress = Math.min(100, Math.round((goal.completedBooks / Math.max(1, goal.targetBooks)) * 100));

  useEffect(() => {
    const completed = storageService.getBooks().filter(book => book.status === 'completed').length;
    const next = { ...storageService.getReadingGoal(), completedBooks: completed };
    setGoal(next);
    storageService.saveReadingGoal(next);
  }, []);

  function saveGoal() {
    const next = { ...goal, targetBooks: Math.max(1, Number(target) || 1) };
    setGoal(next);
    storageService.saveReadingGoal(next);
    toast.success('Desafio do Guardião atualizado.');
  }

  function updateStreak() {
    const next = { ...streak, currentStreak: streak.currentStreak + 1, bestStreak: Math.max(streak.bestStreak, streak.currentStreak + 1), lastReadDate: new Date().toISOString() };
    setStreak(next);
    storageService.saveReadingStreak(next);
    toast.success('A chama da leitura foi reacendida.');
  }

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">
        <header><p className="eyebrow">Ritmo e intenção</p><h1 className="text-5xl font-serif mt-2">O Desafio do Guardião</h1><p className="text-muted-foreground mt-2">Metas pequenas tornam grandes jornadas possíveis.</p></header>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="vortex-card p-7 md:p-9 overflow-hidden relative"><div className="absolute right-5 top-4 text-8xl text-primary/5 font-serif">◎</div><div className="relative flex flex-col md:flex-row items-center gap-8"><div className="goal-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className="goal-ring-inner"><span className="text-4xl font-serif text-primary">{progress}%</span><span className="text-xs uppercase tracking-widest text-muted-foreground">realizado</span></div></div><div className="flex-1 text-center md:text-left"><p className="eyebrow">Meta anual · {goal.year}</p><h2 className="text-4xl font-serif mt-1">{goal.completedBooks} de {goal.targetBooks} livros</h2><p className="mt-3 text-muted-foreground">Você já percorreu {goal.completedBooks} caminhos até aqui.</p><div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3"><Input type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} className="w-32" aria-label="Meta de livros" /><Button onClick={saveGoal}><Target className="h-4 w-4 mr-2" /> Ajustar meta</Button></div></div></div></Card>
          <Card className="vortex-card p-7"><div className="flex items-start justify-between"><div><p className="eyebrow">Constância</p><h2 className="text-4xl font-serif mt-1">Chama da Leitura</h2></div><Flame className="h-7 w-7 text-[#caa85e]" /></div><div className="mt-8 flex items-baseline gap-2"><span className="text-6xl font-serif text-[#caa85e]">{streak.currentStreak}</span><span className="text-muted-foreground">dias</span></div><p className="mt-2 text-muted-foreground">Você mantém a chama acesa há {streak.currentStreak} dias.</p><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-lg bg-background/40 border border-border/50 p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Melhor sequência</p><p className="mt-2 text-xl font-semibold">{streak.bestStreak} dias</p></div><div className="rounded-lg bg-background/40 border border-border/50 p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Próximo marco</p><p className="mt-2 text-xl font-semibold">{Math.max(0, 7 - (streak.currentStreak % 7))} dias</p></div></div><Button variant="outline" className="mt-6 w-full" onClick={updateStreak}><Flame className="h-4 w-4 mr-2" /> Registrar leitura de hoje</Button></Card>
        </div>
        <Card className="vortex-card p-6"><div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-[#caa85e]" /><div><h2 className="text-3xl font-serif">Ritual de progresso</h2><p className="text-sm text-muted-foreground mt-1">Leia um pouco, registre uma página, mantenha o portal aberto.</p></div></div><div className="mt-6 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-[#caa85e] rounded-full" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-sm text-muted-foreground">Faltam {Math.max(0, goal.targetBooks - goal.completedBooks)} tomos para completar o desafio deste ano.</p></Card>
      </div>
    </Layout>
  );
}
