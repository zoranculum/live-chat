import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import JoinEvent from "./events/[eventId]/JoinEvent";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getClaims();
  if (userError || !user?.claims) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("events")
    .select("id, name, description")
    .order("name", { ascending: true });

  if (error) {
    return <div>Greška.</div>;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Događaji</h1>
        <ul className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((event) => (
            <Card key={event.id} className="p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-gray-600">{event.description}</p>
              <JoinEvent eventId={event.id} />
            </Card>
          ))}
          {data?.length === 0 && <p className="text-gray-600">Nema događaja</p>}
        </ul>
      </div>
    </div>
  );
}
