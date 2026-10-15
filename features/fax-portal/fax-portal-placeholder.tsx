// features/fax-portal/fax-portal-placeholder.tsx

import Link from "next/link";

import { FAX_PORTAL_ROUTES } from "@/lib/constants/routes";

type FaxPortalPlaceholderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

/**
 * Stand-in for FAX Portal screens that are built in later phases, so the
 * sidebar routes all resolve to a real page.
 */
export function FaxPortalPlaceholder({
  title,
  description,
  children,
}: FaxPortalPlaceholderProps) {
  return (
    <div className="rounded-lg border border-[#e6dfd3] bg-white px-6 py-10 text-center">
      <h2 className="text-xl font-bold text-[#1f2329]">{title}</h2>

      <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b6f78]">
        {description}
      </p>

      {children}

      <p className="mt-6 text-xs text-[#777777]">
        This screen is under development.{" "}
        <Link
          href={FAX_PORTAL_ROUTES.board}
          className="font-semibold text-[#8b6f47] underline-offset-2 hover:underline"
        >
          Back to the Referral Board
        </Link>
      </p>
    </div>
  );
}
