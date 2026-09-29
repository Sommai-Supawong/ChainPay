import { z } from "zod";
import { endpoint, body } from "@/lib/api";
import { currentUser, requireUser } from "@/lib/auth/session";
import { createSession, logout } from "@/features/auth/server";
import {
  challenge,
  verifyWallet,
  listWallets,
  changeWallet,
} from "@/features/wallet/server";
import {
  createRequest,
  getRequest,
  listRequests,
  changeRequest,
  publicRequest,
} from "@/features/payment-request/server";
import {
  createIntent,
  submitTransaction,
  verifyTransaction,
  listTransactions,
  receiptData,
} from "@/features/payment/server";
import {
  listContacts,
  saveContact,
  removeContact,
  updateProfile,
} from "@/features/contact/server";
import {
  challengeSchema,
  signatureSchema,
  idSchema,
  requestSchema,
  intentSchema,
  submitSchema,
  hashSchema,
  contactSchema,
  profileSchema,
  slugSchema,
} from "@/lib/validation";
import { AppError } from "@/lib/errors";
import { themeSchema } from "@/lib/validation";
import { updateTheme } from "@/features/theme/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// One HTTP boundary, with domain operations kept in separate feature services.
const handle = endpoint(async (request) => {
  const parts = new URL(request.url).pathname.slice(5).split("/");
  const path = parts.join("/");
  const method = request.method;
  if (path === "auth/session" && method === "POST")
    return createSession(request);
  if (
    (path === "auth/session" && method === "DELETE") ||
    (path === "auth/logout" && method === "POST")
  )
    return logout();
  if (parts[0] === "public" && parts.length === 2 && method === "GET")
    return publicRequest(slugSchema.parse(parts[1]));
  if (path === "payment-intents" && method === "POST") {
    const input = intentSchema.parse(await body(request));
    const user = input.slug ? await currentUser() : await requireUser();
    await rateLimit(`intent:${user?.id ?? clientKey(request)}`, 20);
    return createIntent(user?.id ?? null, input);
  }
  if (path === "transactions" && method === "POST") {
    await rateLimit(`submit:${clientKey(request)}`, 60);
    return submitTransaction(submitSchema.parse(await body(request)));
  }
  if (parts[0] === "transactions" && parts.length >= 2) {
    const hash = hashSchema.parse(parts[1]);
    if (parts.length === 3 && parts[2] === "verify" && method === "POST") {
      await rateLimit(`verify:${clientKey(request)}`, 60);
      return verifyTransaction(hash);
    }
    if (parts.length === 2 && method === "GET")
      return receiptData(hash, (await currentUser())?.id ?? null);
  }
  const user = await requireUser();
  if (path === "auth/me" && method === "GET")
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      accountType: user.accountType,
    };
  if (path === "profile" && method === "PATCH")
    return updateProfile(user.id, profileSchema.parse(await body(request)));
  if (path === "settings/theme" && method === "PATCH")
    return updateTheme(user.id, themeSchema.parse(await body(request)).theme);
  if (path === "wallets/challenge" && method === "POST")
    return challenge(
      user.id,
      challengeSchema.parse(await body(request)).address,
    );
  if (path === "wallets/verify" && method === "POST") {
    const input = signatureSchema.parse(await body(request));
    return verifyWallet(user.id, input.id, input.signature as `0x${string}`);
  }
  if (path === "wallets" && method === "GET") return listWallets(user.id);
  if (
    parts[0] === "wallets" &&
    parts.length === 2 &&
    ["PATCH", "DELETE"].includes(method)
  )
    return changeWallet(user.id, idSchema.parse(parts[1]), method === "DELETE");
  if (path === "payment-requests") {
    if (method === "GET") return listRequests(user.id);
    if (method === "POST")
      return createRequest(user.id, requestSchema.parse(await body(request)));
  }
  if (parts[0] === "payment-requests" && parts.length === 2) {
    const id = idSchema.parse(parts[1]);
    if (method === "GET") return getRequest(id, user.id);
    if (method === "PATCH")
      return changeRequest(
        user.id,
        id,
        z
          .object({ status: z.enum(["active", "cancelled"]) })
          .parse(await body(request)).status,
      );
  }
  if (path === "transactions" && method === "GET")
    return listTransactions(user.id);
  if (path === "contacts") {
    if (method === "GET") return listContacts(user.id);
    if (method === "POST")
      return saveContact(user.id, contactSchema.parse(await body(request)));
  }
  if (parts[0] === "contacts" && parts.length === 2) {
    const id = idSchema.parse(parts[1]);
    if (method === "PATCH")
      return saveContact(user.id, contactSchema.parse(await body(request)), id);
    if (method === "DELETE") return removeContact(user.id, id);
  }
  throw new AppError(404, "Endpoint not found.");
});
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
