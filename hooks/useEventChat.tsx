"use client";

import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInitialMessages } from "./useInitialMessages";

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

export function useEventChat({ eventId }: UseEventChatProps) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const channelRef = useRef<RealtimeChannel>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(data?.user || null);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (!eventId || !user) return;

    const channelName = `event_chat_${eventId}`;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(channelName);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newMessage = payload.new;

          const formattedMessage: ChatMessage = {
            id: newMessage.id,
            content: newMessage.message,
            createdAt: newMessage.created_at,
            user: { name: newMessage.username },
            isOwnMessage: newMessage.user_id === user.id,
          };
          setMessages((current) => [...current, formattedMessage]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [eventId, user]);

  // useEffect(() => {
  //   if (!eventId || !user) return;

  //   const channelName = `event_chat_${eventId}`;

  //   if (channelRef.current) {
  //     supabase.removeChannel(channelRef.current);
  //   }

  //   let newChannel: RealtimeChannel;
  //   let cancel = false;

  //   supabase.realtime.setAuth().then(() => {
  //     if (cancel) return;

  //     newChannel = supabase.channel(channelName, {
  //       config: {
  //         private: true,
  //         presence: {
  //           key: user.id,
  //         },
  //       },
  //     });

  //     newChannel
  //       // .on("presence", { event: "sync" }, () => {
  //       //   const connected = Object.keys(newChannel.presenceState()).length;
  //       //   console.log({ connected });
  //       //   setConnectedUsers(Object.keys(newChannel.presenceState()).length);
  //       // })
  //       .on(
  //         "postgres_changes",
  //         {
  //           event: "INSERT",
  //           schema: "public",
  //           table: "messages",
  //           filter: `event_id=eq.${eventId}`,
  //         },
  //         (payload) => {
  //           const newMessage = payload.new;

  //           const formattedMessage: ChatMessage = {
  //             id: newMessage.id,
  //             content: newMessage.message,
  //             createdAt: newMessage.created_at,
  //             user: { name: newMessage.username },
  //             isOwnMessage: newMessage.user_id === user.id,
  //           };
  //           setMessages((current) => [...current, formattedMessage]);
  //         }
  //       )
  //       .subscribe((status) => {
  //         if (status !== "SUBSCRIBED") return;

  //         newChannel.track({ userId: user.id });
  //       });
  //   });

  //   return () => {
  //     cancel = true;
  //     if (!newChannel) return;
  //     newChannel.untrack();
  //     newChannel.unsubscribe();
  //   };
  // }, [eventId, user]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      await supabase.from("messages").insert({
        event_id: eventId,
        user_id: user.id,
        username: user?.user_metadata.full_name || "Anonymous",
        message,
      });
    },
    [eventId, user]
  );

  return { messages, sendMessage, isConnected: true };
}
