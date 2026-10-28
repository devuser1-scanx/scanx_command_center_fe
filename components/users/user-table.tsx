// components/users/user-table.tsx

import Link from "next/link";

import { UserStatusBadge } from "@/components/users/user-status-badge";
import type { CommandCenterUser } from "@/features/users/api/users-api";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

type UserTableProps = {
  users: CommandCenterUser[];
};

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#e4ddd0] text-xs font-semibold uppercase tracking-wide text-[#999999]">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Roles</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e4ddd0]">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4 font-semibold text-[#2d2d2d]">
                <Link
                  href={ADMIN_ROUTES.user(user.id)}
                  className="hover:text-[#8b6f47] hover:underline"
                >
                  {user.firstName} {user.lastName}
                </Link>
              </td>

              <td className="py-3 pr-4 text-[#555555]">{user.email}</td>

              <td className="py-3 pr-4 text-[#555555]">
                {user.roles.length > 0
                  ? user.roles.map((role) => role.name).join(", ")
                  : "—"}
              </td>

              <td className="py-3 pr-4">
                <UserStatusBadge user={user} />
              </td>

              <td className="py-3 pr-4 text-[#555555]">
                {formatDate(user.createdAt)}
              </td>

              <td className="py-3 text-right">
                <Link
                  href={ADMIN_ROUTES.user(user.id)}
                  className="rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
