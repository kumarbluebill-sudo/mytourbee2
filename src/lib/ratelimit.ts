import "server-only";

const g = globalThis as unknown as { __tbRl?: Map<string, number[]> };
const hits = (g.__tbRl ??= new Map<string, number[]>());

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** Sliding-window limiter, in memory. Returns true when the request should be rejected. */
export function limited(req: Request, bucket: string, max: number, windowMs: number) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}
