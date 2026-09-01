// Best-effort detection of a fetch that failed for network reasons (offline,
// interface changed mid-request, DNS blip) rather than an application error.
// Browsers don't agree on wording — Chrome: "Failed to fetch", Firefox:
// "NetworkError when attempting to fetch resource", Safari: "Load failed" —
// so this is a heuristic, not exhaustive.
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && /fetch|network|load failed/i.test(error.message);
}
