"use server";

// A client-side error (e.g. a network failure caught by the root error
// boundary) never touches the server, so it leaves no trace in Vercel's
// logs on its own. This gives it one, without adding an external
// error-tracking dependency.
export async function reportClientError(context: string, message: string, digest?: string) {
  console.error(`[client error] ${context}: ${message}`, digest ? `digest=${digest}` : "");
}
