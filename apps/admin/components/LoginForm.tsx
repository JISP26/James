"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, FormField } from "@jisp/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Invalid email or password.");
      return;
    }
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jisp-black px-4">
      <div className="w-full max-w-sm bg-jisp-white p-8">
        <p className="text-center font-display text-2xl tracking-[0.15em] mb-1">JISP</p>
        <p className="text-center text-xs uppercase tracking-wider text-jisp-grey mb-8">Admin</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          {error && (
            <p role="alert" className="text-xs text-red-600">{error}</p>
          )}
          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
}
