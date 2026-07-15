"use client";

import { useEffect, useState } from "react";
import { Button, Input, FormField, useToast } from "@jisp/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Password updated.", "success");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1>Settings</h1>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Account</h3>
        <FormField label="Email" htmlFor="account-email">
          <Input id="account-email" value={email} disabled />
        </FormField>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6 flex flex-col gap-4">
        <h3>Change Password</h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <FormField label="New Password" htmlFor="newPassword" required>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </FormField>
          <FormField label="Confirm Password" htmlFor="confirmPassword" required>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </FormField>
          <Button type="submit" variant="primary" isLoading={saving} className="w-fit">
            Update Password
          </Button>
        </form>
      </section>

      <section className="bg-jisp-white border border-jisp-light p-6">
        <h3 className="mb-2">Payment Gateway</h3>
        <p className="text-sm text-jisp-grey">
          Bank Transfer, DuitNow, and Cash on Delivery are active. Online Payment Gateway integration is
          reserved for a future phase — the checkout flow and database schema already support it
          (see <code>PAYMENT_GATEWAY_*</code> environment variables in the Storefront app).
        </p>
      </section>
    </div>
  );
}
