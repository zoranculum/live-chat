"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface UseEventChatProps {
  eventId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string;
  isOwnMessage: boolean;
}

export function useInitialMessages({ eventId }: UseEventChatProps) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      setIsLoading(false);
      setUser(data?.user || null);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
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
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      if (data) {
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          content: msg.message,
          createdAt: msg.created_at,
          user: msg.username,
          isOwnMessage: msg.user_id === user?.id,
        }));
        setInitialMessages(formattedMessages);
      }
    };

    if (eventId && user) {
      fetchMessages();
    }
  }, [eventId, user]);

  return {
    initialMessages,
    isLoading,
  };
}
