// Minimal observability baseline. Before this, the app had zero server-side
// error logging anywhere — failures were only ever recorded into a DB field
// (EmailMessage.error, AutomationRun.error) that nothing watches in real
// time; nobody running the deployment would see a failure as it happened.
// This does not replace a real APM (Sentry etc.) — that's a bigger
// commercial-readiness decision (see docs). It gives every call site a
// single, consistent shape so swapping in a real provider later is a
// one-file change, not a repo-wide one.
export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      context,
      message,
      stack,
      meta,
      timestamp: new Date().toISOString(),
    }),
  );
}
