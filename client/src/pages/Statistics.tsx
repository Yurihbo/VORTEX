import { BarChart3, BookOpen, Star, ScrollText } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { storageService } from '@/services/storage';

const colors = ['#caa85e', '#607fa8', '#8b6aa7', '#497363', '#9d6b5d'];

export default function Statistics() {
  const books = storageService.getBooks();
  const stats = storageService.getLibraryStats();
  const genreData = Object.entries(books.reduce<Record<string, number>>((acc, book) => { acc[book.genre] = (acc[book.genre] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const monthData = Array.from({ length: 6 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (5 - index)); return { name: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), livros: books.filter(book => { const added = new Date(book.addedDate); return added.getMonth() === date.getMonth() && added.getFullYear() === date.getFullYear(); }).length }; });

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">
        <header><p className="eyebrow">Leitura em perspectiva</p><h1 className="text-5xl font-serif mt-2">Crônicas da Biblioteca</h1><p className="text-muted-foreground mt-2">Um mapa silencioso dos seus caminhos entre páginas.</p></header>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4"><Card className="vortex-card p-5"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-serif">{stats.booksRead}</p><p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Livros lidos</p></Card><Card className="vortex-card p-5"><ScrollText className="h-5 w-5 text-[#caa85e]" /><p className="mt-4 text-3xl font-serif">{stats.pagesRead}</p><p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Páginas percorridas</p></Card><Card className="vortex-card p-5"><Star className="h-5 w-5 text-[#caa85e] fill-current" /><p className="mt-4 text-3xl font-serif">{stats.averageRating || '—'}</p><p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Média de avaliação</p></Card><Card className="vortex-card p-5"><BarChart3 className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-serif">{stats.favoriteGenre || '—'}</p><p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Reino favorito</p></Card></div>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><Card className="vortex-card p-6"><h2 className="text-3xl font-serif">Livros por mês</h2><p className="text-sm text-muted-foreground mt-1">Entradas recentes no arquivo.</p><div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(202,168,94,.12)" vertical={false} /><XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#202039', border: '1px solid rgba(202,168,94,.35)', borderRadius: 8, color: '#f2e4bd' }} /><Bar dataKey="livros" fill="#607fa8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card><Card className="vortex-card p-6"><h2 className="text-3xl font-serif">Reinos do conhecimento</h2><p className="text-sm text-muted-foreground mt-1">A composição da sua estante.</p><div className="mt-6 h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={genreData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>{genreData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: '#202039', border: '1px solid rgba(202,168,94,.35)', borderRadius: 8, color: '#f2e4bd' }} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{genreData.slice(0, 5).map((entry, index) => <div key={entry.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{entry.name}</span><span className="text-muted-foreground">{entry.value}</span></div>)}</div></Card></div>
      </div>
    </Layout>
  );
}
