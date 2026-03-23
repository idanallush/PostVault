"use client";

import { useState, useEffect, useCallback } from "react";
import type { PostWithTags } from "@/types";

export interface PostFilters {
  search: string;
  platform: string;
  category: string;
  tag: string;
  favorite: boolean;
  sort: "newest" | "oldest";
  page: number;
}

const defaultFilters: PostFilters = {
  search: "",
  platform: "",
  category: "",
  tag: "",
  favorite: false,
  sort: "newest",
  page: 1,
};

export function usePosts() {
  const [posts, setPosts] = useState<PostWithTags[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PostFilters>(defaultFilters);

  const fetchPosts = useCallback(async (f: PostFilters) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (f.search) params.set("search", f.search);
    if (f.platform) params.set("platform", f.platform);
    if (f.category) params.set("category", f.category);
    if (f.tag) params.set("tag", f.tag);
    if (f.favorite) params.set("favorite", "true");
    params.set("sort", f.sort);
    params.set("page", f.page.toString());

    try {
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה בטעינה");
        return;
      }
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(filters);
  }, [filters, fetchPosts]);

  const setFilters = useCallback((partial: Partial<PostFilters>) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...partial };
      // Reset page when filters change (unless page is explicitly set)
      if (!("page" in partial)) next.page = 1;
      return next;
    });
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch {
      // silent fail
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const newFav = !post.is_favorite;
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_favorite: newFav } : p)),
    );

    try {
      await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, isFavorite: newFav }),
      });
    } catch {
      // Revert
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: !newFav } : p)),
      );
    }
  }, [posts]);

  const nextPage = useCallback(() => {
    if (filters.page < totalPages) {
      setFilters({ page: filters.page + 1 });
    }
  }, [filters.page, totalPages, setFilters]);

  const prevPage = useCallback(() => {
    if (filters.page > 1) {
      setFilters({ page: filters.page - 1 });
    }
  }, [filters.page, setFilters]);

  return {
    posts,
    total,
    page: filters.page,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    deletePost,
    toggleFavorite,
    nextPage,
    prevPage,
    refetch: () => fetchPosts(filters),
  };
}
