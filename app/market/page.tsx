import { ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
export const metadata = { title: 'Market' };
export default function Page() {
  return (
    <>
      <PageHeader title='Market' subtitle='Online market alışverişi' back='/kategoriler' />
      <div className='flex flex-col items-center justify-center px-5 py-20 text-center'>
        <ShoppingCart className='h-12 w-12 text-muted-foreground/40' strokeWidth={1.5} />
        <p className='mt-4 text-sm font-semibold'>Henüz market eklenmemiş</p>
        <p className='mt-1 text-xs text-muted-foreground'>Marketler platforma katıldıkça burada listelenecek.</p>
      </div>
    </>
  );
}
