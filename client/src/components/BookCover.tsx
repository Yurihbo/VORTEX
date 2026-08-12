import { Book } from '@/types/book';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const coverByTitle: Record<string, string> = {
  'Duna': '/manus-storage/vortex-cover-dune_43d587d2.jpg',
  'O Hobbit': '/manus-storage/vortex-cover-hobbit_8f356b26.jpg',
};

const fallbackCovers = [
  'linear-gradient(145deg, rgba(57,77,111,.96), rgba(24,26,57,.99))',
  'linear-gradient(145deg, rgba(102,64,48,.96), rgba(35,24,28,.99))',
  'linear-gradient(145deg, rgba(53,87,77,.96), rgba(19,35,34,.99))',
  'linear-gradient(145deg, rgba(81,52,103,.96), rgba(26,20,48,.99))',
];

export function BookCover({ book, size = 'md', className = '' }: BookCoverProps) {
  const sizeClasses = { sm: 'w-16 h-24', md: 'w-28 h-40', lg: 'w-48 h-72' };
  const image = book.coverUrl || coverByTitle[book.title];
  const fallback = fallbackCovers[Number(book.id.replace(/\D/g, '') || 0) % fallbackCovers.length];

  return (
    <div className={`vortex-book-artifact ${sizeClasses[size]} ${className}`} style={!image ? { background: fallback } : undefined} aria-label={`Capa de ${book.title}`}>
      {image ? <img src={image} alt={`Capa de ${book.title}`} className="h-full w-full object-cover" loading="lazy" /> : <div className="relative h-full w-full p-3 flex flex-col justify-between text-[#f2e4bd]"><span className="text-[8px] tracking-[.24em] uppercase opacity-70">Vortex archive</span><div><div className="mb-2 h-px w-8 bg-[#caa85e]/70" /><p className="font-serif text-base leading-tight">{book.title}</p><p className="mt-1 text-[9px] opacity-70">{book.author}</p></div><span className="self-end text-lg opacity-60">✦</span></div>}
      <div className="vortex-book-plate"><span>✦</span><span>V</span><span>✦</span></div>
      <div className="vortex-book-rune">ᛟ</div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-white/5" />
    </div>
  );
}
