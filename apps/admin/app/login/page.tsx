import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
