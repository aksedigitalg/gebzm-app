import Link from 'next/link';
import { MapPin, Clock, Plus, Tag } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { formatTRY, timeAgoTR } from '@/lib/format';

export const metadata = { title: 'Ilanlar' };
export const revalidate = 30;

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const CATS = [
  { id: '', label: 'Tumu' }, { id: 'emlak', label: 'Emlak' }, { id: 'vasita', label: 'Vasita' },
  { id: 'yedek-parca', label: 'Yedek Parca' }, { id: 'is-makineleri', label: 'Is Makineleri' },
  { id: 'elektronik', label: 'Elektronik' }, { id: 'ev-yasam', label: 'Ev & Yasam' },
  { id: 'giyim', label: 'Giyim' }, { id: 'is-dunyasi', label: 'Is Dunyasi' },
];

interface L { id: string; title: string; price: number; price_type: string; location?: string; created_at?: string; photos?: string[]; listing_type: string; }

async function getLists(cat: string) {
  try {
    const res = await fetch(cat ? API+'/listings?category='+cat : API+'/listings', { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return await res.json() as L[];
  } catch { return []; }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const active = k || '';
  const listings = await getLists(active);
  return (
    <>
      <PageHeader title='Ilanlar' subtitle={listings.length+' ilan'} back='/kategoriler' />
      <div className='px-5 pb-6 pt-4'>
        <Link href='/ilanlar/yeni' className='mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90'>
          <Plus className='h-4 w-4' />Ilan Ver
        </Link>
        <div className='-mx-5 mb-5 flex gap-2 overflow-x-auto scroll-pl-5 scroll-pr-5 pb-1 no-scrollbar'>
          {CATS.map((c, i) => (
            <Link key={c.id} href={c.id ? '/ilanlar?k='+c.id : '/ilanlar'}
              className={'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition '+(active===c.id?'border-primary bg-primary text-primary-foreground':'border-border bg-card text-muted-foreground')+(i===0?' ml-5':'')+(i===CATS.length-1?' mr-5':'')}>
              {c.label}
            </Link>
          ))}
        </div>
        {listings.length === 0 ? (
          <div className='flex flex-col items-center py-20 text-center'>
            <Tag className='h-12 w-12 text-muted-foreground/30' strokeWidth={1.5} />
            <p className='mt-4 text-sm font-semibold'>Henuz ilan yok</p>
            <Link href='/ilanlar/yeni' className='mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground'>
              <Plus className='h-3.5 w-3.5' />Ilan Ver
            </Link>
          </div>
        ) : (
          <div className='space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0'>
            {listings.map((l) => (
              <Link key={l.id} href={'/ilanlar/'+l.id} className='flex gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-md'>
                <div className='relative flex h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted'>
                  {l.photos?.[0] ? <img src={l.photos[0]} alt='' className='h-full w-full object-cover' /> : <Tag className='m-auto h-8 w-8 text-muted-foreground/40' strokeWidth={1.5} />}
                  {l.listing_type==='kurumsal' && <span className='absolute bottom-1 left-1 rounded bg-primary/80 px-1 py-0.5 text-[8px] font-bold text-white'>PRO</span>}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='line-clamp-2 text-sm font-semibold'>{l.title}</p>
                  <p className='mt-1 text-base font-bold text-primary'>{formatTRY(l.price)}</p>
                  <div className='mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground'>
                    {l.location && <span className='flex items-center gap-1 truncate'><MapPin className='h-3 w-3 shrink-0' />{l.location}</span>}
                    {l.created_at && <span className='flex items-center gap-1 whitespace-nowrap'><Clock className='h-3 w-3' />{timeAgoTR(l.created_at)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
