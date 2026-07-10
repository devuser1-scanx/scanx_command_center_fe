// app/(auth)/login/page.tsx

import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to the ScanX Command Center.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome To The ScanX Command Center"
      description="Sign in to access the ScanX Command Center"
      footer={
        <p>
          Authorized ScanX Health staff only.
        </p>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}