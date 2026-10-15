// app/(dashboard)/(fax-portal)/fax-portal/page.tsx

import { redirect } from "next/navigation";

import { FAX_PORTAL_ROUTES } from "@/lib/constants/routes";

export default function FaxPortalIndexPage() {
  redirect(FAX_PORTAL_ROUTES.board);
}
