// app/(dashboard)/(fax-portal)/fax-portal/queue/page.tsx

import { FaxPortalPlaceholder } from "@/features/fax-portal/fax-portal-placeholder";

export default function MyCallQueuePage() {
  return (
    <FaxPortalPlaceholder
      title="My Call Queue"
      description="Your own open referrals, sorted by callbacks due, overdue follow-ups, then new referrals."
    />
  );
}
