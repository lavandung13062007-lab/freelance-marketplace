"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!fullName || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Vui lòng điền đầy đủ thông tin")}`);
  }
  if (role !== "client" && role !== "freelancer") {
    redirect(`/signup?error=${encodeURIComponent("Vui lòng chọn loại tài khoản")}`);
  }
  if (password.length < 6) {
    redirect(`/signup?error=${encodeURIComponent("Mật khẩu cần ít nhất 6 ký tự")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Vui lòng điền đầy đủ thông tin")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Sai email hoặc mật khẩu")}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
