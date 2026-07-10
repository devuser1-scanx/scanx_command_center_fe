import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description:
    "Reset your ScanX Command Center password.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      description="Create a strong new password for your account."
    >
      <Suspense
        fallback={
          <p className="text-center text-sm text-[#999999]">
            Loading reset form...
          </p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
