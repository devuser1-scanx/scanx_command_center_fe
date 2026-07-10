import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata: Metadata = {
  title: "Change password",
  description:
    "Change your ScanX Command Center password.",
};

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <AuthCard
        title="Change Password"
        description="Choose a strong password that you have not used before."
      >
        <ChangePasswordForm />
      </AuthCard>
    </ProtectedRoute>
  );
}
