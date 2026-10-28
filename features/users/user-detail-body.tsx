// features/users/user-detail-body.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/users/confirm-dialog";
import {
  isUserLocked,
  UserStatusBadge,
} from "@/components/users/user-status-badge";
import { Button } from "@/components/ui/button";
import { useRolesList } from "@/features/roles/hooks/use-roles-list";
import type { CommandCenterUser } from "@/features/users/api/users-api";
import { useUser } from "@/features/users/hooks/use-user";
import { useUserActions } from "@/features/users/hooks/use-user-actions";
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "@/features/users/schemas/user-schema";
import { usePermission } from "@/hooks/use-permission";
import { ApiError } from "@/lib/api/api-error";
import { useAuthStore } from "@/lib/auth/auth-store";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-11 w-full rounded-md border bg-white px-3 text-sm text-[#2d2d2d] outline-none transition-[border-color,box-shadow] placeholder:text-[#aaaaaa] focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15 disabled:cursor-not-allowed disabled:bg-[#f5f5f5]";

const labelClasses =
  "mb-1.5 block text-xs font-semibold uppercase text-[#999999]";

const cardClasses =
  "rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm";

function fieldBorder(hasError: boolean) {
  return hasError ? "border-[#cc3333]" : "border-[#dddddd]";
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function sameCodes(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((code) => b.includes(code));
}

type PendingConfirm = "deactivate" | "reset" | "delete" | null;

export function UserDetailBody({ userId }: { userId: number }) {
  const userQuery = useUser(userId);

  if (userQuery.isLoading) {
    return <p className="text-sm text-[#777777]">Loading…</p>;
  }

  if (userQuery.isError || !userQuery.data) {
    const notFound =
      userQuery.error instanceof ApiError && userQuery.error.status === 404;

    return (
      <p role="alert" className="text-sm font-semibold text-[#cc3333]">
        {notFound
          ? "This user no longer exists."
          : (userQuery.error?.message ?? "Unable to load the user.")}
      </p>
    );
  }

  // Keyed by id so moving to another user starts the forms from that user.
  return <UserDetail key={userQuery.data.id} user={userQuery.data} />;
}

function UserDetail({ user }: { user: CommandCenterUser }) {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const actions = useUserActions(user.id);
  const rolesQuery = useRolesList();

  const isSelf = String(currentUserId) === String(user.id);
  const canEdit = hasPermission("users.update");
  const canAssignRoles = hasPermission("users.assign_role");
  const canChangeStatus = hasPermission("users.deactivate");
  const canDelete = hasPermission("users.delete");

  const savedRoleCodes = user.roles.map((role) => role.code);
  const [roleCodes, setRoleCodes] = useState<string[]>(savedRoleCodes);
  const [confirm, setConfirm] = useState<PendingConfirm>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone ?? "",
    },
    mode: "onTouched",
  });

  const rolesChanged = !sameCodes(roleCodes, savedRoleCodes);
  const locked = isUserLocked(user);

  async function saveProfile(values: UpdateUserFormValues) {
    try {
      const saved = await actions.update.mutateAsync({
        firstName: values.first_name,
        lastName: values.last_name,
        phone: values.phone ?? "",
      });

      reset({
        first_name: saved.firstName,
        last_name: saved.lastName,
        phone: saved.phone ?? "",
      });
      toast.success("Changes saved.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function saveRoles() {
    if (roleCodes.length === 0) {
      toast.error("Select at least one role.");
      return;
    }

    try {
      await actions.assignRoles.mutateAsync(roleCodes);
      toast.success("Roles updated.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  function toggleRole(code: string) {
    setRoleCodes((current) =>
      current.includes(code)
        ? current.filter((existing) => existing !== code)
        : [...current, code],
    );
  }

  async function changeStatus(isActive: boolean) {
    try {
      await actions.setStatus.mutateAsync(isActive);
      toast.success(isActive ? "Account activated." : "Account deactivated.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setConfirm(null);
    }
  }

  async function unlock() {
    try {
      await actions.unlock.mutateAsync();
      toast.success("Account unlocked.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function resetPassword() {
    try {
      await actions.resetPassword.mutateAsync();
      toast.success("A new temporary password has been emailed to the user.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setConfirm(null);
    }
  }

  async function remove() {
    try {
      await actions.remove.mutateAsync();
      toast.success("User deleted.");
      router.replace(ADMIN_ROUTES.users);
    } catch (error) {
      toast.error((error as Error).message);
      setConfirm(null);
    }
  }

  const saving = actions.update.isPending;

  return (
    <div className="space-y-5">
      <section className={cardClasses}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#2d2d2d]">
              {user.firstName} {user.lastName}
              {isSelf ? (
                <span className="ml-2 text-sm font-semibold text-[#999999]">
                  (you)
                </span>
              ) : null}
            </h1>
            <p className="mt-1 break-all text-sm text-[#777777]">{user.email}</p>
          </div>

          <UserStatusBadge user={user} />
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-[#999999]">
              Last sign-in
            </dt>
            <dd className="mt-0.5 text-[#555555]">
              {formatDateTime(user.lastLoginAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[#999999]">
              Created
            </dt>
            <dd className="mt-0.5 text-[#555555]">
              {formatDateTime(user.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <form
        onSubmit={handleSubmit(saveProfile)}
        noValidate
        className={cardClasses}
      >
        <h2 className="text-lg font-bold text-[#2d2d2d]">Profile</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClasses}>
              First name
            </label>
            <input
              id="first_name"
              disabled={!canEdit || saving}
              aria-invalid={errors.first_name ? "true" : "false"}
              {...register("first_name")}
              className={cn(inputClasses, fieldBorder(Boolean(errors.first_name)))}
            />
            {errors.first_name ? (
              <p role="alert" className="mt-1.5 text-xs text-[#cc3333]">
                {errors.first_name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="last_name" className={labelClasses}>
              Last name
            </label>
            <input
              id="last_name"
              disabled={!canEdit || saving}
              aria-invalid={errors.last_name ? "true" : "false"}
              {...register("last_name")}
              className={cn(inputClasses, fieldBorder(Boolean(errors.last_name)))}
            />
            {errors.last_name ? (
              <p role="alert" className="mt-1.5 text-xs text-[#cc3333]">
                {errors.last_name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className={labelClasses}>
              Phone{" "}
              <span className="normal-case text-[#bbbbbb]">(optional)</span>
            </label>
            <input
              id="phone"
              disabled={!canEdit || saving}
              aria-invalid={errors.phone ? "true" : "false"}
              {...register("phone")}
              className={cn(inputClasses, fieldBorder(Boolean(errors.phone)))}
            />
            {errors.phone ? (
              <p role="alert" className="mt-1.5 text-xs text-[#cc3333]">
                {errors.phone.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>
              Email
            </label>
            <input
              id="email"
              value={user.email}
              disabled
              readOnly
              className={cn(inputClasses, "border-[#dddddd]")}
            />
          </div>
        </div>

        {canEdit ? (
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || saving}
              onClick={() =>
                reset({
                  first_name: user.firstName,
                  last_name: user.lastName,
                  phone: user.phone ?? "",
                })
              }
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || saving}
              className="bg-[#8b6f47] text-white hover:bg-[#6f5636]"
            >
              {saving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        ) : null}
      </form>

      <section className={cardClasses}>
        <h2 className="text-lg font-bold text-[#2d2d2d]">Roles</h2>

        {rolesQuery.isLoading ? (
          <p className="mt-3 text-sm text-[#777777]">Loading roles…</p>
        ) : null}

        {rolesQuery.isError ? (
          <p className="mt-3 text-sm font-semibold text-[#cc3333]">
            {rolesQuery.error.message}
          </p>
        ) : null}

        {rolesQuery.data ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {rolesQuery.data.map((role) => (
              <label
                key={role.code}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                  canAssignRoles ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                  roleCodes.includes(role.code)
                    ? "border-[#8b6f47] bg-[#faf6ef] text-[#2d2d2d]"
                    : "border-[#dddddd] text-[#555555] hover:border-[#8b6f47]/50",
                )}
              >
                <input
                  type="checkbox"
                  disabled={!canAssignRoles || actions.assignRoles.isPending}
                  checked={roleCodes.includes(role.code)}
                  onChange={() => toggleRole(role.code)}
                  className="size-4 accent-[#8b6f47]"
                />
                {role.name}
              </label>
            ))}
          </div>
        ) : null}

        {isSelf ? (
          <p className="mt-3 text-xs text-[#999999]">
            You can&apos;t remove your own admin role.
          </p>
        ) : null}

        {canAssignRoles ? (
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!rolesChanged || actions.assignRoles.isPending}
              onClick={() => setRoleCodes(savedRoleCodes)}
            >
              Discard
            </Button>
            <Button
              type="button"
              disabled={!rolesChanged || actions.assignRoles.isPending}
              onClick={saveRoles}
              className="bg-[#8b6f47] text-white hover:bg-[#6f5636]"
            >
              {actions.assignRoles.isPending ? "Saving…" : "Save roles"}
            </Button>
          </div>
        ) : null}
      </section>

      <section className={cardClasses}>
        <h2 className="text-lg font-bold text-[#2d2d2d]">Account</h2>

        <ul className="mt-3 divide-y divide-[#e4ddd0]">
          {canChangeStatus ? (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2d2d2d]">
                  {user.isActive ? "Deactivate account" : "Activate account"}
                </p>
                <p className="text-xs text-[#777777]">
                  {user.isActive
                    ? "Blocks sign-in and signs them out everywhere. Their history is kept and you can reactivate them later."
                    : "Lets them sign in again."}
                </p>
              </div>

              {user.isActive ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSelf || actions.setStatus.isPending}
                  title={isSelf ? "You can't deactivate your own account." : undefined}
                  onClick={() => setConfirm("deactivate")}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={actions.setStatus.isPending}
                  onClick={() => changeStatus(true)}
                  className="bg-[#8b6f47] text-white hover:bg-[#6f5636]"
                >
                  Activate
                </Button>
              )}
            </li>
          ) : null}

          {canEdit && locked ? (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2d2d2d]">
                  Unlock account
                </p>
                <p className="text-xs text-[#777777]">
                  Locked after too many failed sign-ins, until{" "}
                  {formatDateTime(user.lockedUntil)}.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={actions.unlock.isPending}
                onClick={unlock}
              >
                Unlock
              </Button>
            </li>
          ) : null}

          {canEdit ? (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2d2d2d]">
                  Reset password
                </p>
                <p className="text-xs text-[#777777]">
                  Emails a new temporary password and signs them out
                  everywhere.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={actions.resetPassword.isPending}
                onClick={() => setConfirm("reset")}
              >
                Reset password
              </Button>
            </li>
          ) : null}

          {canDelete ? (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#a4372f]">
                  Delete user
                </p>
                <p className="text-xs text-[#777777]">
                  Permanently removes the account. This can&apos;t be undone;
                  deactivate instead to keep the option of coming back.
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                disabled={isSelf || actions.remove.isPending}
                title={isSelf ? "You can't delete your own account." : undefined}
                onClick={() => setConfirm("delete")}
              >
                Delete
              </Button>
            </li>
          ) : null}
        </ul>
      </section>

      <ConfirmDialog
        open={confirm === "deactivate"}
        title="Deactivate this account?"
        description={`${user.firstName} ${user.lastName} will be signed out everywhere and won't be able to sign in until you activate the account again.`}
        confirmLabel="Deactivate"
        pending={actions.setStatus.isPending}
        onConfirm={() => changeStatus(false)}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === "reset"}
        title="Reset this password?"
        description={`A new temporary password will be emailed to ${user.email}, and ${user.firstName} will be signed out everywhere. They must choose a new password at their next sign-in.`}
        confirmLabel="Reset password"
        pending={actions.resetPassword.isPending}
        onConfirm={resetPassword}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete this user?"
        description={`${user.firstName} ${user.lastName} (${user.email}) will be permanently deleted. Their past activity stays on record but is no longer linked to an account. This can't be undone.`}
        confirmLabel="Delete user"
        destructive
        pending={actions.remove.isPending}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
