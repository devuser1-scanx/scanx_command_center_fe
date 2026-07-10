"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth-schema";
import { normalizeApiError } from "@/lib/api/api-error";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";

export function ForgotPasswordForm() {
  const mutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const isLoading = isSubmitting || mutation.isPending;

  async function onSubmit(
    values: ForgotPasswordFormValues,
  ): Promise<void> {
    try {
      const response = await mutation.mutateAsync({
        email: values.email.trim(),
      });

      toast.success(
        response.message ||
          "If the account exists, reset instructions have been sent.",
      );
    } catch (error) {
      toast.error(
        normalizeApiError(
          error,
          "Unable to submit the password reset request.",
        ).message,
      );
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
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={
            errors.email ? "email-error" : undefined
          }
          {...register("email")}
          className={[
            "h-12 w-full rounded-md border bg-white px-[14px] text-sm text-[#2d2d2d]",
            "outline-none transition-[border-color,box-shadow]",
            "placeholder:text-[#aaaaaa]",
            "focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15",
            "disabled:cursor-not-allowed disabled:bg-[#eeeeee]",
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
            Sending instructions...
          </>
        ) : (
          "Send reset instructions"
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
