"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readCredentials(formData) {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

function backToLogin(param, text) {
  redirect(`/login?${param}=${encodeURIComponent(text)}`);
}

export async function login(formData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(
    readCredentials(formData)
  );

  if (error) backToLogin("error", error.message);
  redirect("/");
}

export async function signup(formData) {
  const username = String(formData.get("username") ?? "").trim();
  if (!username) backToLogin("error", "Please choose a username to sign up.");

  const supabase = await createClient();
  // options.data is saved on the Supabase account as user_metadata.
  const { data, error } = await supabase.auth.signUp({
    ...readCredentials(formData),
    options: { data: { username } },
  });

  if (error) backToLogin("error", error.message);
  // With "Confirm email" turned on in Supabase, there's no session until
  // the user clicks the link in their inbox.
  if (!data.session) backToLogin("message", "Check your email to confirm your account.");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
