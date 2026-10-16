"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CommunityCover } from "@/features/communities/community-cover";
import { PersonCard } from "@/features/explore/person-card";
import { FeedPostCard } from "@/features/feed/feed-post-card";
import { ChallengeCard } from "@/features/challenges/challenge-card";
import { EventCard } from "@/features/events/event-card";
import { CURRENT_USER } from "@/lib/mock-data";
import type { Community } from "@/types/community";
import type { User } from "@/types/user";
import type { FeedPost } from "@/types/social";
import type { Challenge } from "@/types/challenge";
import type { SportEvent } from "@/types/event";

interface CommunityDetailProps {
  community: Community;
  members: User[];
  posts: FeedPost[];
  challenges: Challenge[];
  events: SportEvent[];
}

export function CommunityDetail({ community, members, posts, challenges, events }: CommunityDetailProps) {
  const [joined, setJoined] = useState(false);
  const [feedPosts, setFeedPosts] = useState(posts);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [challengeList, setChallengeList] = useState(challenges);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());

  function toggleFollow(id: string) {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleInterest(id: string) {
    setInterestedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        toast.success("Interesse registrado!");
      }
      return next;
    });
  }

  function handleJoinChallenge(id: string) {
    setChallengeList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "participando" as const,
              participants: 1,
              rank: 1,
              leaderboard: [
                { rank: 1, name: CURRENT_USER.name, username: CURRENT_USER.username, progressKm: c.progressKm, isCurrentUser: true },
              ],
            }
          : c
      )
    );
    toast.success("Você entrou no desafio!");
  }

  function handleLeaveChallenge(id: string) {
    setChallengeList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "descobrir" as const, progressKm: 0, participants: 0, rank: 0, leaderboard: [] } : c))
    );
    toast.info("Você saiu do desafio.");
  }

  function toggleLike(id: string) {
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p))
    );
  }

  function addComment(id: string) {
    setFeedPosts((prev) => prev.map((p) => (p.id === id ? { ...p, comments: p.comments + 1 } : p)));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/communities"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Comunidades
      </Link>

      <CommunityCover variant={community.coverVariant} className="h-40 w-full rounded-2xl sm:h-56" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{community.name}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{community.description}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            {community.membersCount.toLocaleString("pt-BR")} membros · {community.city}
          </p>
        </div>
        <Button
          variant={joined ? "secondary" : "default"}
          onClick={() => {
            setJoined((j) => !j);
            toast.success(joined ? "Você saiu da comunidade." : "Você entrou na comunidade!");
          }}
        >
          {joined ? "Participando" : "Participar"}
        </Button>
      </div>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="desafios">Desafios</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-4">
          {feedPosts.map((post) => (
            <FeedPostCard key={post.id} post={post} onToggleLike={toggleLike} onAddComment={addComment} />
          ))}
        </TabsContent>

        <TabsContent value="membros" className="mt-4 grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <PersonCard
              key={member.id}
              user={member}
              following={followingIds.has(member.id)}
              onToggleFollow={toggleFollow}
            />
          ))}
        </TabsContent>

        <TabsContent value="desafios" className="mt-4 grid gap-4 sm:grid-cols-2">
          {challengeList.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} onToggleJoin={handleJoinChallenge} onLeave={handleLeaveChallenge} />
          ))}
        </TabsContent>

        <TabsContent value="eventos" className="mt-4 space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              interested={interestedIds.has(event.id)}
              onToggleInterest={toggleInterest}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
