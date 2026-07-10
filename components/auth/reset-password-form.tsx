"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth-schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useResetPassword();

  const token = searchParams.get("token") ?? "";

  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    values: {
      token,
      new_password: "",
      confirm_new_password: "",
    },
    mode: "onTouched",
  });

  const isLoading = isSubmitting || mutation.isPending;

  async function onSubmit(
    values: ResetPasswordFormValues,
  ): Promise<void> {
    try {
      const response = await mutation.mutateAsync({
        token: values.token,
        new_password: values.new_password,
      });

      toast.success(
        response.message ||
          "Your password has been reset successfully.",
      );

      router.replace(PUBLIC_ROUTES.login);
    } catch (error) {
      toast.error(
        normalizeApiError(
          error,
          "Unable to reset the password.",
        ).message,
      );
    }
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <div
          role="alert"
          className="rounded-md bg-[#ffeeee] px-3 py-3 text-sm text-[#cc3333]"
        >
          The reset link is missing its token or is invalid.
        </div>

        <Link
          href={PUBLIC_ROUTES.forgotPassword}
          className="block text-center text-sm font-medium text-[#8b6f47] underline-offset-4 hover:text-[#6f5636] hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-[25px]"
    >
      <input type="hidden" {...register("token")} />

      <PasswordField
        id="new_password"
        label="New password"
        autoComplete="new-password"
        showPassword={showNewPassword}
        setShowPassword={setShowNewPassword}
        disabled={isLoading}
        error={errors.new_password?.message}
        register={register("new_password")}
      />

      <PasswordField
        id="confirm_new_password"
        label="Confirm new password"
        autoComplete="new-password"
        showPassword={showConfirmation}
        setShowPassword={setShowConfirmation}
        disabled={isLoading}
        error={errors.confirm_new_password?.message}
        register={register("confirm_new_password")}
      />

      {mutation.error ? (
        <div
          role="alert"
          className="rounded-md bg-[#ffeeee] px-3 py-3 text-sm text-[#cc3333]"
        >
          {mutation.error.message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-[52px] w-full rounded-md bg-[#8b6f47] text-base font-semibold text-white hover:bg-[#6f5636] disabled:bg-[#cccccc]"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Resetting password...
          </>
        ) : (
          "Reset password"
        )}
      </Button>

      <div className="text-center">
        <Link
          href={PUBLIC_ROUTES.login}
          className="text-sm font-medium text-[#8b6f47] underline-offset-4 hover:text-[#6f5636] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  autoComplete: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  disabled: boolean;
  error?: string;
  register: ReturnType<
    ReturnType<typeof useForm<ResetPasswordFormValues>>["register"]
  >;
};

function PasswordField({
  id,
  label,
  autoComplete,
  showPassword,
  setShowPassword,
  disabled,
  error,
  register,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[#2d2d2d]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={label}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register}
          className={[
            "h-12 w-full rounded-md border bg-white px-[14px] pr-12 text-sm text-[#2d2d2d]",
            "outline-none transition-[border-color,box-shadow]",
            "placeholder:text-[#aaaaaa]",
            "focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15",
            "disabled:cursor-not-allowed disabled:bg-[#eeeeee]",
            error
              ? "border-[#cc3333]"
              : "border-[#dddddd]",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          aria-label={
            showPassword ? "Hide password" : "Show password"
          }
          className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#8b6f47]"
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-[#cc3333]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
