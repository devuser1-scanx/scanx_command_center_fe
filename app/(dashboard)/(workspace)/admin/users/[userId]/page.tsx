// app/(dashboard)/(workspace)/admin/users/[userId]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";

import { UserDetailBody } from "@/features/users/user-detail-body";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

type UserDetailsPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { userId } = await params;
  const id = Number(userId);

  if (!Number.isSafeInteger(id) || id < 1) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={ADMIN_ROUTES.users}
          className="text-sm font-semibold text-[#8b6f47] hover:underline"
        >
          ← Back to users
        </Link>
      </div>

      <UserDetailBody userId={id} />
    </div>
  );
}
