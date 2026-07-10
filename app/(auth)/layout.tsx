// app/(auth)/layout.tsx

import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#2d2d2d_0%,#1a1a1a_100%)] px-4 py-8 sm:px-6">
      {children}
    </main>
  );
}