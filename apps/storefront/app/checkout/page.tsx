"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, computeDeliveryFee } from "@/lib/cart-store";
import { formatRM } from "@/lib/format";
import { Button, Input, Select, Textarea, FormField, EmptyState, useToast } from "@jisp/ui";

const MALAYSIAN_STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
  "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu",
  "Kuala Lumpur", "Labuan", "Putrajaya",
];

interface FormState {
  customerName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  deliveryMethod: string;
  paymentMethod: string;
  customerNote: string;
}

const initialForm: FormState = {
  customerName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postcode: "",
  country: "Malaysia",
  deliveryMethod: "Standard Delivery",
  paymentMethod: "Bank Transfer",
  customerNote: "",
};

export default function CheckoutPage() {
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const deliveryFee = computeDeliveryFee(subtotal);
  const grandTotal = subtotal + deliveryFee;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="Your cart is empty"
          description="Add items to your cart before checking out."
          action={
            <Link href="/shop">
              <Button variant="primary">Shop Now</Button>
            </Link>
          }
        />
      </div>
    );
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.customerName.trim()) next.customerName = "Name is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.addressLine1.trim()) next.addressLine1 = "Address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.postcode.trim()) next.postcode = "Postcode is required.";
    if (!form.country.trim()) next.country = "Country is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the errors below.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            size: l.size,
            color: l.color,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to place order.", "error");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      showToast("Network error. Please try again.", "error");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-12">
      <h1 className="mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h3>Contact Details</h3>
            <FormField label="Customer Name" htmlFor="customerName" required error={errors.customerName}>
              <Input id="customerName" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} error={errors.customerName} />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Phone Number" htmlFor="phone" required error={errors.phone}>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} />
              </FormField>
              <FormField label="Email" htmlFor="email" required error={errors.email}>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
              </FormField>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3>Delivery Address</h3>
            <FormField label="Address Line 1" htmlFor="addressLine1" required error={errors.addressLine1}>
              <Input id="addressLine1" value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} error={errors.addressLine1} />
            </FormField>
            <FormField label="Address Line 2" htmlFor="addressLine2">
              <Input id="addressLine2" value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="City" htmlFor="city" required error={errors.city}>
                <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} error={errors.city} />
              </FormField>
              <FormField label="State" htmlFor="state" required error={errors.state}>
                <Select id="state" value={form.state} onChange={(e) => update("state", e.target.value)} error={errors.state}>
                  <option value="">Select State</option>
                  {MALAYSIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Postcode" htmlFor="postcode" required error={errors.postcode}>
                <Input id="postcode" value={form.postcode} onChange={(e) => update("postcode", e.target.value)} error={errors.postcode} />
              </FormField>
              <FormField label="Country" htmlFor="country" required error={errors.country}>
                <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} error={errors.country} />
              </FormField>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3>Delivery Method</h3>
            <FormField label="Delivery Method" htmlFor="deliveryMethod">
              <Select id="deliveryMethod" value={form.deliveryMethod} onChange={(e) => update("deliveryMethod", e.target.value)}>
                <option value="Standard Delivery">Standard Delivery (2–5 business days)</option>
                <option value="Express Delivery">Express Delivery (1–2 business days)</option>
              </Select>
            </FormField>
          </section>

          <section className="flex flex-col gap-4">
            <h3>Payment Method</h3>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
              {["Bank Transfer", "DuitNow", "Cash on Delivery", "Payment Gateway"].map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 border px-4 py-3 cursor-pointer ${form.paymentMethod === method ? "border-jisp-black" : "border-jisp-light"}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={() => update("paymentMethod", method)}
                  />
                  <span className="text-sm">
                    {method}
                    {method === "Payment Gateway" && (
                      <span className="text-jisp-grey"> (coming soon — placeholder)</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3>Order Note</h3>
            <FormField label="Customer Note" htmlFor="customerNote">
              <Textarea id="customerNote" rows={3} value={form.customerNote} onChange={(e) => update("customerNote", e.target.value)} placeholder="Anything we should know about your order?" />
            </FormField>
          </section>
        </div>

        <div className="border border-jisp-light p-6 h-fit flex flex-col gap-4">
          <h3>Order Summary</h3>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
            {lines.map((line) => (
              <div key={line.id} className="flex justify-between text-xs">
                <span>
                  {line.name} × {line.quantity}
                  {(line.size || line.color) && (
                    <span className="text-jisp-grey"> ({[line.size, line.color].filter(Boolean).join(" / ")})</span>
                  )}
                </span>
                <span>{formatRM(line.unitPrice * line.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm border-t border-jisp-light pt-4">
            <span>Subtotal</span>
            <span>{formatRM(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? "Free" : formatRM(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium border-t border-jisp-light pt-4">
            <span>Grand Total</span>
            <span>{formatRM(grandTotal)}</span>
          </div>
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={submitting}>
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}
