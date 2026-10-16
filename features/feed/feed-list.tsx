"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedPostCard } from "@/features/feed/feed-post-card";
import type { FeedPost } from "@/types/social";

export function FeedList({ posts: initialPosts }: { posts: FeedPost[] }) {
  const [posts, setPosts] = useState(initialPosts);

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      )
    );
  }

  function addComment(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, comments: p.comments + 1 } : p)));
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Feed</h1>
          <p className="text-muted-foreground">Veja o que sua comunidade está treinando.</p>
        </div>
        <Button asChild>
          <Link href="/map">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Publicar atividade</span>
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <FeedPostCard key={post.id} post={post} onToggleLike={toggleLike} onAddComment={addComment} />
        ))}
      </div>
    </div>
  );
}
