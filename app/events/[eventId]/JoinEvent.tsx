"use client";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

interface JoinEventProps {
  eventId: string;
}

const JoinEvent = ({ eventId }: JoinEventProps) => {
  const handleJoinEvent = async () => {
    const supabase = await createClient();

    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      return;
    }

    // Check if the user is already a member
    const { data: memberData, error: memberError } = await supabase
      .from("event_member")
      .select("*")
      .eq("user_id", data.user.id)
      .eq("event_id", eventId)
      .single();

    if (memberError && memberError.code !== "PGRST116") {
      return;
    }

    if (memberData) {
      // User is already a member, redirect to chat
      redirect(`/events/${eventId}/chat`);
      return;
    }

    const { error } = await supabase.from("event_member").insert({
      user_id: data?.user.id,
      event_id: eventId,
    });

    if (error) {
      return;
    }

    redirect(`/events/${eventId}/chat`);
  };

  return (
    <Button className="cursor-pointer" onClick={() => handleJoinEvent()}>
      Priključi se
    </Button>
  );
};

export default JoinEvent;
