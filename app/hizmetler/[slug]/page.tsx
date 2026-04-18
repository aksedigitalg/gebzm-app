import { notFound } from 'next/navigation';
export default function Page() { notFound(); }
export async function generateStaticParams() { return []; }
