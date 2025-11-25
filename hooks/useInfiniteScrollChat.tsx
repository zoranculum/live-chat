import { useState } from "react";
import { ChatMessage } from "./useEventChat";
import { createClient } from "@/lib/supabase/client";

const LIMIT = 25;
export const useInfiniteScrollChat = ({
  startingMessages,
  userId,
  eventId,
}: {
  startingMessages: ChatMessage[];
  userId: string;
  eventId: string;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(startingMessages);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    startingMessages.length === 0 ? "done" : "idle"
  );

  async function loadMoreMessages() {
    if (status === "done" || status === "loading") return;
    const supabase = createClient();
    setStatus("loading");

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
          id,
          message,
          created_at,
          user_id,
          username
        `
      )
      .eq("event_id", eventId)
      .lt("created_at", messages[0].createdAt)
      .order("created_at", { ascending: false })
      .limit(LIMIT);

    if (error) {
      setStatus("error");
      return;
    }

    setMessages((prev) => [
      ...data.toReversed().map((msg) => ({
        id: msg.id,
        content: msg.message,
        createdAt: msg.created_at,
        user: msg.username,
        isOwnMessage: msg.user_id === userId,
      })),
      ...prev,
    ]);
    setStatus(data.length < LIMIT ? "done" : "idle");
  }

  function triggerQueryRef(node: HTMLDivElement | null) {
    if (node == null) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target === node) {
            observer.unobserve(node);
            loadMoreMessages();
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }

  return { loadMoreMessages, messages, status, triggerQueryRef };
};
