"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tag } from "@/types";

export interface TagWithCount extends Tag {
  postCount: number;
}

export function useTags() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (res.ok) {
        setTags(data.tags);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (name: string, color?: string) => {
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      await fetchTags();
    }
    return res.ok;
  }, [fetchTags]);

  const deleteTag = useCallback(async (id: string) => {
    const res = await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setTags((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const addTagToPost = useCallback(async (postId: string, tagId: string) => {
    const res = await fetch(`/api/posts/${postId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    return res.ok;
  }, []);

  const removeTagFromPost = useCallback(async (postId: string, tagId: string) => {
    const res = await fetch(`/api/posts/${postId}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    return res.ok;
  }, []);

  return {
    tags,
    loading,
    createTag,
    deleteTag,
    addTagToPost,
    removeTagFromPost,
    refetch: fetchTags,
  };
}
