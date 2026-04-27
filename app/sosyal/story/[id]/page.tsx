"use client";

import { useParams } from "next/navigation";
import { StoryViewer } from "@/components/social/StoryViewer";

export const dynamic = "force-dynamic";

export default function StoryViewPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <StoryViewer initialStoryId={id} />;
}
