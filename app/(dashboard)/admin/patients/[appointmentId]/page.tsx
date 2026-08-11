// app/(dashboard)/admin/patients/[appointmentId]/page.tsx

import { PatientProfileView } from "@/features/patients/patient-profile-view";

type PatientProfilePageProps = {
  params: Promise<{ appointmentId: string }>;
};

export default async function PatientProfilePage({
  params,
}: PatientProfilePageProps) {
  const { appointmentId } = await params;

  return (
    <PatientProfileView
      appointmentId={decodeURIComponent(appointmentId)}
    />
  );
}
