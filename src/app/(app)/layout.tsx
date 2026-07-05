import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/session";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  const name = profile?.full_name ?? user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar name={name} />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">{children}</main>
    </div>
  );
}
