// components/users/user-table.tsx

import type { CommandCenterUser } from "@/features/users/api/users-api";
import { cn } from "@/lib/utils";

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
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e4ddd0]">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4 font-semibold text-[#2d2d2d]">
                {user.firstName} {user.lastName}
              </td>

              <td className="py-3 pr-4 text-[#555555]">{user.email}</td>

              <td className="py-3 pr-4 text-[#555555]">
                {user.roles.length > 0
                  ? user.roles.map((role) => role.name).join(", ")
                  : "—"}
              </td>

              <td className="py-3 pr-4">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                    user.isActive
                      ? "bg-[#e5f3ea] text-[#2f7d5c]"
                      : "bg-[#f3e5e5] text-[#a4372f]",
                  )}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>

                {user.mustChangePassword ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase text-[#999999]">
                    Pending first login
                  </span>
                ) : null}
              </td>

              <td className="py-3 pr-4 text-[#555555]">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
