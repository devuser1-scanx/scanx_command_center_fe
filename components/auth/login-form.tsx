// components/auth/login-form.tsx

"use client";

import Link from "next/link";
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
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth-schema";
import { getRoleRedirectPath } from "@/features/auth/utils/role-redirect";
import { normalizeApiError } from "@/lib/api/api-error";
import {
  AUTHENTICATED_ROUTES,
  PUBLIC_ROUTES,
} from "@/lib/constants/routes";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },

    mode: "onTouched",
  });

  const isLoading =
    isSubmitting || loginMutation.isPending;

  async function onSubmit(
    values: LoginFormValues,
  ): Promise<void> {
    try {
      const result =
        await loginMutation.mutateAsync({
          email: values.email.trim(),
          password: values.password,
        });

      toast.success("Signed in successfully.");

      if (result.user.must_change_password) {
        router.replace(
          AUTHENTICATED_ROUTES.changePassword,
        );

        return;
      }

      router.replace(
        getRoleRedirectPath(result.user.role),
      );

      router.refresh();
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "Unable to sign in. Please check your email and password.",
      );

      toast.error(apiError.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-[25px]"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[#2d2d2d]"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          disabled={isLoading}
          placeholder="admin@scanxhealth.com"
          aria-invalid={
            errors.email ? "true" : "false"
          }
          aria-describedby={
            errors.email
              ? "email-error"
              : undefined
          }
          {...register("email")}
          className={[
            "h-[48px] w-full rounded-md border bg-white px-[14px] text-sm text-[#2d2d2d]",
            "outline-none transition-[border-color,box-shadow]",
            "placeholder:text-[#aaaaaa]",
            "focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15",
            "disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-[#999999]",
            errors.email
              ? "border-[#cc3333]"
              : "border-[#dddddd]",
          ].join(" ")}
        />

        {errors.email ? (
          <p
            id="email-error"
            role="alert"
            className="mt-2 text-sm text-[#cc3333]"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[#2d2d2d]"
          >
            Password
          </label>

          <Link
            href={PUBLIC_ROUTES.forgotPassword}
            className="text-sm font-medium text-[#8b6f47] underline-offset-4 transition-colors hover:text-[#6f5636] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47]"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="Enter your password"
            aria-invalid={
              errors.password ? "true" : "false"
            }
            aria-describedby={
              errors.password
                ? "password-error"
                : undefined
            }
            {...register("password")}
            className={[
              "h-[48px] w-full rounded-md border bg-white px-[14px] pr-12 text-sm text-[#2d2d2d]",
              "outline-none transition-[border-color,box-shadow]",
              "placeholder:text-[#aaaaaa]",
              "focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15",
              "disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-[#999999]",
              errors.password
                ? "border-[#cc3333]"
                : "border-[#dddddd]",
            ].join(" ")}
          />

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setShowPassword(
                (current) => !current,
              );
            }}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="absolute right-[14px] top-1/2 -translate-y-1/2 rounded-sm text-[#999999] transition-colors hover:text-[#8b6f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff
                aria-hidden="true"
                className="size-5"
              />
            ) : (
              <Eye
                aria-hidden="true"
                className="size-5"
              />
            )}
          </button>
        </div>

        {errors.password ? (
          <p
            id="password-error"
            role="alert"
            className="mt-2 text-sm text-[#cc3333]"
          >
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {loginMutation.error ? (
        <div
          role="alert"
          className="rounded-md bg-[#ffeeee] px-3 py-3 text-sm text-[#cc3333]"
        >
          {loginMutation.error.message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-[52px] w-full rounded-md bg-[#8b6f47] text-base font-semibold text-white shadow-none transition-colors hover:bg-[#6f5636] focus-visible:ring-[#8b6f47] disabled:bg-[#cccccc] disabled:text-white"
      >
        {isLoading ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />

            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}