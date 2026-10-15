// app/(dashboard)/(fax-portal)/fax-portal/case/[referralId]/page.tsx

import { notFound } from "next/navigation";

import { CasePage } from "@/features/fax-portal/case/case-page";

type ReferralCasePageProps = {
  params: Promise<{ referralId: string }>;
};

export default async function ReferralCasePage({
  params,
}: ReferralCasePageProps) {
  const { referralId } = await params;
  const id = Number(referralId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return <CasePage referralId={id} />;
}
