// app/page.tsx

import { redirect } from "next/navigation";

import { PUBLIC_ROUTES } from "@/lib/constants/routes";

export default function HomePage() {
  redirect(PUBLIC_ROUTES.login);
}