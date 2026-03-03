export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border">
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M10.5 6.5a7.5 7.5 0 017.538 6.293M1.5 8.5A14.25 14.25 0 0112 3c2.76 0 5.326.786 7.5 2.143M5.106 11.606A7.5 7.5 0 0112 9c1.27 0 2.47.314 3.52.868M8.288 14.712a4.5 4.5 0 015.424 0M12 18h.01"
          />
        </svg>
      </div>
      <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        This page hasn&apos;t been cached yet. Connect to the internet and try again,
        or go back to a page you&apos;ve visited before.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Go back
      </button>
    </div>
  );
}
