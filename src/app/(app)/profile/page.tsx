import { getCurrentUser, getCurrentProfile, getProfileExtras } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { updatePhone } from "@/lib/actions/account";
import SubmitButton from "@/components/SubmitButton";
import AvatarUploader from "@/components/AvatarUploader";
import FreelancerSettings from "@/components/FreelancerSettings";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [profile, extras] = await Promise.all([getCurrentProfile(), getProfileExtras()]);

  const supabase = await createClient();
  const [{ data: contact }, { data: bank }] = await Promise.all([
    supabase.from("account_contacts").select("phone").eq("id", user!.id).maybeSingle(),
    supabase
      .from("profiles")
      .select("bank_name, bank_account_number, bank_account_holder")
      .eq("id", user!.id)
      .maybeSingle(),
  ]);

  return (
    <div className="max-w-sm">
      <div className="flex items-center gap-3">
        <AvatarUploader name={profile?.full_name ?? "?"} avatarUrl={extras?.avatar_url ?? null} />
        <div>
          <p className="font-bold text-gray-900">{profile?.full_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <form action={updatePhone} className="mt-8 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={contact?.phone ?? ""}
          placeholder="VD: 0901234567"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
        <p className="text-xs text-gray-400">
          Thêm số điện thoại để người khác tìm thấy bạn qua số này (giống Zalo). Không bắt buộc.
        </p>
        <SubmitButton>Lưu</SubmitButton>
      </form>

      <FreelancerSettings
        initialEnabled={extras?.role === "freelancer"}
        bankName={bank?.bank_name ?? null}
        bankAccountNumber={bank?.bank_account_number ?? null}
        bankAccountHolder={bank?.bank_account_holder ?? null}
      />
    </div>
  );
}
