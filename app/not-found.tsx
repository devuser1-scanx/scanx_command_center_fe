import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Go back home
        </Link>
      </div>
    </main>
  );
}