import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidatePath("/hizmetler");
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}

export async function GET() {
  revalidatePath("/hizmetler");
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}
