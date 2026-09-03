// components/users/user-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRolesList } from "@/features/roles/hooks/use-roles-list";
import { useCreateUser } from "@/features/users/hooks/use-create-user";
import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/features/users/schemas/user-schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { ADMIN_ROUTES } from "@/lib/constants/routes";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-11 w-full rounded-md border bg-white px-3 text-sm text-[#2d2d2d] outline-none transition-[border-color,box-shadow] placeholder:text-[#aaaaaa] focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15 disabled:cursor-not-allowed disabled:bg-[#f5f5f5]";

function fieldBorder(hasError: boolean) {
  return hasError ? "border-[#cc3333]" : "border-[#dddddd]";
}

export function UserForm() {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("users.create");

  const rolesQuery = useRolesList();
  const mutation = useCreateUser();

  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [roleError, setRoleError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
    },
    mode: "onTouched",
  });

  const isLoading = isSubmitting || mutation.isPending;

  function toggleRole(code: string) {
    setRoleCodes((current) =>
      current.includes(code)
        ? current.filter((existing) => existing !== code)
        : [...current, code],
    );
    setRoleError(null);
  }

  async function onSubmit(values: CreateUserFormValues): Promise<void> {
    if (roleCodes.length === 0) {
      setRoleError("Select at least one role.");
      return;
    }

    try {
      await mutation.mutateAsync({
        email: values.email,
        firstName: values.first_name,
        lastName: values.last_name,
        phone: values.phone || undefined,
        roleCodes,
      });

      toast.success(
        "User created. A temporary password has been emailed to them.",
      );

      router.push(ADMIN_ROUTES.users);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "Unable to create the user.").message,
      );
    }
  }

  if (!canCreate) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#e4ddd0] bg-white p-5 text-sm text-[#cc3333] shadow-sm"
      >
        You don&apos;t have permission to create users.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#2d2d2d]">
          Account details
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="mb-1.5 block text-xs font-semibold uppercase text-[#999999]"
            >
              First name
            </label>
            <input
              id="first_name"
              disabled={isLoading}
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
            <label
              htmlFor="last_name"
              className="mb-1.5 block text-xs font-semibold uppercase text-[#999999]"
            >
              Last name
            </label>
            <input
              id="last_name"
              disabled={isLoading}
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
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold uppercase text-[#999999]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email")}
              className={cn(inputClasses, fieldBorder(Boolean(errors.email)))}
            />
            {errors.email ? (
              <p role="alert" className="mt-1.5 text-xs text-[#cc3333]">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-semibold uppercase text-[#999999]"
            >
              Phone <span className="normal-case text-[#bbbbbb]">(optional)</span>
            </label>
            <input
              id="phone"
              disabled={isLoading}
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
        </div>

        <p className="mt-4 text-xs text-[#999999]">
          A temporary password is generated automatically and emailed to
          the user — they&apos;ll be asked to set a new one on first login.
        </p>
      </section>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
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
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                  roleCodes.includes(role.code)
                    ? "border-[#8b6f47] bg-[#faf6ef] text-[#2d2d2d]"
                    : "border-[#dddddd] text-[#555555] hover:border-[#8b6f47]/50",
                )}
              >
                <input
                  type="checkbox"
                  disabled={isLoading}
                  checked={roleCodes.includes(role.code)}
                  onChange={() => toggleRole(role.code)}
                  className="size-4 accent-[#8b6f47]"
                />
                {role.name}
              </label>
            ))}
          </div>
        ) : null}

        {roleError ? (
          <p role="alert" className="mt-2 text-xs text-[#cc3333]">
            {roleError}
          </p>
        ) : null}
      </section>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => router.push(ADMIN_ROUTES.users)}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#8b6f47] text-white hover:bg-[#6f5636]"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Creating user…
            </>
          ) : (
            "Create user"
          )}
        </Button>
      </div>
    </form>
  );
}
