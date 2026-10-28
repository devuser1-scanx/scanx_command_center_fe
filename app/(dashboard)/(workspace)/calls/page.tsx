// app/(dashboard)/(workspace)/calls/page.tsx

import { redirect } from "next/navigation";

import { CALLS_ROUTES } from "@/lib/constants/routes";

/** The Calls section opens on the Dialer; it has no landing page of its own. */
export default function CallsPage() {
  redirect(CALLS_ROUTES.dialer);
}
