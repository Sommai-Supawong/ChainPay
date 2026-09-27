export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: options.method ?? "GET",
    headers:
      options.body === undefined
        ? undefined
        : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
export function friendlyError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  if (/reject|denied|cancelled|popup-closed/i.test(message))
    return "The request was cancelled. You can try again when ready.";
  if (/insufficient funds/i.test(message))
    return "Your wallet needs enough ETH for the payment and network fee.";
  if (/connector.*not.*found|provider.*not.*found/i.test(message))
    return "MetaMask was not detected. Install it or open this page in the MetaMask browser.";
  return message.length > 240
    ? "Your wallet could not complete this request. Check the network and balance, then try again."
    : message;
}
