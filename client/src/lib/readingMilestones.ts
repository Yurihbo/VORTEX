export interface StreakMilestone {
  id: string;
  label: string;
  description: string;
  days: number;
  icon: string;
  tone: 'gold' | 'blue' | 'violet';
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { id: 'streak-3', label: 'Faísca da Constância', description: 'Leia por 3 dias consecutivos.', days: 3, icon: '✦', tone: 'blue' },
  { id: 'streak-7', label: 'Chama de Sete Dias', description: 'Mantenha a leitura por uma semana.', days: 7, icon: '⌁', tone: 'gold' },
  { id: 'streak-14', label: 'Ritual Quinzenal', description: 'Leia por 14 dias consecutivos.', days: 14, icon: '◈', tone: 'violet' },
  { id: 'streak-30', label: 'Lua do Leitor', description: 'Mantenha a chama por 30 dias.', days: 30, icon: '☾', tone: 'gold' },
  { id: 'streak-100', label: 'Lenda da Biblioteca', description: 'Alcance uma sequência lendária de 100 dias.', days: 100, icon: '♜', tone: 'blue' },
];

export function streakProgress(milestone: StreakMilestone, currentStreak: number, bestStreak: number) {
  const reference = Math.max(currentStreak, bestStreak);
  return {
    unlocked: bestStreak >= milestone.days,
    percentage: Math.min(100, Math.round((reference / milestone.days) * 100)),
    current: currentStreak,
    best: bestStreak,
    remaining: Math.max(0, milestone.days - reference),
  };
}
