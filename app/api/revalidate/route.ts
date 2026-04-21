import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const ALL_PAGES = [
  "/",
  "/hizmetler",
  "/ilanlar",
  "/restoran",
  "/yemek",
  "/kafe",
  "/market",
  "/magaza",
  "/emlakci",
  "/galerici",
];

export async function POST() {
  for (const p of ALL_PAGES) revalidatePath(p);
  return NextResponse.json({ revalidated: true });
}

export async function GET() {
  for (const p of ALL_PAGES) revalidatePath(p);
  return NextResponse.json({ revalidated: true });
}
