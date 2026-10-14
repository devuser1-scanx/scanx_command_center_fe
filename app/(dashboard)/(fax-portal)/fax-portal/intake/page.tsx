// app/(dashboard)/(fax-portal)/fax-portal/intake/page.tsx

import { Suspense } from "react";

import { IntakeReview } from "@/features/fax-portal/intake/intake-review";

export default function IntakeReviewPage() {
  // IntakeReview reads ?referral= (set when a card is clicked on the board).
  return (
    <Suspense fallback={null}>
      <IntakeReview />
    </Suspense>
  );
}
