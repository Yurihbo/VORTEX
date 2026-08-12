import { useMemo } from 'react';
import { Award, Check, Lock, Shield } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { storageService } from '@/services/storage';

const achievementRules = [
  { id: 'first-book', name: 'Primeiro Tomo', description: 'Adicione seu primeiro livro.', icon: '✦', rule: (count: number, completed: number) => count >= 1 },
  { id: 'first-treasure', name: 'Primeiro Tesouro', description: 'Conclua seu primeiro livro.', icon: '◈', rule: (_count: number, completed: number) => completed >= 1 },
  { id: 'guardian', name: 'Guardião do Conhecimento', description: 'Conclua 10 livros.', icon: '⌘', rule: (_count: number, completed: number) => completed >= 10 },
  { id: 'master', name: 'Mestre das Estantes', description: 'Possua 50 livros.', icon: '♜', rule: (count: number) => count >= 50 },
  { id: 'ancient-dragon', name: 'Dragão Ancião', description: 'Conclua 100 livros.', icon: '🐉', rule: (_count: number, completed: number) => completed >= 100 },
  { id: 'fire-reader', name: 'Leitor Incansável', description: 'Mantenha uma sequência de leitura por 7 dias.', icon: '⌁', rule: () => storageService.getReadingStreak().bestStreak >= 7 },
];

export default function Achievements() {
  const books = storageService.getBooks();
  const completed = books.filter(book => book.status === 'completed').length;
  const unlocked = useMemo(() => achievementRules.filter(item => item.rule(books.length, completed)).length, [books.length, completed]);

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="eyebrow">Marcos da jornada</p><h1 className="text-5xl font-serif mt-2">Conquistas</h1><p className="text-muted-foreground mt-2">Cada hábito deixa uma marca nos anais da sua biblioteca.</p></div><div className="flex items-center gap-3 rounded-lg border border-[#caa85e]/30 bg-[#caa85e]/5 px-4 py-3"><Award className="h-5 w-5 text-[#caa85e]" /><span className="font-semibold">{unlocked} / {achievementRules.length} desbloqueadas</span></div></header>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{achievementRules.map(item => { const isUnlocked = item.rule(books.length, completed); return <Card key={item.id} className={`vortex-card p-6 relative overflow-hidden ${isUnlocked ? 'border-[#caa85e]/40' : 'opacity-65'}`}><div className={`flex h-12 w-12 items-center justify-center rounded-lg border text-2xl ${isUnlocked ? 'border-[#caa85e]/50 bg-[#caa85e]/10 text-[#caa85e]' : 'border-border bg-muted text-muted-foreground'}`}>{isUnlocked ? item.icon : <Lock className="h-5 w-5" />}</div><h2 className="mt-5 text-2xl font-serif">{item.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest">{isUnlocked ? <><Check className="h-3 w-3 text-[#caa85e]" /><span className="text-[#caa85e]">Conquistada</span></> : <><Shield className="h-3 w-3" /><span className="text-muted-foreground">Ainda selada</span></>}</div></Card>; })}</div>
      </div>
    </Layout>
  );
}
