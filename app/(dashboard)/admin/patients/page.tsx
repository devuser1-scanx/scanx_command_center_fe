// app/(dashboard)/admin/patients/page.tsx

import { PatientSearchBody } from "@/features/patients/patient-search-body";

type AdminPatientsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminPatientsPage({
  searchParams,
}: AdminPatientsPageProps) {
  const params = await searchParams;

  return <PatientSearchBody initialQuery={params?.q ?? ""} />;
}
