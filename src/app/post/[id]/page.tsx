import { notFound } from "next/navigation";
import { PostDetail } from "@/components/PostDetail";

async function getPost(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `http://localhost:${process.env.PORT || 3000}`
    : null;

  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/api/posts/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) {
    return { title: "פוסט לא נמצא | PostVault" };
  }
  return {
    title: `${post.ai_summary?.slice(0, 50)}... | PostVault`,
    description: post.ai_summary,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <PostDetail initialPost={post} />;
}
