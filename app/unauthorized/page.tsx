import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          You do not have permission to access this page. Please contact your administrator.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Go back home
        </Link>
      </div>
    </main>
  );
}
