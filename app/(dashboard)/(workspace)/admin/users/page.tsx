import { UsersListBody } from "@/features/users/users-list-body";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function UsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const parsedPage = Number(params?.page);

  return (
    <UsersListBody
      initialSearch={params?.q ?? ""}
      initialPage={
        Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
      }
    />
  );
}
