import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { PostDetail } from "@/components/PostDetail";
import type { Post, Tag, PostWithTags } from "@/types";

async function getPost(id: string): Promise<PostWithTags | null> {
  try {
    const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
    const post = rows[0] as Post | undefined;
    if (!post) return null;

    const tagRows = await sql`
      SELECT t.* FROM tags t
      JOIN posts_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ${id}
    `;

    return { ...post, tags: tagRows as Tag[] };
  } catch (err) {
    console.error("[Post Page] Error fetching post:", err);
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

  return (
    <div className="min-h-[80vh] px-4 md:px-6 pt-8 pb-16">
      <main className="glass-panel max-w-3xl mx-auto p-6 md:p-8">
        <PostDetail initialPost={post} />
      </main>
    </div>
  );
}
