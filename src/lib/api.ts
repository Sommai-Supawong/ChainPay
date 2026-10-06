import "server-only";
import { ZodError } from "zod";
import { AppError, requireValue } from "@/lib/errors";

export function appOrigin() {
  return new URL(
    requireValue(process.env.NEXT_PUBLIC_APP_URL, "Application URL"),
  ).origin;
}
export function assertOrigin(request: Request) {
  if (request.headers.get("origin") !== appOrigin())
    throw new AppError(403, "This request is not allowed from this origin.");
}
export async function body(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError(415, "Send a JSON request.");
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, "A JSON body is required.");
  const decoder = new TextDecoder();
  let text = "",
    size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16_384) {
      await reader.cancel();
      throw new AppError(413, "Request is too large.");
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError(400, "Invalid JSON request.");
  }
}
export function json(value: unknown, status = 200) {
  return new Response(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}
export function endpoint(work: (request: Request) => Promise<unknown>) {
  return async (request: Request) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) assertOrigin(request);
      return json(await work(request));
    } catch (error) {
      if (error instanceof ZodError)
        return json(
          { error: error.issues[0]?.message ?? "Invalid input." },
          400,
        );
      if (error instanceof AppError)
        return json({ error: error.message }, error.status);
      const cause =
        error && typeof error === "object" && "cause" in error
          ? error.cause
          : error;
      const code =
        cause && typeof cause === "object" && "code" in cause
          ? cause.code
          : undefined;
      if (code === "23505" || code === "23503")
        return json(
          {
            error:
              "This record conflicts with an existing record. Refresh and try again.",
          },
          409,
        );
      console.error(
        JSON.stringify({
          event: "request_failed",
          requestId: crypto.randomUUID(),
          path: new URL(request.url).pathname,
          category: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }),
      );
      if (
        request.method === "POST" &&
        new URL(request.url).pathname === "/api/transactions"
      )
        return json(
          {
            error:
              "We could not save this submitted payment. Keep its transaction hash and retry saving; do not pay again.",
          },
          503,
        );
      return json(
        { error: "We could not complete this request. Please try again." },
        500,
      );
    }
  };
}
