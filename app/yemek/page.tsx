import { Utensils } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
export const metadata = { title: 'Yemek' };
export default function Page() {
  return (
    <>
      <PageHeader title='Yemek' subtitle='Gebze içi teslimat' back='/kategoriler' />
      <div className='flex flex-col items-center justify-center px-5 py-20 text-center'>
        <Utensils className='h-12 w-12 text-muted-foreground/40' strokeWidth={1.5} />
        <p className='mt-4 text-sm font-semibold'>Henüz restoran eklenmemiş</p>
        <p className='mt-1 text-xs text-muted-foreground'>Restoranlar platforma katıldıkça burada listelenecek.</p>
      </div>
    </>
  );
}
