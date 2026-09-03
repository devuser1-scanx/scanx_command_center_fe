// app/(dashboard)/admin/reports/page.tsx

import { ReportsListBody } from "@/features/reports/reports-list-body";

type AdminReportsPageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const params = await searchParams;
  const parsedPage = Number(params?.page);

  return (
    <ReportsListBody
      initialSearch={params?.q ?? ""}
      initialPage={
        Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
      }
    />
  );
}
