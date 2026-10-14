// app/(dashboard)/(fax-portal)/fax-portal/case/[referralId]/page.tsx

import { FaxPortalPlaceholder } from "@/features/fax-portal/fax-portal-placeholder";

type ReferralCasePageProps = {
  params: Promise<{ referralId: string }>;
};

export default async function ReferralCasePage({
  params,
}: ReferralCasePageProps) {
  const { referralId } = await params;

  return (
    <FaxPortalPlaceholder
      title={`Referral Case #${decodeURIComponent(referralId)}`}
      description="The booking details, call controls, text messages and activity for this referral will appear here."
    />
  );
}
