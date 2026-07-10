"use client";

import { useRouter } from "next/navigation";
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
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/auth-schema";
import { getRoleRedirectPath } from "@/features/auth/utils/role-redirect";
import { normalizeApiError } from "@/lib/api/api-error";
import { useAuthStore } from "@/lib/auth/auth-store";

export function ChangePasswordForm() {
  const router = useRouter();
  const mutation = useChangePassword();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
    mode: "onTouched",
  });

  const isLoading = isSubmitting || mutation.isPending;

  async function onSubmit(
    values: ChangePasswordFormValues,
  ): Promise<void> {
    console.log("Form submitted with values:", values);
    try {
      const response = await mutation.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_new_password: values.confirm_new_password,
      });
      console.log("Change password successful:", response);

      if (user) {
        setUser({
          ...user,
          must_change_password: false,
        });
      }

      toast.success(
        response.message ||
          "Your password has been changed successfully.",
      );

      if (user) {
        router.replace(getRoleRedirectPath(user.role));
      }
    } catch (error) {
      console.error("Change password failed:", error);
      toast.error(
        normalizeApiError(
          error,
          "Unable to change the password.",
        ).message,
      );
    }
  }

  function onError(errors: any) {
    console.error("Form validation errors:", errors);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      noValidate
      className="space-y-[25px]"
    >
      <Field
        id="current_password"
        label="Current password"
        autoComplete="current-password"
        showPassword={showCurrentPassword}
        onToggle={() =>
          setShowCurrentPassword((value) => !value)
        }
        disabled={isLoading}
        error={errors.current_password?.message}
        inputProps={register("current_password")}
      />

      <Field
        id="new_password"
        label="New password"
        autoComplete="new-password"
        showPassword={showNewPassword}
        onToggle={() =>
          setShowNewPassword((value) => !value)
        }
        disabled={isLoading}
        error={errors.new_password?.message}
        inputProps={register("new_password")}
      />

      <Field
        id="confirm_new_password"
        label="Confirm new password"
        autoComplete="new-password"
        showPassword={showConfirmation}
        onToggle={() =>
          setShowConfirmation((value) => !value)
        }
        disabled={isLoading}
        error={errors.confirm_new_password?.message}
        inputProps={register("confirm_new_password")}
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
            Changing password...
          </>
        ) : (
          "Change password"
        )}
      </Button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  autoComplete: string;
  showPassword: boolean;
  onToggle: () => void;
  disabled: boolean;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
};

function Field({
  id,
  label,
  autoComplete,
  showPassword,
  onToggle,
  disabled,
  error,
  inputProps,
}: FieldProps) {
  return (
    <div>
          <label
              htmlFor={id}
              className="mb-2 block text-sm font-medium text-[#2d2d2d]"
    >
      {label}
      <span
        aria-hidden="true"
        className="ml-1 text-[#cc3333]"
      >
        *
      </span>

      <span className="sr-only">
        required
      </span>
    </label>

      <div className="relative">
        <input
          id={id}
          required
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={label}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
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
          onClick={onToggle}
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
