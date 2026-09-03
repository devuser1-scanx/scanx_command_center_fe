// features/users/users-list-body.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { UserTable } from "@/components/users/user-table";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import { usePermission } from "@/hooks/use-permission";
import { ADMIN_ROUTES } from "@/lib/constants/routes";

const PAGE_SIZE = 20;

type UsersListBodyProps = {
  initialSearch: string;
  initialPage: number;
};

export function UsersListBody({
  initialSearch,
  initialPage,
}: UsersListBodyProps) {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const [inputValue, setInputValue] = useState(initialSearch);

  const offset = (initialPage - 1) * PAGE_SIZE;

  const usersQuery = useUsersList({
    search: initialSearch || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  function pushParams(search: string, page: number) {
    const query = new URLSearchParams();

    if (search) {
      query.set("q", search);
    }

    if (page > 1) {
      query.set("page", String(page));
    }

    const queryString = query.toString();

    router.push(queryString ? `/admin/users?${queryString}` : "/admin/users");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushParams(inputValue.trim(), 1);
  }

  function handleClear() {
    setInputValue("");
    pushParams("", 1);
  }

  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#2d2d2d]">Users</h2>
            <p className="mt-1 text-sm text-[#777777]">
              Command Center staff accounts and their roles.
            </p>
          </div>

          {hasPermission("users.create") ? (
            <Link
              href={ADMIN_ROUTES.createUser}
              className="rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636]"
            >
              + New User
            </Link>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap gap-2"
        >
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search by name or email"
            className="min-w-0 flex-1 rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
          />

          <button
            type="submit"
            className="rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
          >
            Search
          </button>

          {initialSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        {usersQuery.isLoading && (
          <p className="text-sm text-[#777777]">Loading…</p>
        )}

        {usersQuery.isError && (
          <p className="text-sm font-semibold text-[#cc3333]">
            {usersQuery.error.message}
          </p>
        )}

        {usersQuery.data && usersQuery.data.items.length === 0 && (
          <p className="text-sm text-[#777777]">No users found.</p>
        )}

        {usersQuery.data && usersQuery.data.items.length > 0 && (
          <UserTable users={usersQuery.data.items} />
        )}

        {usersQuery.data && total > 0 && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-xs text-[#999999]">
              Page {initialPage} of {totalPages} · {total}{" "}
              {total === 1 ? "user" : "users"}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={initialPage <= 1}
                onClick={() => pushParams(initialSearch, initialPage - 1)}
                className="rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={initialPage >= totalPages}
                onClick={() => pushParams(initialSearch, initialPage + 1)}
                className="rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
