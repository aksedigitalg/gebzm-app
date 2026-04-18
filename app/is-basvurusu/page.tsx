import { Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
export const metadata = { title: 'İş Başvurusu' };
export default function Page() {
  return (
    <>
      <PageHeader title='İş Başvurusu' subtitle='İş ilanları' back='/kategoriler' />
      <div className='flex flex-col items-center justify-center px-5 py-20 text-center'>
        <Briefcase className='h-12 w-12 text-muted-foreground/40' strokeWidth={1.5} />
        <p className='mt-4 text-sm font-semibold'>Henüz iş ilanı yok</p>
        <p className='mt-1 text-xs text-muted-foreground'>İşletmeler iş ilanı eklediğinde burada görünecek.</p>
      </div>
    </>
  );
}
