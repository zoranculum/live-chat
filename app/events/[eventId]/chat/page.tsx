// Single event page
import { RealtimeChat } from "@/components/realtime-chat";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getClaims();
  if (userError || !user?.claims) {
    redirect("/auth/login");
  }

  const { data } = await supabase
    .from("events")
    .select("id, name, description, status, event_member (count) ")
    .eq("id", eventId)
    .single();

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <h1 className="text-2xl font-bold mb-4">{data?.name}</h1>
      <RealtimeChat eventId={eventId} />
    </div>
  );
}
