import { Wrench } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
export const metadata = { title: 'Hizmetler' };
export default async function Page() {
  return (
    <>
      <PageHeader title='Hizmetler' subtitle='Usta, kuaför, doktor ve daha fazlası' back='/kategoriler' />
      <div className='flex flex-col items-center justify-center px-5 py-20 text-center'>
        <Wrench className='h-12 w-12 text-muted-foreground/40' strokeWidth={1.5} />
        <p className='mt-4 text-sm font-semibold'>Henüz hizmet sağlayıcı eklenmemiş</p>
        <p className='mt-1 text-xs text-muted-foreground'>Hizmet sağlayıcılar platforma katıldıkça burada listelenecek.</p>
      </div>
    </>
  );
}
