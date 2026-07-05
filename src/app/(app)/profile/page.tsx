import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  return (
    <div className="max-w-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow text-xl font-bold text-gray-900">
          {(profile?.full_name ?? "?").charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-bold text-gray-900">{profile?.full_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 flex min-h-32 flex-col items-center justify-center rounded-3xl bg-gray-50 text-center">
        <p className="font-bold text-gray-900">Sắp ra mắt ✨</p>
        <p className="mt-1 text-sm text-gray-500">Chỉnh sửa hồ sơ, portfolio</p>
      </div>
    </div>
  );
}
