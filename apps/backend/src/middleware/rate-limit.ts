import { MiddlewareHandler } from "hono";

export const rateLimiter = (): MiddlewareHandler => async (c, next) => {
  const kv = c.env?.RATE_LIMIT_KV;
  const ip = c.req.header("CF-Connecting-IP");
  const key = `rate_limit:${ip}`;

  if (kv) {
    const current = await kv.get(key);
    if (current && parseInt(current) > 100) {
      return c.json({ error: "Rate limit exceeded" }, 429);
    }
    await kv.put(key, (parseInt(current || "0") + 1).toString(), {
      expirationTtl: 60,
    });
  }

  await next();
}; 