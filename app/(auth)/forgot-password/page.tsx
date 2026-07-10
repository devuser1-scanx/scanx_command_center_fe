import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description:
    "Request password reset instructions for ScanX Command Center.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email address and we will send password reset instructions."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
