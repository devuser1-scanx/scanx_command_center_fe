"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getRoleRedirectPath } from "@/features/auth/utils/role-redirect";
import { useAuthStore } from "@/lib/auth/auth-store";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";

export default function UnauthorizedPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  function goBack(): void {
    if (user) {
      router.replace(getRoleRedirectPath(user.role));
      return;
    }

    router.replace(PUBLIC_ROUTES.login);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#2d2d2d_0%,#1a1a1a_100%)] px-4">
      <section className="w-full max-w-md rounded-xl bg-[#f5f1e8] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <ShieldAlert className="mx-auto size-12 text-[#8b6f47]" />

        <h1 className="mt-5 text-2xl font-semibold text-[#2d2d2d]">
          Access Denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#777777]">
          You do not have permission to access this page.
        </p>

        <Button
          type="button"
          onClick={goBack}
          className="mt-6 h-12 w-full rounded-md bg-[#8b6f47] text-white hover:bg-[#6f5636]"
        >
          Return to your dashboard
        </Button>
      </section>
    </main>
  );
}
