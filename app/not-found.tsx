import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The tool you&apos;re looking for doesn&apos;t exist or has moved. Try
        searching with the command palette.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted active:scale-95"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
