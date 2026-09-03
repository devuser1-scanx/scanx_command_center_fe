// app/(dashboard)/admin/reports/[groupId]/page.tsx

import { ReportGroupDetail } from "@/features/reports/report-group-detail";

type ReportGroupPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function ReportGroupPage({
  params,
}: ReportGroupPageProps) {
  const { groupId } = await params;

  return <ReportGroupDetail groupId={decodeURIComponent(groupId)} />;
}
