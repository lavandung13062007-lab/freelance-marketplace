import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import TopSearchBar from "@/components/TopSearchBar";
import NotificationBell from "@/components/NotificationBell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name ?? user.email ?? "";

  return (
    <div className="flex min-h-screen">
      <Sidebar name={name} />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white/80 px-8 py-4 backdrop-blur">
          <div className="max-w-xl flex-1">
            <TopSearchBar />
          </div>
          <NotificationBell />
        </header>
        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
