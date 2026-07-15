"use client";

import { useState } from "react";
import { Button, Input, Textarea, FormField, useToast } from "@jisp/ui";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.message.trim()) next.message = "Message is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to send message.", "error");
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 md:px-8 py-16">
      <h1 className="mb-8">Contact</h1>
      {sent ? (
        <p className="text-sm">
          Thank you for reaching out — we&rsquo;ll get back to you shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormField label="Name" htmlFor="name" required error={errors.name}>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          </FormField>
          <FormField label="Email" htmlFor="email" required error={errors.email}>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
          </FormField>
          <FormField label="Message" htmlFor="message" required error={errors.message}>
            <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} error={errors.message} />
          </FormField>
          <Button type="submit" variant="primary" isLoading={submitting}>
            Send Message
          </Button>
        </form>
      )}
    </div>
  );
}
