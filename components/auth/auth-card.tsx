// components/auth/auth-card.tsx

import type { ReactNode } from "react";

import {
  SCANX_LOGO_BASE64,
} from "@/lib/constants/branding";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  const logoSource = SCANX_LOGO_BASE64
    ? `data:image/png;base64,${SCANX_LOGO_BASE64}`
    : null;

  return (
    <section className="w-full max-w-[500px] rounded-xl bg-[#f5f1e8] px-[22px] py-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:px-10 sm:py-10 lg:px-[60px] lg:py-[60px]">
      <div className="mb-10 text-center">
        <div className="mb-8 flex min-h-[60px] items-center justify-center">
          {logoSource ? (
            <img
              src={logoSource}
              alt="ScanX"
              className="h-[60px] w-auto max-w-[280px] object-contain"
            />
          ) : (
            <div
              aria-label="ScanX"
              className="text-5xl font-bold tracking-tight"
            >
              <span className="text-[#2d2d2d]">
                Scan
              </span>

              <span className="text-[#8b6f47]">
                X
              </span>
            </div>
          )}
        </div>

        <h1 className="text-[28px] font-semibold leading-tight text-[#2d2d2d]">
          {title}
        </h1>

        {description ? (
          <p className="mt-[10px] text-[15px] leading-6 text-[#999999]">
            {description}
          </p>
        ) : null}
      </div>

      {children}

      {footer ? (
        <div className="mt-6 text-center text-sm text-[#999999]">
          {footer}
        </div>
      ) : null}
    </section>
  );
}