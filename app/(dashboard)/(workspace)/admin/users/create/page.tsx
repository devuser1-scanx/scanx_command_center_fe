import Link from "next/link";

import { UserForm } from "@/components/users/user-form";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

export default function CreateUserPage() {
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

      <div>
        <h1 className="text-2xl font-bold text-[#2d2d2d]">New user</h1>
        <p className="mt-1 text-sm text-[#777777]">
          Create a Command Center account and assign its roles.
        </p>
      </div>

      <UserForm />
    </div>
  );
}
